import { useState, useEffect, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  PanelRightClose,
  PanelRight,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
} from 'lucide-react';
import { Reader, renderToStaticMarkup, TReaderDocument } from '@usewaypoint/email-builder';
import {
  useEditorStore,
  EditorDocument,
  useCanUndo,
  useCanRedo,
  useClipboard,
} from './editor-context';
import { EditorCanvas } from './editor-canvas';
import { InspectorPanel } from './inspector/inspector-panel';
import { Button } from '@/components/ui/button';

type ViewMode = 'editor' | 'preview' | 'html';

interface EmailEditorProps {
  initialDocument?: EditorDocument;
  onChange?: (document: EditorDocument) => void;
  sampleData?: Record<string, string>;
}

export function EmailEditor({ initialDocument, onChange, sampleData }: EmailEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [screenSize, setScreenSize] = useState<'desktop' | 'mobile'>('desktop');
  const [showVariables, setShowVariables] = useState(false);

  const document = useEditorStore((s) => s.document);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const resetDocument = useEditorStore((s) => s.resetDocument);
  const inspectorOpen = useEditorStore((s) => s.inspectorOpen);
  const setInspectorOpen = useEditorStore((s) => s.setInspectorOpen);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const copyBlock = useEditorStore((s) => s.copyBlock);
  const pasteBlock = useEditorStore((s) => s.pasteBlock);

  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const clipboard = useClipboard();

  useEffect(() => {
    if (initialDocument) {
      resetDocument(initialDocument);
    }
  }, []);

  useEffect(() => {
    onChange?.(document);
  }, [document, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isTextInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.contentEditable === 'true');

      if (isTextInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedBlockId) {
        e.preventDefault();
        copyBlock(selectedBlockId);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && clipboard) {
        e.preventDefault();
        pasteBlock('root');
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedBlockId) {
        e.preventDefault();
        duplicateBlock(selectedBlockId);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
        e.preventDefault();
        deleteBlock(selectedBlockId);
        return;
      }
    },
    [selectedBlockId, clipboard, undo, redo, copyBlock, pasteBlock, duplicateBlock, deleteBlock]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const replaceVariables = (html: string, data: Record<string, string>): string => {
    let result = html;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
    }
    return result;
  };

  const htmlOutput = (() => {
    try {
      let html = renderToStaticMarkup(document as TReaderDocument, { rootBlockId: 'root' });
      if (showVariables && sampleData) {
        html = replaceVariables(html, sampleData);
      }
      return html;
    } catch {
      return '<!-- Error rendering template -->';
    }
  })();

  return (
    <div className="flex h-[700px] border rounded-lg overflow-hidden bg-background">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-0.5 bg-muted rounded-md">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'editor'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('html')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'html'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                HTML
              </button>
            </div>

            {viewMode === 'editor' && (
              <div className="flex items-center gap-1 border-l pl-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  className="h-8 w-8"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Shift+Z)"
                  className="h-8 w-8"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => selectedBlockId && copyBlock(selectedBlockId)}
                  disabled={!selectedBlockId}
                  title="Copy (Ctrl+C)"
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => pasteBlock('root')}
                  disabled={!clipboard}
                  title="Paste (Ctrl+V)"
                  className="h-8 w-8"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {sampleData && (viewMode === 'preview' || viewMode === 'html') && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showVariables}
                  onChange={(e) => setShowVariables(e.target.checked)}
                  className="rounded"
                />
                Show variables
              </label>
            )}

            <div className="flex gap-0.5 p-0.5 bg-muted rounded-md">
              <button
                onClick={() => setScreenSize('desktop')}
                className={`p-1.5 rounded transition-colors ${
                  screenSize === 'desktop'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Desktop view"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setScreenSize('mobile')}
                className={`p-1.5 rounded transition-colors ${
                  screenSize === 'mobile'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Mobile view"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            {viewMode === 'editor' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setInspectorOpen(!inspectorOpen)}
                title={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
              >
                {inspectorOpen ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {viewMode === 'editor' && <EditorCanvas screenSize={screenSize} />}

          {viewMode === 'preview' && (
            <div
              className={`mx-auto transition-all duration-300 ${
                screenSize === 'mobile' ? 'max-w-[375px]' : 'max-w-[600px]'
              }`}
            >
              {showVariables && sampleData ? (
                <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
              ) : (
                <Reader document={document as TReaderDocument} rootBlockId="root" />
              )}
            </div>
          )}

          {viewMode === 'html' && (
            <div className="max-w-4xl mx-auto">
              <pre className="p-4 bg-white border rounded-lg text-sm font-mono overflow-auto max-h-full">
                <code>{htmlOutput}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'editor' && inspectorOpen && (
        <div className="w-72 border-l bg-background flex-shrink-0 overflow-hidden">
          <InspectorPanel />
        </div>
      )}
    </div>
  );
}
