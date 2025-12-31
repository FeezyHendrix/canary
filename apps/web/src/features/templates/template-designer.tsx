import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import { EmailEditor, EditorDocument } from './email-builder';
import type { Template } from '@canary/shared';

const DEFAULT_DESIGN: EditorDocument = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#242424',
      fontFamily: 'MODERN_SANS',
      childrenIds: [],
    },
  },
};

export function TemplateDesigner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [designJson, setDesignJson] = useState<EditorDocument>(DEFAULT_DESIGN);
  const [generatePdf, setGeneratePdf] = useState(false);
  const [pdfFilename, setPdfFilename] = useState('');

  const { data: templateData, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => api.get<{ success: boolean; data: Template }>(`/api/templates/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (templateData?.data) {
      const template = templateData.data;
      setName(template.name);
      setSubject(template.subject);
      setDesignJson(template.designJson as EditorDocument);
      setGeneratePdf(template.generatePdf ?? false);
      setPdfFilename(template.pdfFilename ?? '');
    }
  }, [templateData]);

  const handleDocumentChange = useCallback((doc: EditorDocument) => {
    setDesignJson(doc);
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        subject,
        designJson,
        generatePdf,
        pdfFilename: pdfFilename || undefined,
      };
      if (isNew) {
        return api.post<{ success: boolean; data: Template }>('/api/templates', payload);
      }
      return api.put<{ success: boolean; data: Template }>(`/api/templates/${id}`, payload);
    },
    onSuccess: (response) => {
      toast({ title: isNew ? 'Template created' : 'Template saved' });
      if (isNew && response.data?.id) {
        navigate(`/templates/${response.data.id}`);
      }
    },
    onError: () => {
      toast({ title: 'Failed to save template', variant: 'destructive' });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: 'Please enter a template name', variant: 'destructive' });
      return;
    }
    if (!subject.trim()) {
      toast({ title: 'Please enter an email subject', variant: 'destructive' });
      return;
    }
    saveMutation.mutate();
  };

  if (!isNew && isLoading) {
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
            <h1 className="text-2xl font-bold">{isNew ? 'New Template' : 'Edit Template'}</h1>
            <p className="text-muted-foreground">Design your email template</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
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
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Welcome to {{companyName}}, {{firstName}}!"
          />
        </div>
      </div>

      <div className="flex items-start gap-6 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="generatePdf"
              checked={generatePdf}
              onChange={(e) => setGeneratePdf(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="generatePdf" className="font-medium cursor-pointer">
              Generate PDF attachment
            </Label>
          </div>
        </div>
        {generatePdf && (
          <div className="flex-1 max-w-xs">
            <Label htmlFor="pdfFilename" className="text-sm text-muted-foreground">
              PDF Filename (optional)
            </Label>
            <Input
              id="pdfFilename"
              value={pdfFilename}
              onChange={(e) => setPdfFilename(e.target.value)}
              placeholder="invoice.pdf"
              className="mt-1"
            />
          </div>
        )}
      </div>

      <EmailEditor initialDocument={designJson} onChange={handleDocumentChange} />
    </div>
  );
}
