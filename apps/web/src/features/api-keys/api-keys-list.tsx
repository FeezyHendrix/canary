import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import type { ApiKey, ApiKeyWithFullKey } from '@canary/shared';

export function ApiKeysList() {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

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
    if (confirm('Are you sure you want to delete this API key?')) {
      deleteMutation.mutate(id);
    }
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
                  <code className="text-sm text-muted-foreground">{key.keyPrefix}...</code>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(key.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
