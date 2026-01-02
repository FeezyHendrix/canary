import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Webhook as WebhookIcon,
  MoreVertical,
  Trash2,
  Edit,
  Power,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toaster';
import { WEBHOOK_EVENTS, type Webhook, type WebhookEvent } from '@canary/shared';

const EVENT_DESCRIPTIONS: Record<WebhookEvent, string> = {
  'email.queued': 'Email added to send queue',
  'email.sent': 'Email sent to provider',
  'email.delivered': 'Email delivered to recipient',
  'email.opened': 'Recipient opened the email',
  'email.clicked': 'Recipient clicked a link',
  'email.bounced': 'Email bounced',
  'email.failed': 'Email failed to send',
  'email.spam': 'Marked as spam',
};

export function WebhooksList() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    url: string;
    events: WebhookEvent[];
  }>({ name: '', url: '', events: [] });

  const { data, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => api.get<{ success: boolean; data: Webhook[] }>('/api/webhooks'),
  });

  const webhooks = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: { name: string; url: string; events: WebhookEvent[] }) =>
      api.post('/api/webhooks', data),
    onSuccess: () => {
      toast({ title: 'Webhook created' });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to create webhook', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; url?: string; events?: WebhookEvent[]; isActive?: boolean };
    }) => api.put(`/api/webhooks/${id}`, data),
    onSuccess: () => {
      toast({ title: 'Webhook updated' });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to update webhook', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/webhooks/${id}`),
    onSuccess: () => {
      toast({ title: 'Webhook deleted' });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: () => {
      toast({ title: 'Failed to delete webhook', variant: 'destructive' });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (webhook: Webhook) => {
    updateMutation.mutate({
      id: webhook.id,
      data: { isActive: !webhook.isActive },
    });
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast({
        title: 'Please fill in all fields and select at least one event',
        variant: 'destructive',
      });
      return;
    }

    if (editingWebhook) {
      updateMutation.mutate({
        id: editingWebhook.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleEvent = (event: WebhookEvent) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingWebhook(null);
    setFormData({ name: '', url: '', events: [] });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Receive notifications for email events</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="webhook-name">Name</Label>
                <Input
                  id="webhook-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Webhook"
                />
              </div>
              <div>
                <Label htmlFor="webhook-url">Endpoint URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/webhooks/canary"
                />
              </div>
              <div>
                <Label>Events</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select which events will trigger this webhook
                </p>
                <div className="space-y-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <button
                      key={event}
                      type="button"
                      onClick={() => toggleEvent(event)}
                      className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        formData.events.includes(event)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm">{event}</p>
                        <p className="text-xs text-muted-foreground">{EVENT_DESCRIPTIONS[event]}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          formData.events.includes(event)
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/50'
                        }`}
                      >
                        {formData.events.includes(event) && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingWebhook
                      ? 'Save Changes'
                      : 'Create Webhook'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WebhookIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No webhooks configured</p>
            <Button onClick={() => setShowModal(true)}>Add your first webhook</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="flex items-start justify-between py-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{webhook.name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        webhook.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {webhook.consecutiveFailures > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {webhook.consecutiveFailures} failures
                      </span>
                    )}
                  </div>
                  <code className="text-sm text-muted-foreground block">{webhook.url}</code>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <span key={event} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {event}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                    <span>Last triggered: {formatDate(webhook.lastTriggeredAt)}</span>
                    {webhook.lastSuccessAt && (
                      <span>Last success: {formatDate(webhook.lastSuccessAt)}</span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(webhook)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(webhook)}>
                      <Power className="mr-2 h-4 w-4" />
                      {webhook.isActive ? 'Disable' : 'Enable'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(webhook.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
