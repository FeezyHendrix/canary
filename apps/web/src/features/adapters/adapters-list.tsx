import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreVertical, Trash2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toaster';
import { ADAPTER_DISPLAY_NAMES, type Adapter, type AdapterType } from '@canary/shared';

export function AdaptersList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adapters'],
    queryFn: () => api.get<{ success: boolean; data: Adapter[] }>('/api/adapters'),
  });

  const adapters = data?.data || [];

  const testMutation = useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean; data: { success: boolean; message: string } }>(
        `/api/adapters/${id}/test`
      ),
    onSuccess: (response) => {
      if (response.data?.success) {
        toast({ title: 'Connection successful', description: response.data.message });
      } else {
        toast({
          title: 'Connection failed',
          description: response.data?.message,
          variant: 'destructive',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['adapters'] });
    },
    onError: () => {
      toast({ title: 'Test failed', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/adapters/${id}`),
    onSuccess: () => {
      toast({ title: 'Adapter deleted' });
      queryClient.invalidateQueries({ queryKey: ['adapters'] });
    },
    onError: () => {
      toast({ title: 'Failed to delete adapter', variant: 'destructive' });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this adapter?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Adapters</h1>
          <p className="text-muted-foreground">Configure your email sending providers</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Adapter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : adapters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No adapters configured</p>
            <Button>Add your first adapter</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adapters.map((adapter) => (
            <Card key={adapter.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {adapter.name}
                      {adapter.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {ADAPTER_DISPLAY_NAMES[adapter.type as AdapterType]}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => testMutation.mutate(adapter.id)}>
                        <Zap className="mr-2 h-4 w-4" />
                        Test Connection
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(adapter.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {adapter.lastTestSuccess === true && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Connected</span>
                    </>
                  )}
                  {adapter.lastTestSuccess === false && (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Connection failed</span>
                    </>
                  )}
                  {adapter.lastTestSuccess === null && (
                    <span className="text-muted-foreground">Not tested</span>
                  )}
                </div>
                {adapter.defaultFrom && (
                  <p className="text-xs text-muted-foreground mt-2">From: {adapter.defaultFrom}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
