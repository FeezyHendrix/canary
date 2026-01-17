import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Copy, Trash2, Edit, Mail, FileText } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import type { TemplateListItem, PaginatedResponse } from '@canary/shared';

type TemplateType = 'email' | 'pdf';

export function TemplatesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  // Get active tab from URL query param, default to 'email'
  const activeTab = (searchParams.get('tab') as TemplateType) || 'email';

  const setActiveTab = (tab: TemplateType) => {
    setSearchParams({ tab });
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['templates', search, activeTab],
    queryFn: () =>
      api.get<{
        success: boolean;
        data: PaginatedResponse<TemplateListItem & { generatePdf?: boolean }>;
      }>('/api/templates', {
        params: { search: search || undefined, pageSize: 50 },
      }),
  });

  const allTemplates = data?.data?.items || [];
  const templates = allTemplates.filter((t) =>
    activeTab === 'pdf' ? t.generatePdf : !t.generatePdf
  );

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/api/templates/${id}/duplicate`);
      toast({ title: 'Template duplicated' });
      refetch();
    } catch {
      toast({ title: 'Failed to duplicate template', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/api/templates/${id}`);
      toast({ title: 'Template deleted' });
      refetch();
    } catch {
      toast({ title: 'Failed to delete template', variant: 'destructive' });
    }
  };

  const isEmail = activeTab === 'email';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Create and manage your templates</p>
        </div>
        <Button asChild>
          <Link to={isEmail ? '/templates/new' : '/templates/new?type=pdf'}>
            <Plus className="mr-2 h-4 w-4" />
            New {isEmail ? 'Email' : 'PDF'} Template
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab('email')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'email'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Mail className="h-4 w-4" />
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'pdf'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="h-4 w-4" />
            PDF Templates
          </button>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No {isEmail ? 'email' : 'PDF'} templates found
            </p>
            <Button asChild>
              <Link to={isEmail ? '/templates/new' : '/templates/new?type=pdf'}>
                Create your first {isEmail ? 'email' : 'PDF'} template
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="group relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      <Link to={`/templates/${template.id}`} className="hover:underline">
                        {template.name}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{template.slug}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/templates/${template.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(template.id)}
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
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description || template.subject}
                </p>
                {template.variables && template.variables.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map((v) => (
                      <span key={v} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {`{{${v}}}`}
                      </span>
                    ))}
                    {template.variables.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{template.variables.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
