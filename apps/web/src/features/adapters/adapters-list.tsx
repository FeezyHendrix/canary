import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreVertical, Trash2, CheckCircle, XCircle, Zap, X, Edit, Star } from 'lucide-react';
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
  ADAPTER_DISPLAY_NAMES,
  ADAPTER_TYPE_LIST,
  ADAPTER_DESCRIPTIONS,
  type Adapter,
  type AdapterType,
} from '@canary/shared';

const ADAPTER_CONFIG_FIELDS: Record<
  AdapterType,
  {
    name: string;
    label: string;
    type: 'text' | 'password';
    required: boolean;
    placeholder?: string;
  }[]
> = {
  sendgrid: [
    { name: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'SG.xxxx' },
  ],
  resend: [
    { name: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 're_xxxx' },
  ],
  mailgun: [
    { name: 'apiKey', label: 'API Key', type: 'password', required: true },
    {
      name: 'domain',
      label: 'Domain',
      type: 'text',
      required: true,
      placeholder: 'mg.example.com',
    },
    { name: 'region', label: 'Region', type: 'text', required: false, placeholder: 'us or eu' },
  ],
  ses: [
    { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
    { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
    { name: 'region', label: 'Region', type: 'text', required: true, placeholder: 'us-east-1' },
  ],
  postmark: [{ name: 'serverToken', label: 'Server Token', type: 'password', required: true }],
  smtp: [
    {
      name: 'host',
      label: 'SMTP Host',
      type: 'text',
      required: true,
      placeholder: 'smtp.example.com',
    },
    { name: 'port', label: 'Port', type: 'text', required: true, placeholder: '587' },
    { name: 'username', label: 'Username', type: 'text', required: false },
    { name: 'password', label: 'Password', type: 'password', required: false },
    {
      name: 'secure',
      label: 'Use TLS',
      type: 'text',
      required: false,
      placeholder: 'true or false',
    },
  ],
};

export function AdaptersList() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<AdapterType | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    defaultFrom: string;
    config: Record<string, string>;
  }>({ name: '', defaultFrom: '', config: {} });
  const [editingAdapter, setEditingAdapter] = useState<Adapter | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    defaultFrom: string;
    config: Record<string, string>;
    isDefault: boolean;
  }>({ name: '', defaultFrom: '', config: {}, isDefault: false });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      type: AdapterType;
      config: Record<string, string>;
      defaultFrom?: string;
    }) => api.post('/api/adapters', data),
    onSuccess: () => {
      toast({ title: 'Adapter created' });
      queryClient.invalidateQueries({ queryKey: ['adapters'] });
      setShowAddModal(false);
      setSelectedType(null);
      setFormData({ name: '', defaultFrom: '', config: {} });
    },
    onError: () => {
      toast({ title: 'Failed to create adapter', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        defaultFrom?: string;
        config?: Record<string, string>;
        isDefault?: boolean;
      };
    }) => api.put(`/api/adapters/${id}`, data),
    onSuccess: () => {
      toast({ title: 'Adapter updated' });
      queryClient.invalidateQueries({ queryKey: ['adapters'] });
      setEditingAdapter(null);
      setEditFormData({ name: '', defaultFrom: '', config: {}, isDefault: false });
    },
    onError: () => {
      toast({ title: 'Failed to update adapter', variant: 'destructive' });
    },
  });

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleEdit = (adapter: Adapter) => {
    setEditingAdapter(adapter);
    setEditFormData({
      name: adapter.name,
      defaultFrom: adapter.defaultFrom || '',
      config: {},
      isDefault: adapter.isDefault,
    });
  };

  const handleUpdate = () => {
    if (!editingAdapter || !editFormData.name) {
      toast({ title: 'Please fill in adapter name', variant: 'destructive' });
      return;
    }
    const updateData: {
      name?: string;
      defaultFrom?: string;
      config?: Record<string, string>;
      isDefault?: boolean;
    } = {
      name: editFormData.name,
      defaultFrom: editFormData.defaultFrom || undefined,
      isDefault: editFormData.isDefault,
    };
    if (Object.keys(editFormData.config).length > 0) {
      updateData.config = editFormData.config;
    }
    updateMutation.mutate({ id: editingAdapter.id, data: updateData });
  };

  const resetEditForm = () => {
    setEditingAdapter(null);
    setEditFormData({ name: '', defaultFrom: '', config: {}, isDefault: false });
  };

  const handleCreate = () => {
    if (!selectedType || !formData.name) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    createMutation.mutate({
      name: formData.name,
      type: selectedType,
      config: formData.config,
      defaultFrom: formData.defaultFrom || undefined,
    });
  };

  const resetForm = () => {
    setShowAddModal(false);
    setSelectedType(null);
    setFormData({ name: '', defaultFrom: '', config: {} });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Adapters</h1>
          <p className="text-muted-foreground">Configure your email sending providers</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Adapter
        </Button>
      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Adapter"
        description="Are you sure you want to delete this adapter? Any templates using it will need to be reassigned to a different provider."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (confirmDeleteId) deleteMutation.mutate(confirmDeleteId, { onSettled: () => setConfirmDeleteId(null) });
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {selectedType
                  ? `Configure ${ADAPTER_DISPLAY_NAMES[selectedType]}`
                  : 'Select Provider'}
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {!selectedType ? (
                <div className="grid gap-3">
                  {ADAPTER_TYPE_LIST.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="flex flex-col items-start p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className="font-medium">{ADAPTER_DISPLAY_NAMES[type]}</span>
                      <span className="text-sm text-muted-foreground">
                        {ADAPTER_DESCRIPTIONS[type]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adapter-name">Adapter Name</Label>
                    <Input
                      id="adapter-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My SendGrid Account"
                    />
                  </div>
                  <div>
                    <Label htmlFor="default-from">Default From Email</Label>
                    <Input
                      id="default-from"
                      type="email"
                      value={formData.defaultFrom}
                      onChange={(e) => setFormData({ ...formData, defaultFrom: e.target.value })}
                      placeholder="noreply@example.com"
                    />
                  </div>
                  {ADAPTER_CONFIG_FIELDS[selectedType].map((field) => (
                    <div key={field.name}>
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Input
                        id={field.name}
                        type={field.type}
                        value={formData.config[field.name] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            config: { ...formData.config, [field.name]: e.target.value },
                          })
                        }
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setSelectedType(null)}>
                      Back
                    </Button>
                    <Button onClick={handleCreate} disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create Adapter'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingAdapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={resetEditForm} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                Edit {ADAPTER_DISPLAY_NAMES[editingAdapter.type as AdapterType]}
              </h2>
              <button onClick={resetEditForm} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="edit-adapter-name">Adapter Name</Label>
                <Input
                  id="edit-adapter-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="My SendGrid Account"
                />
              </div>
              <div>
                <Label htmlFor="edit-default-from">Default From Email</Label>
                <Input
                  id="edit-default-from"
                  type="email"
                  value={editFormData.defaultFrom}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, defaultFrom: e.target.value })
                  }
                  placeholder="noreply@example.com"
                />
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Update Credentials (optional)</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Leave blank to keep existing credentials
                </p>
                {ADAPTER_CONFIG_FIELDS[editingAdapter.type as AdapterType].map((field) => (
                  <div key={field.name} className="mb-3">
                    <Label htmlFor={`edit-${field.name}`}>{field.label}</Label>
                    <Input
                      id={`edit-${field.name}`}
                      type={field.type}
                      value={editFormData.config[field.name] || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          config: { ...editFormData.config, [field.name]: e.target.value },
                        })
                      }
                      placeholder={field.placeholder || '••••••••'}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t pt-4">
                <input
                  type="checkbox"
                  id="edit-is-default"
                  checked={editFormData.isDefault}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, isDefault: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="edit-is-default" className="font-normal">
                  Set as default adapter
                </Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetEditForm}>
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : adapters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No adapters configured</p>
            <Button onClick={() => setShowAddModal(true)}>Add your first adapter</Button>
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
                      <DropdownMenuItem onClick={() => handleEdit(adapter)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => testMutation.mutate(adapter.id)}>
                        <Zap className="mr-2 h-4 w-4" />
                        Test Connection
                      </DropdownMenuItem>
                      {!adapter.isDefault && (
                        <DropdownMenuItem
                          onClick={() =>
                            updateMutation.mutate({ id: adapter.id, data: { isDefault: true } })
                          }
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
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
