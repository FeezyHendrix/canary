import { useQuery } from '@tanstack/react-query';
import { Plus, Webhook as WebhookIcon } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Webhook } from '@canary/shared';

export function WebhooksList() {
  const { data, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => api.get<{ success: boolean; data: Webhook[] }>('/api/webhooks'),
  });

  const webhooks = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Receive notifications for email events</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WebhookIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No webhooks configured</p>
            <Button>Add your first webhook</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <p className="font-medium">{webhook.name}</p>
                  <code className="text-sm text-muted-foreground">{webhook.url}</code>
                  <div className="flex gap-1 mt-2">
                    {webhook.events.map((event) => (
                      <span key={event} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {webhook.isActive ? 'Active' : 'Inactive'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
