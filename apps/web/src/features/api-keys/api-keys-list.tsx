import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Copy, Trash2, MoreVertical, Edit, RefreshCw, X } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toaster';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  API_KEY_SCOPES,
  type ApiKey,
  type ApiKeyWithFullKey,
  type ApiKeyScope,
} from '@canary/shared';

const SCOPE_LABELS: Record<ApiKeyScope, string> = {
  send: 'Send Emails',
  'templates:read': 'Read Templates',
  'templates:write': 'Write Templates',
  'logs:read': 'Read Logs',
};

export function ApiKeysList() {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    scopes: ApiKeyScope[];
    rateLimit: number;
    isActive: boolean;
  }>({ name: '', scopes: ['send'], rateLimit: 100, isActive: true });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRegenerateId, setConfirmRegenerateId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get<{ success: boolean; data: ApiKey[] }>('/api/api-keys'),
  });

  const apiKeys = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      api.post<{ success: boolean; data: ApiKeyWithFullKey }>('/api/api-keys', { name }),
    onSuccess: (response) => {
      toast({ title: 'API key created' });
      setNewKey(response.data?.key || null);
      setNewKeyName('');
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: () => {
      toast({ title: 'Failed to create API key', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/api-keys/${id}`),
    onSuccess: () => {
      toast({ title: 'API key deleted' });
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: () => {
      toast({ title: 'Failed to delete API key', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; scopes?: ApiKeyScope[]; rateLimit?: number; isActive?: boolean };
    }) => api.put(`/api/api-keys/${id}`, data),
    onSuccess: () => {
      toast({ title: 'API key updated' });
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setEditingKey(null);
    },
    onError: () => {
      toast({ title: 'Failed to update API key', variant: 'destructive' });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean; data: ApiKeyWithFullKey }>(`/api/api-keys/${id}/regenerate`),
    onSuccess: (response) => {
      toast({ title: 'API key regenerated' });
      setNewKey(response.data?.key || null);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: () => {
      toast({ title: 'Failed to regenerate API key', variant: 'destructive' });
    },
  });

  const handleCreate = () => {
    if (!newKeyName.trim()) {
      toast({ title: 'Please enter a key name', variant: 'destructive' });
      return;
    }
    createMutation.mutate(newKeyName);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleEdit = (key: ApiKey) => {
    setEditingKey(key);
    setEditFormData({
      name: key.name,
      scopes: key.scopes as ApiKeyScope[],
      rateLimit: key.rateLimit,
      isActive: key.isActive,
    });
  };

  const handleUpdate = () => {
    if (!editingKey || !editFormData.name) {
      toast({ title: 'Please fill in key name', variant: 'destructive' });
      return;
    }
    updateMutation.mutate({
      id: editingKey.id,
      data: editFormData,
    });
  };

  const handleRegenerate = (id: string) => {
    setConfirmRegenerateId(id);
  };

  const toggleScope = (scope: ApiKeyScope) => {
    setEditFormData((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter((s) => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Manage your API keys for sending emails</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Key
        </Button>
      </div>

      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800 mb-2">
              Your new API key has been created. Copy it now - you won't be able to see it again!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm">
                {newKey}
              </code>
              <Button variant="outline" size="icon" onClick={() => handleCopy(newKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setNewKey(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Production, Staging, etc."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : apiKeys.length === 0 && !showCreateForm ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No API keys created</p>
            <Button onClick={() => setShowCreateForm(true)}>Create your first API key</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <p className="font-medium">{key.name}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-muted-foreground">{key.keyPrefix}...</code>
                    <div className="flex gap-1">
                      {key.scopes.map((scope) => (
                        <span key={scope} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${key.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {key.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {key.lastUsedAt && (
                    <span className="text-sm text-muted-foreground">
                      Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(key)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRegenerate(key.id)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(key.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete API Key"
        description="Are you sure you want to delete this API key? Any applications using it will lose access immediately."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (confirmDeleteId) deleteMutation.mutate(confirmDeleteId, { onSettled: () => setConfirmDeleteId(null) });
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        open={!!confirmRegenerateId}
        title="Regenerate API Key"
        description="Are you sure you want to regenerate this API key? The old key will stop working immediately."
        confirmLabel="Regenerate"
        variant="destructive"
        loading={regenerateMutation.isPending}
        onConfirm={() => {
          if (confirmRegenerateId) regenerateMutation.mutate(confirmRegenerateId, { onSettled: () => setConfirmRegenerateId(null) });
        }}
        onCancel={() => setConfirmRegenerateId(null)}
      />

      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditingKey(null)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Edit API Key</h2>
              <button onClick={() => setEditingKey(null)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="edit-key-name">Key Name</Label>
                <Input
                  id="edit-key-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Production, Staging, etc."
                />
              </div>

              <div>
                <Label>Scopes</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select what this API key can access
                </p>
                <div className="space-y-2">
                  {API_KEY_SCOPES.map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => toggleScope(scope)}
                      className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        editFormData.scopes.includes(scope)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{SCOPE_LABELS[scope]}</span>
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          editFormData.scopes.includes(scope)
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/50'
                        }`}
                      >
                        {editFormData.scopes.includes(scope) && (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-rate-limit">Rate Limit (requests/minute)</Label>
                <Input
                  id="edit-rate-limit"
                  type="number"
                  min={1}
                  max={10000}
                  value={editFormData.rateLimit}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, rateLimit: parseInt(e.target.value) || 100 })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit-is-active" className="font-normal">
                  Key is active
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingKey(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
