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
  Download,
  Keyboard,
  X,
  ClipboardCopy,
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

function formatHtml(html: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  const tokens = html.replace(/>\s*</g, '>\n<').split('\n');

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }

    formatted += tab.repeat(indent) + trimmed + '\n';

    if (
      trimmed.startsWith('<') &&
      !trimmed.startsWith('</') &&
      !trimmed.startsWith('<!') &&
      !trimmed.endsWith('/>') &&
      !trimmed.includes('</') &&
      !/<(meta|link|img|br|hr|input)\b/i.test(trimmed)
    ) {
      indent++;
    }
  }

  return formatted.trim();
}

interface EmailEditorProps {
  initialDocument?: EditorDocument;
  onChange?: (document: EditorDocument) => void;
  sampleData?: Record<string, string>;
}

const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Ctrl', 'Y'], action: 'Redo (alternative)' },
  { keys: ['Ctrl', 'C'], action: 'Copy selected block' },
  { keys: ['Ctrl', 'V'], action: 'Paste block' },
  { keys: ['Ctrl', 'D'], action: 'Duplicate selected block' },
  { keys: ['Delete'], action: 'Delete selected block' },
  { keys: ['Backspace'], action: 'Delete selected block' },
];

export function EmailEditor({ initialDocument, onChange, sampleData }: EmailEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [screenSize, setScreenSize] = useState<'desktop' | 'mobile'>('desktop');
  const [showVariables, setShowVariables] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

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
  }, [initialDocument, resetDocument]);

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

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShowShortcuts(true);
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

  const downloadHtml = () => {
    const formattedHtml = formatHtml(htmlOutput);
    const blob = new Blob([formattedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyHtmlToClipboard = async () => {
    const formattedHtml = formatHtml(htmlOutput);
    await navigator.clipboard.writeText(formattedHtml);
  };

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
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShortcuts(true)}
                  title="Keyboard shortcuts (?)"
                  className="h-8 w-8"
                >
                  <Keyboard className="h-4 w-4" />
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
            <div className="h-full flex flex-col">
              <div className="flex justify-end gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={copyHtmlToClipboard}>
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Copy HTML
                </Button>
                <Button variant="outline" size="sm" onClick={downloadHtml}>
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML
                </Button>
              </div>
              <pre className="flex-1 p-4 bg-white border rounded-lg text-sm font-mono overflow-auto whitespace-pre-wrap">
                <code>{formatHtml(htmlOutput)}</code>
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

      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowShortcuts(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-sm">{shortcut.action}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="px-2 py-1 text-xs font-mono bg-muted border rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                Press{' '}
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">?</kbd> to
                show this dialog
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
