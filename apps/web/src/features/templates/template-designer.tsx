import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Check,
  Loader2,
  Send,
  X,
  History,
  RotateCcw,
  Bookmark,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import { EmailEditor, EditorDocument } from './email-builder';
import type { Template, TemplateVersion } from '@canary/shared';

const DEFAULT_DESIGN: EditorDocument = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#242424',
      fontFamily: 'Inter',
      childrenIds: [],
    },
  },
};

const AUTOSAVE_DELAY = 2000;

export function TemplateDesigner() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = !id;
  const isPdfTemplate = searchParams.get('type') === 'pdf';

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [designJson, setDesignJson] = useState<EditorDocument>(DEFAULT_DESIGN);
  const [generatePdf, setGeneratePdf] = useState(isPdfTemplate);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>(id);
  const [showTestSend, setShowTestSend] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSaveVersion, setShowSaveVersion] = useState(false);
  const [versionName, setVersionName] = useState('');

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const designJsonRef = useRef<EditorDocument>(DEFAULT_DESIGN);
  const isInitialLoad = useRef(true);

  const { data: templateData, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => api.get<{ success: boolean; data: Template }>(`/api/templates/${id}`),
    enabled: !!id,
  });

  const { data: versionsData, refetch: refetchVersions } = useQuery({
    queryKey: ['template-versions', currentTemplateId],
    queryFn: () =>
      api.get<{ success: boolean; data: TemplateVersion[] }>(
        `/api/templates/${currentTemplateId}/versions`
      ),
    enabled: !!currentTemplateId && showVersionHistory,
  });

  useEffect(() => {
    if (templateData?.data) {
      const template = templateData.data;
      setName(template.name);
      setSubject(template.subject);
      const loadedDesign = template.designJson as EditorDocument;
      setDesignJson(loadedDesign);
      designJsonRef.current = loadedDesign;
      setGeneratePdf(template.generatePdf ?? isPdfTemplate);
      setCurrentTemplateId(template.id);
      isInitialLoad.current = false;
    }
  }, [templateData, isPdfTemplate]);

  const autosaveMutation = useMutation({
    mutationFn: async (data: { designJson: EditorDocument }) => {
      if (!currentTemplateId) return null;
      return api.put<{ success: boolean; data: Template }>(`/api/templates/${currentTemplateId}`, {
        designJson: data.designJson,
      });
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => {
      setSaveStatus('idle');
    },
  });

  const triggerAutosave = useCallback(() => {
    if (!currentTemplateId || isInitialLoad.current) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving');
      autosaveMutation.mutate({ designJson: designJsonRef.current });
    }, AUTOSAVE_DELAY);
  }, [currentTemplateId, autosaveMutation]);

  const handleDocumentChange = useCallback(
    (doc: EditorDocument) => {
      setDesignJson(doc);
      designJsonRef.current = doc;
      triggerAutosave();
    },
    [triggerAutosave]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        subject,
        designJson: designJsonRef.current,
        generatePdf,
      };
      if (!currentTemplateId) {
        return api.post<{ success: boolean; data: Template }>('/api/templates', payload);
      }
      return api.put<{ success: boolean; data: Template }>(
        `/api/templates/${currentTemplateId}`,
        payload
      );
    },
    onSuccess: (response) => {
      toast({ title: !currentTemplateId ? 'Template created' : 'Template saved' });
      if (!currentTemplateId && response.data?.id) {
        setCurrentTemplateId(response.data.id);
        isInitialLoad.current = false;
        navigate(`/templates/${response.data.id}`, { replace: true });
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => {
      toast({ title: 'Failed to save template', variant: 'destructive' });
    },
  });

  const testSendMutation = useMutation({
    mutationFn: async (to: string) => {
      return api.post<{ success: boolean; data: { id: string; to: string } }>(
        `/api/templates/${currentTemplateId}/test-send`,
        { to }
      );
    },
    onSuccess: (response) => {
      toast({ title: 'Test email sent', description: `Sent to ${response.data?.to}` });
      setShowTestSend(false);
      setTestEmail('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send test email',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return api.put<{ success: boolean; data: Template }>(
        `/api/templates/${currentTemplateId}/versions/${versionId}/restore`
      );
    },
    onSuccess: (response) => {
      toast({ title: 'Version restored' });
      if (response.data) {
        setDesignJson(response.data.designJson as EditorDocument);
        designJsonRef.current = response.data.designJson as EditorDocument;
        setSubject(response.data.subject);
      }
      setShowVersionHistory(false);
      refetchVersions();
    },
    onError: () => {
      toast({ title: 'Failed to restore version', variant: 'destructive' });
    },
  });

  const saveVersionMutation = useMutation({
    mutationFn: async (name?: string) => {
      return api.post<{ success: boolean; data: TemplateVersion }>(
        `/api/templates/${currentTemplateId}/versions`,
        { name }
      );
    },
    onSuccess: (response) => {
      toast({
        title: 'Version saved',
        description: `Version ${response.data?.version}${response.data?.name ? ` - ${response.data.name}` : ''} created`,
      });
      setShowSaveVersion(false);
      setVersionName('');
      refetchVersions();
    },
    onError: () => {
      toast({ title: 'Failed to save version', variant: 'destructive' });
    },
  });

  const handleSave = () => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    if (!name.trim()) {
      toast({ title: 'Please enter a template name', variant: 'destructive' });
      return;
    }
    if (!subject.trim()) {
      toast({ title: 'Please enter an email subject', variant: 'destructive' });
      return;
    }
    setSaveStatus('saving');
    saveMutation.mutate();
  };

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  if (!isNew && (isLoading || !templateData?.data)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? 'New' : 'Edit'} {generatePdf ? 'PDF' : 'Email'} Template
            </h1>
            <p className="text-muted-foreground">
              Design your {generatePdf ? 'PDF' : 'email'} template
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          {currentTemplateId && (
            <>
              <Button variant="outline" onClick={() => setShowSaveVersion(true)}>
                <Bookmark className="mr-2 h-4 w-4" />
                Save Version
              </Button>
              <Button variant="outline" onClick={() => setShowVersionHistory(true)}>
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </>
          )}
          {currentTemplateId && !generatePdf && (
            <Button variant="outline" onClick={() => setShowTestSend(true)}>
              <Send className="mr-2 h-4 w-4" />
              Test Send
            </Button>
          )}
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Welcome Email"
          />
        </div>
        <div>
          <Label htmlFor="subject">{generatePdf ? 'Document Title' : 'Email Subject'}</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={
              generatePdf
                ? 'Invoice #{{invoiceNumber}}'
                : 'Welcome to {{companyName}}, {{firstName}}!'
            }
          />
        </div>
      </div>

      <EmailEditor initialDocument={designJson} onChange={handleDocumentChange} />

      {showTestSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowTestSend(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Send Test Email</h2>
              <button onClick={() => setShowTestSend(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="test-email">Recipient Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && testEmail) {
                      testSendMutation.mutate(testEmail);
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The email will be sent with [TEST] prefix in the subject
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowTestSend(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => testSendMutation.mutate(testEmail)}
                  disabled={!testEmail || testSendMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {testSendMutation.isPending ? 'Sending...' : 'Send Test'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSaveVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowSaveVersion(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Save Version</h2>
              <button
                onClick={() => setShowSaveVersion(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="version-name">Version Name (optional)</Label>
                <Input
                  id="version-name"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., Before redesign, v2.0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveVersionMutation.mutate(versionName || undefined);
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Creates a snapshot you can restore later
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveVersion(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => saveVersionMutation.mutate(versionName || undefined)}
                  disabled={saveVersionMutation.isPending}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  {saveVersionMutation.isPending ? 'Saving...' : 'Save Version'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowVersionHistory(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Version History</h2>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {!versionsData?.data?.length ? (
                <p className="text-muted-foreground text-center py-8">No versions saved yet</p>
              ) : (
                <div className="space-y-2">
                  {versionsData.data.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">
                          Version {version.version}
                          {version.name && ` - ${version.name}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(version.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreVersionMutation.mutate(version.id)}
                        disabled={restoreVersionMutation.isPending}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
