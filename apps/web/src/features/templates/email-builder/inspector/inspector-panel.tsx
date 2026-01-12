import { useMemo, useCallback } from 'react';
import { useEditorStore } from '../editor-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from './image-upload';

export function InspectorPanel() {
  const document = useEditorStore((s) => s.document);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedSidebarTab = useEditorStore((s) => s.selectedSidebarTab);
  const setSidebarTab = useEditorStore((s) => s.setSidebarTab);
  const isPdf = useEditorStore((s) => s.isPdf);

  // Memoize derived values to avoid unnecessary child re-renders
  const selectedBlock = useMemo(
    () => (selectedBlockId ? document[selectedBlockId] : null),
    [document, selectedBlockId]
  );
  const rootBlock = useMemo(() => document.root, [document]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b">
        <button
          onClick={() => setSidebarTab('styles')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            selectedSidebarTab === 'styles'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Styles
        </button>
        <button
          onClick={() => setSidebarTab('block-configuration')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            selectedSidebarTab === 'block-configuration'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Block
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {selectedSidebarTab === 'styles' ? (
          <StylesPanel rootBlock={rootBlock} isPdf={isPdf} />
        ) : selectedBlock ? (
          <BlockConfigPanel blockId={selectedBlockId!} block={selectedBlock} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Select a block to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface StylesPanelProps {
  rootBlock: { type: string; data: Record<string, unknown> };
  isPdf: boolean;
}

function StylesPanel({ rootBlock, isPdf }: StylesPanelProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const data = rootBlock.data as {
    backdropColor?: string;
    canvasColor?: string;
    textColor?: string;
    fontFamily?: string;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{isPdf ? 'PDF' : 'Email'} Styles</h3>

      <div className="space-y-3">
        <div>
          <Label>Backdrop Color</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={data.backdropColor || '#F5F5F5'}
              onChange={(e) => updateBlock('root', { backdropColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input
              value={data.backdropColor || '#F5F5F5'}
              onChange={(e) => updateBlock('root', { backdropColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label>Canvas Color</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={data.canvasColor || '#FFFFFF'}
              onChange={(e) => updateBlock('root', { canvasColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input
              value={data.canvasColor || '#FFFFFF'}
              onChange={(e) => updateBlock('root', { canvasColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label>Text Color</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={data.textColor || '#242424'}
              onChange={(e) => updateBlock('root', { textColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input
              value={data.textColor || '#242424'}
              onChange={(e) => updateBlock('root', { textColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label>Font Family</Label>
          <select
            value={data.fontFamily || 'Inter'}
            onChange={(e) => updateBlock('root', { fontFamily: e.target.value })}
            className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Poppins">Poppins</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Source Sans 3">Source Sans 3</option>
            <option value="Nunito">Nunito</option>
            <option value="Raleway">Raleway</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Merriweather">Merriweather</option>
            <option value="Lora">Lora</option>
            <option value="Fira Code">Fira Code</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
          </select>
        </div>
      </div>
    </div>
  );
}

interface BlockConfigPanelProps {
  blockId: string;
  block: { type: string; data: Record<string, unknown> };
}

function BlockConfigPanel({ blockId, block }: BlockConfigPanelProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const props = (block.data.props || {}) as Record<string, unknown>;
  const style = (block.data.style || {}) as Record<string, unknown>;
  const padding = useMemo(() => (style.padding || { top: 0, bottom: 0, left: 0, right: 0 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }, [style.padding]);

  const updateProps = useCallback((newProps: Record<string, unknown>) => {
    updateBlock(blockId, { props: { ...props, ...newProps } });
  }, [blockId, props, updateBlock]);

  const updateStyle = useCallback((newStyle: Record<string, unknown>) => {
    updateBlock(blockId, { style: { ...style, ...newStyle } });
  }, [blockId, style, updateBlock]);

  const updatePadding = useCallback((key: 'top' | 'bottom' | 'left' | 'right', value: number) => {
    updateStyle({ padding: { ...padding, [key]: value } });
  }, [padding, updateStyle]);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{block.type} Block</h3>

      {block.type === 'Text' && (
        <div>
          <Label>Content</Label>
          <textarea
            value={(props.text as string) || ''}
            onChange={(e) => updateProps({ text: e.target.value })}
            rows={4}
            className="w-full mt-1 border rounded-md px-3 py-2 bg-background resize-none"
          />
        </div>
      )}

      {block.type === 'Heading' && (
        <>
          <div>
            <Label>Text</Label>
            <Input
              value={(props.text as string) || ''}
              onChange={(e) => updateProps({ text: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Level</Label>
            <select
              value={(props.level as string) || 'h2'}
              onChange={(e) => updateProps({ level: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
            </select>
          </div>
        </>
      )}

      {block.type === 'Button' && (
        <>
          <div>
            <Label>Button Text</Label>
            <Input
              value={(props.text as string) || ''}
              onChange={(e) => updateProps({ text: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>URL</Label>
            <Input
              value={(props.url as string) || ''}
              onChange={(e) => updateProps({ url: e.target.value })}
              className="mt-1"
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Button Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.buttonBackgroundColor as string) || '#3b82f6'}
                onChange={(e) => updateProps({ buttonBackgroundColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.buttonBackgroundColor as string) || '#3b82f6'}
                onChange={(e) => updateProps({ buttonBackgroundColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>Text Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.buttonTextColor as string) || '#ffffff'}
                onChange={(e) => updateProps({ buttonTextColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.buttonTextColor as string) || '#ffffff'}
                onChange={(e) => updateProps({ buttonTextColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      {block.type === 'Image' && (
        <>
          <ImageUpload
            label="Image"
            value={(props.url as string) || ''}
            onChange={(url) => updateProps({ url })}
          />
          <div>
            <Label>Alt Text</Label>
            <Input
              value={(props.alt as string) || ''}
              onChange={(e) => updateProps({ alt: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Alignment</Label>
            <select
              value={(props.contentAlignment as string) || 'center'}
              onChange={(e) => updateProps({ contentAlignment: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {block.type === 'Spacer' && (
        <div>
          <Label>Height (px)</Label>
          <Input
            type="number"
            value={(props.height as number) || 32}
            onChange={(e) => updateProps({ height: parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
      )}

      {block.type === 'Divider' && (
        <>
          <div>
            <Label>Line Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.lineColor as string) || '#e2e8f0'}
                onChange={(e) => updateProps({ lineColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.lineColor as string) || '#e2e8f0'}
                onChange={(e) => updateProps({ lineColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>Line Height (px)</Label>
            <Input
              type="number"
              value={(props.lineHeight as number) || 1}
              onChange={(e) => updateProps({ lineHeight: parseInt(e.target.value) || 1 })}
              className="mt-1"
              min={1}
              max={10}
            />
          </div>
        </>
      )}

      {block.type === 'Html' && (
        <div>
          <Label>HTML Content</Label>
          <textarea
            value={(props.contents as string) || ''}
            onChange={(e) => updateProps({ contents: e.target.value })}
            rows={8}
            className="w-full mt-1 border rounded-md px-3 py-2 bg-background resize-none font-mono text-sm"
          />
        </div>
      )}

      {block.type === 'Avatar' && (
        <>
          <ImageUpload
            label="Avatar Image"
            value={(props.imageUrl as string) || ''}
            onChange={(url) => updateProps({ imageUrl: url })}
          />
          <div>
            <Label>Size (px)</Label>
            <Input
              type="number"
              value={(props.size as number) || 64}
              onChange={(e) => updateProps({ size: parseInt(e.target.value) || 64 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Shape</Label>
            <select
              value={(props.shape as string) || 'circle'}
              onChange={(e) => updateProps({ shape: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>
        </>
      )}

      {block.type === 'ColumnsContainer' && (
        <>
          <div>
            <Label>Number of Columns</Label>
            <select
              value={(props.columnsCount as number) || 2}
              onChange={(e) => updateProps({ columnsCount: parseInt(e.target.value) })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
            </select>
          </div>
          <div>
            <Label>Column Gap (px)</Label>
            <Input
              type="number"
              value={(props.columnsGap as number) || 16}
              onChange={(e) => updateProps({ columnsGap: parseInt(e.target.value) || 0 })}
              className="mt-1"
              min={0}
              max={48}
            />
          </div>
        </>
      )}

      {block.type === 'Container' && (
        <div>
          <Label>Background Color</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={(style.backgroundColor as string) || '#f8fafc'}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input
              value={(style.backgroundColor as string) || '#f8fafc'}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {block.type === 'Video' && (
        <>
          <ImageUpload
            label="Thumbnail Image"
            value={(props.thumbnailUrl as string) || ''}
            onChange={(url) => updateProps({ thumbnailUrl: url })}
          />
          <div>
            <Label>Video URL</Label>
            <Input
              value={(props.videoUrl as string) || ''}
              onChange={(e) => updateProps({ videoUrl: e.target.value })}
              className="mt-1"
              placeholder="https://youtube.com/..."
            />
          </div>
          <div>
            <Label>Alt Text</Label>
            <Input
              value={(props.alt as string) || ''}
              onChange={(e) => updateProps({ alt: e.target.value })}
              className="mt-1"
            />
          </div>
        </>
      )}

      {block.type === 'Quote' && (
        <>
          <div>
            <Label>Quote Text</Label>
            <textarea
              value={(props.text as string) || ''}
              onChange={(e) => updateProps({ text: e.target.value })}
              rows={3}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background resize-none"
            />
          </div>
          <div>
            <Label>Author</Label>
            <Input
              value={(props.author as string) || ''}
              onChange={(e) => updateProps({ author: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Author Title</Label>
            <Input
              value={(props.authorTitle as string) || ''}
              onChange={(e) => updateProps({ authorTitle: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Border Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.borderColor as string) || '#3b82f6'}
                onChange={(e) => updateProps({ borderColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.borderColor as string) || '#3b82f6'}
                onChange={(e) => updateProps({ borderColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="showQuoteMark"
              checked={(props.showQuoteMark as boolean) ?? true}
              onChange={(e) => updateProps({ showQuoteMark: e.target.checked })}
            />
            <Label htmlFor="showQuoteMark">Show quote mark</Label>
          </div>
        </>
      )}

      {block.type === 'List' && (
        <>
          <div>
            <Label>List Type</Label>
            <select
              value={(props.listType as string) || 'bullet'}
              onChange={(e) => updateProps({ listType: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="bullet">Bullet</option>
              <option value="number">Numbered</option>
            </select>
          </div>
          <div>
            <Label>Items (one per line)</Label>
            <textarea
              value={((props.items as string[]) || []).join('\n')}
              onChange={(e) => updateProps({ items: e.target.value.split('\n') })}
              rows={5}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background resize-none"
            />
          </div>
          {(props.listType as string) !== 'number' && (
            <div>
              <Label>Bullet Color</Label>
              <div className="flex gap-2 mt-1">
                <input
                  type="color"
                  value={(props.bulletColor as string) || '#3b82f6'}
                  onChange={(e) => updateProps({ bulletColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={(props.bulletColor as string) || '#3b82f6'}
                  onChange={(e) => updateProps({ bulletColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </>
      )}

      {block.type === 'Code' && (
        <>
          <div>
            <Label>Code</Label>
            <textarea
              value={(props.code as string) || ''}
              onChange={(e) => updateProps({ code: e.target.value })}
              rows={6}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background resize-none font-mono text-sm"
            />
          </div>
          <div>
            <Label>Language</Label>
            <select
              value={(props.language as string) || 'javascript'}
              onChange={(e) => updateProps({ language: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="bash">Bash</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="showLineNumbers"
              checked={(props.showLineNumbers as boolean) ?? true}
              onChange={(e) => updateProps({ showLineNumbers: e.target.checked })}
            />
            <Label htmlFor="showLineNumbers">Show line numbers</Label>
          </div>
          <div>
            <Label>Background Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.backgroundColor as string) || '#1e293b'}
                onChange={(e) => updateProps({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.backgroundColor as string) || '#1e293b'}
                onChange={(e) => updateProps({ backgroundColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>Text Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.textColor as string) || '#e2e8f0'}
                onChange={(e) => updateProps({ textColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.textColor as string) || '#e2e8f0'}
                onChange={(e) => updateProps({ textColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      {block.type === 'Badge' && (
        <>
          <div>
            <Label>Badge Text</Label>
            <Input
              value={(props.text as string) || ''}
              onChange={(e) => updateProps({ text: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Size</Label>
            <select
              value={(props.size as string) || 'medium'}
              onChange={(e) => updateProps({ size: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <Label>Alignment</Label>
            <select
              value={(props.alignment as string) || 'left'}
              onChange={(e) => updateProps({ alignment: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <Label>Background Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.backgroundColor as string) || '#3b82f6'}
                onChange={(e) => updateProps({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.backgroundColor as string) || '#3b82f6'}
                onChange={(e) => updateProps({ backgroundColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>Text Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.textColor as string) || '#ffffff'}
                onChange={(e) => updateProps({ textColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.textColor as string) || '#ffffff'}
                onChange={(e) => updateProps({ textColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      {block.type === 'Icon' && (
        <>
          <div>
            <Label>Icon</Label>
            <select
              value={(props.icon as string) || 'star'}
              onChange={(e) => updateProps({ icon: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="star">Star</option>
              <option value="heart">Heart</option>
              <option value="check">Check</option>
              <option value="mail">Mail</option>
              <option value="phone">Phone</option>
              <option value="location">Location</option>
              <option value="gift">Gift</option>
              <option value="trophy">Trophy</option>
            </select>
          </div>
          <div>
            <Label>Size (px)</Label>
            <Input
              type="number"
              value={(props.size as number) || 48}
              onChange={(e) => updateProps({ size: parseInt(e.target.value) || 48 })}
              className="mt-1"
              min={16}
              max={128}
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(props.color as string) || '#3b82f6'}
                onChange={(e) => updateProps({ color: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(props.color as string) || '#3b82f6'}
                onChange={(e) => updateProps({ color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>Alignment</Label>
            <select
              value={(props.alignment as string) || 'center'}
              onChange={(e) => updateProps({ alignment: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <Label>Label (optional)</Label>
            <Input
              value={(props.label as string) || ''}
              onChange={(e) => updateProps({ label: e.target.value })}
              className="mt-1"
              placeholder="Text below icon"
            />
          </div>
        </>
      )}

      {block.type === 'SocialIcons' && (
        <>
          <div>
            <Label>Alignment</Label>
            <select
              value={(props.alignment as string) || 'center'}
              onChange={(e) => updateProps({ alignment: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <Label>Icon Size (px)</Label>
            <Input
              type="number"
              value={(props.iconSize as number) || 32}
              onChange={(e) => updateProps({ iconSize: parseInt(e.target.value) || 32 })}
              className="mt-1"
              min={20}
              max={64}
            />
          </div>
          <div>
            <Label>Icon Style</Label>
            <select
              value={(props.iconStyle as string) || 'filled'}
              onChange={(e) => updateProps({ iconStyle: e.target.value })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            >
              <option value="filled">Filled</option>
              <option value="outline">Outline</option>
            </select>
          </div>
          <SocialIconsEditor
            icons={(props.icons as Array<{ platform: string; url: string }>) || []}
            onChange={(icons) => updateProps({ icons })}
          />
        </>
      )}

      {block.type === 'Table' && (
        <TableEditor
          headers={(props.headers as string[]) || []}
          rows={(props.rows as string[][]) || []}
          onChangeHeaders={(headers) => updateProps({ headers })}
          onChangeRows={(rows) => updateProps({ rows })}
          headerBackground={(props.headerBackground as string) || '#f1f5f9'}
          borderColor={(props.borderColor as string) || '#e2e8f0'}
          stripedRows={(props.stripedRows as boolean) ?? true}
          onChangeHeaderBackground={(color) => updateProps({ headerBackground: color })}
          onChangeBorderColor={(color) => updateProps({ borderColor: color })}
          onChangeStripedRows={(striped) => updateProps({ stripedRows: striped })}
        />
      )}

      {block.type === 'Chart' && (
        <ChartEditor
          chartType={(props.chartType as string) || 'bar'}
          title={(props.title as string) || ''}
          dataSource={(props.dataSource as string) || 'static'}
          staticData={
            (props.staticData as { labels: string[]; datasets: Array<{ name: string; values: number[] }> }) || {
              labels: ['Jan', 'Feb', 'Mar', 'Apr'],
              datasets: [{ name: 'Series 1', values: [100, 150, 120, 180] }],
            }
          }
          dynamicVariable={(props.dynamicVariable as string) || ''}
          colors={(props.colors as string[]) || ['#3b82f6', '#ef4444', '#22c55e']}
          showLegend={(props.showLegend as boolean) ?? true}
          legendPosition={(props.legendPosition as string) || 'bottom'}
          showGridLines={(props.showGridLines as boolean) ?? true}
          axisLabels={(props.axisLabels as { x?: string; y?: string }) || {}}
          width={(props.width as number) || 500}
          height={(props.height as number) || 300}
          onChangeChartType={(chartType) => updateProps({ chartType })}
          onChangeTitle={(title) => updateProps({ title })}
          onChangeDataSource={(dataSource) => updateProps({ dataSource })}
          onChangeStaticData={(staticData) => updateProps({ staticData })}
          onChangeDynamicVariable={(dynamicVariable) => updateProps({ dynamicVariable })}
          onChangeColors={(colors) => updateProps({ colors })}
          onChangeShowLegend={(showLegend) => updateProps({ showLegend })}
          onChangeLegendPosition={(legendPosition) => updateProps({ legendPosition })}
          onChangeShowGridLines={(showGridLines) => updateProps({ showGridLines })}
          onChangeAxisLabels={(axisLabels) => updateProps({ axisLabels })}
          onChangeWidth={(width) => updateProps({ width })}
          onChangeHeight={(height) => updateProps({ height })}
        />
      )}

      <div className="pt-4 border-t">
        <Label className="text-muted-foreground font-medium">Block Styles</Label>

        <div className="space-y-3 mt-3">
          <div>
            <Label className="text-xs">Background Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(style.backgroundColor as string) || '#ffffff'}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(style.backgroundColor as string) || ''}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                placeholder="transparent"
                className="flex-1"
              />
              {typeof style.backgroundColor === 'string' && style.backgroundColor && (
                <button
                  onClick={() => updateStyle({ backgroundColor: undefined })}
                  className="px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs">Text Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={(style.textColor as string) || '#000000'}
                onChange={(e) => updateStyle({ textColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={(style.textColor as string) || ''}
                onChange={(e) => updateStyle({ textColor: e.target.value })}
                placeholder="inherit"
                className="flex-1"
              />
              {typeof style.textColor === 'string' && style.textColor && (
                <button
                  onClick={() => updateStyle({ textColor: undefined })}
                  className="px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs">Font Size</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                value={(style.fontSize as number) || ''}
                onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) || undefined })}
                placeholder="inherit"
                className="flex-1"
                min={8}
                max={72}
              />
              <span className="text-sm text-muted-foreground self-center">px</span>
            </div>
          </div>

          <div>
            <Label className="text-xs">Text Align</Label>
            <select
              value={(style.textAlign as string) || ''}
              onChange={(e) => updateStyle({ textAlign: e.target.value || undefined })}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background text-sm"
            >
              <option value="">Inherit</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>

      {block.type !== 'Spacer' && (
        <div className="pt-4 border-t">
          <Label className="text-muted-foreground">Padding</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label className="text-xs">Top</Label>
              <Input
                type="number"
                value={padding.top}
                onChange={(e) => updatePadding('top', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Bottom</Label>
              <Input
                type="number"
                value={padding.bottom}
                onChange={(e) => updatePadding('bottom', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Left</Label>
              <Input
                type="number"
                value={padding.left}
                onChange={(e) => updatePadding('left', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Right</Label>
              <Input
                type="number"
                value={padding.right}
                onChange={(e) => updatePadding('right', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SocialIconsEditorProps {
  icons: Array<{ platform: string; url: string }>;
  onChange: (icons: Array<{ platform: string; url: string }>) => void;
}

function SocialIconsEditor({ icons, onChange }: SocialIconsEditorProps) {
  const platforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube'];

  const addIcon = () => {
    onChange([...icons, { platform: 'twitter', url: '' }]);
  };

  const removeIcon = (index: number) => {
    onChange(icons.filter((_, i) => i !== index));
  };

  const updateIcon = (index: number, field: 'platform' | 'url', value: string) => {
    const newIcons = [...icons];
    newIcons[index] = { ...newIcons[index], [field]: value };
    onChange(newIcons);
  };

  return (
    <div className="space-y-3 mt-3">
      <Label>Social Icons</Label>
      {icons.map((icon, index) => (
        <div key={index} className="flex gap-2 items-center">
          <select
            value={icon.platform}
            onChange={(e) => updateIcon(index, 'platform', e.target.value)}
            className="border rounded-md px-2 py-1 bg-background text-sm"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <Input
            value={icon.url}
            onChange={(e) => updateIcon(index, 'url', e.target.value)}
            placeholder="URL"
            className="flex-1"
          />
          <button
            onClick={() => removeIcon(index)}
            className="text-red-500 hover:text-red-700 px-2"
          >
            ×
          </button>
        </div>
      ))}
      <button onClick={addIcon} className="text-sm text-primary hover:underline">
        + Add Icon
      </button>
    </div>
  );
}

interface TableEditorProps {
  headers: string[];
  rows: string[][];
  onChangeHeaders: (headers: string[]) => void;
  onChangeRows: (rows: string[][]) => void;
  headerBackground: string;
  borderColor: string;
  stripedRows: boolean;
  onChangeHeaderBackground: (color: string) => void;
  onChangeBorderColor: (color: string) => void;
  onChangeStripedRows: (striped: boolean) => void;
}

interface ChartEditorProps {
  chartType: string;
  title: string;
  dataSource: string;
  staticData: { labels: string[]; datasets: Array<{ name: string; values: number[] }> };
  dynamicVariable: string;
  colors: string[];
  showLegend: boolean;
  legendPosition: string;
  showGridLines: boolean;
  axisLabels: { x?: string; y?: string };
  width: number;
  height: number;
  onChangeChartType: (type: string) => void;
  onChangeTitle: (title: string) => void;
  onChangeDataSource: (source: string) => void;
  onChangeStaticData: (data: { labels: string[]; datasets: Array<{ name: string; values: number[] }> }) => void;
  onChangeDynamicVariable: (variable: string) => void;
  onChangeColors: (colors: string[]) => void;
  onChangeShowLegend: (show: boolean) => void;
  onChangeLegendPosition: (position: string) => void;
  onChangeShowGridLines: (show: boolean) => void;
  onChangeAxisLabels: (labels: { x?: string; y?: string }) => void;
  onChangeWidth: (width: number) => void;
  onChangeHeight: (height: number) => void;
}

function ChartEditor({
  chartType,
  title,
  dataSource,
  staticData,
  dynamicVariable,
  colors,
  showLegend,
  legendPosition,
  showGridLines,
  axisLabels,
  width,
  height,
  onChangeChartType,
  onChangeTitle,
  onChangeDataSource,
  onChangeStaticData,
  onChangeDynamicVariable,
  onChangeColors,
  onChangeShowLegend,
  onChangeLegendPosition,
  onChangeShowGridLines,
  onChangeAxisLabels,
  onChangeWidth,
  onChangeHeight,
}: ChartEditorProps) {
  const chartTypes = [
    { value: 'bar', label: 'Bar', icon: '▮' },
    { value: 'line', label: 'Line', icon: '📈' },
    { value: 'pie', label: 'Pie', icon: '◐' },
    { value: 'doughnut', label: 'Donut', icon: '◯' },
    { value: 'area', label: 'Area', icon: '▲' },
  ];

  const updateDatasetName = (index: number, name: string) => {
    const newDatasets = [...staticData.datasets];
    newDatasets[index] = { ...newDatasets[index], name };
    onChangeStaticData({ ...staticData, datasets: newDatasets });
  };

  const updateDatasetValues = (index: number, valuesStr: string) => {
    const values = valuesStr.split(',').map((v) => parseFloat(v.trim()) || 0);
    const newDatasets = [...staticData.datasets];
    newDatasets[index] = { ...newDatasets[index], values };
    onChangeStaticData({ ...staticData, datasets: newDatasets });
  };

  const addDataset = () => {
    const newDatasets = [
      ...staticData.datasets,
      { name: `Series ${staticData.datasets.length + 1}`, values: staticData.labels.map(() => 0) },
    ];
    onChangeStaticData({ ...staticData, datasets: newDatasets });
  };

  const removeDataset = (index: number) => {
    if (staticData.datasets.length <= 1) return;
    const newDatasets = staticData.datasets.filter((_, i) => i !== index);
    onChangeStaticData({ ...staticData, datasets: newDatasets });
  };

  const addColor = () => {
    const defaultColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
    const nextColor = defaultColors[colors.length % defaultColors.length];
    onChangeColors([...colors, nextColor]);
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    onChangeColors(newColors);
  };

  const removeColor = (index: number) => {
    if (colors.length <= 1) return;
    onChangeColors(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Chart Type</Label>
        <div className="flex gap-1 mt-1">
          {chartTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onChangeChartType(type.value)}
              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded border text-xs ${
                chartType === type.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="mt-1"
          placeholder="Chart title"
        />
      </div>

      <div>
        <Label>Data Source</Label>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onChangeDataSource('static')}
            className={`flex-1 px-3 py-2 text-sm rounded border ${
              dataSource === 'static'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Static Data
          </button>
          <button
            onClick={() => onChangeDataSource('dynamic')}
            className={`flex-1 px-3 py-2 text-sm rounded border ${
              dataSource === 'dynamic'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Dynamic Variable
          </button>
        </div>
      </div>

      {dataSource === 'dynamic' ? (
        <div>
          <Label>Variable Name</Label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">{'{{'}</span>
            <Input
              value={dynamicVariable}
              onChange={(e) => onChangeDynamicVariable(e.target.value)}
              placeholder="chartData"
              className="flex-1"
            />
            <span className="text-muted-foreground">{'}}'}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Pass chart data via API at send time</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label>Labels (comma-separated)</Label>
            <Input
              value={staticData.labels.join(', ')}
              onChange={(e) =>
                onChangeStaticData({
                  ...staticData,
                  labels: e.target.value.split(',').map((l) => l.trim()),
                })
              }
              className="mt-1"
              placeholder="Jan, Feb, Mar, Apr"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Datasets</Label>
              <button onClick={addDataset} className="text-xs text-primary hover:underline">
                + Add Dataset
              </button>
            </div>
            <div className="space-y-2 mt-2">
              {staticData.datasets.map((dataset, index) => (
                <div key={index} className="p-2 border rounded bg-gray-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={dataset.name}
                      onChange={(e) => updateDatasetName(index, e.target.value)}
                      placeholder="Dataset name"
                      className="flex-1 text-sm"
                    />
                    {staticData.datasets.length > 1 && (
                      <button
                        onClick={() => removeDataset(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <Input
                    value={dataset.values.join(', ')}
                    onChange={(e) => updateDatasetValues(index, e.target.value)}
                    placeholder="100, 150, 120, 180"
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Appearance
        </summary>
        <div className="mt-3 space-y-3 pl-2">
          <div>
            <Label className="text-xs">Colors</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-1">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  {colors.length > 1 && (
                    <button
                      onClick={() => removeColor(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addColor}
                className="w-8 h-8 rounded border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showLegend"
              checked={showLegend}
              onChange={(e) => onChangeShowLegend(e.target.checked)}
            />
            <Label htmlFor="showLegend" className="text-xs">
              Show Legend
            </Label>
          </div>

          {showLegend && (
            <div>
              <Label className="text-xs">Legend Position</Label>
              <select
                value={legendPosition}
                onChange={(e) => onChangeLegendPosition(e.target.value)}
                className="w-full mt-1 border rounded-md px-3 py-2 bg-background text-sm"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          )}

          {chartType !== 'pie' && chartType !== 'doughnut' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showGridLines"
                checked={showGridLines}
                onChange={(e) => onChangeShowGridLines(e.target.checked)}
              />
              <Label htmlFor="showGridLines" className="text-xs">
                Show Grid Lines
              </Label>
            </div>
          )}
        </div>
      </details>

      {chartType !== 'pie' && chartType !== 'doughnut' && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            Axis Labels
          </summary>
          <div className="mt-3 space-y-3 pl-2">
            <div>
              <Label className="text-xs">X-Axis Label</Label>
              <Input
                value={axisLabels.x || ''}
                onChange={(e) => onChangeAxisLabels({ ...axisLabels, x: e.target.value })}
                className="mt-1 text-sm"
                placeholder="e.g., Months"
              />
            </div>
            <div>
              <Label className="text-xs">Y-Axis Label</Label>
              <Input
                value={axisLabels.y || ''}
                onChange={(e) => onChangeAxisLabels({ ...axisLabels, y: e.target.value })}
                className="mt-1 text-sm"
                placeholder="e.g., Revenue ($)"
              />
            </div>
          </div>
        </details>
      )}

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Dimensions
        </summary>
        <div className="mt-3 space-y-3 pl-2">
          <div>
            <Label className="text-xs">Width (px)</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => onChangeWidth(parseInt(e.target.value) || 500)}
              className="mt-1 text-sm"
              min={200}
              max={800}
            />
          </div>
          <div>
            <Label className="text-xs">Height (px)</Label>
            <Input
              type="number"
              value={height}
              onChange={(e) => onChangeHeight(parseInt(e.target.value) || 300)}
              className="mt-1 text-sm"
              min={150}
              max={600}
            />
          </div>
        </div>
      </details>
    </div>
  );
}

function TableEditor({
  headers,
  rows,
  onChangeHeaders,
  onChangeRows,
  headerBackground,
  borderColor,
  stripedRows,
  onChangeHeaderBackground,
  onChangeBorderColor,
  onChangeStripedRows,
}: TableEditorProps) {
  const addColumn = () => {
    onChangeHeaders([...headers, `Column ${headers.length + 1}`]);
    onChangeRows(rows.map((row) => [...row, '']));
  };

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return;
    onChangeHeaders(headers.filter((_, i) => i !== index));
    onChangeRows(rows.map((row) => row.filter((_, i) => i !== index)));
  };

  const addRow = () => {
    onChangeRows([...rows, headers.map(() => '')]);
  };

  const removeRow = (index: number) => {
    onChangeRows(rows.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    onChangeHeaders(newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row
    );
    onChangeRows(newRows);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Table Data</Label>
        <div className="flex gap-2">
          <button onClick={addColumn} className="text-xs text-primary hover:underline">
            + Column
          </button>
          <button onClick={addRow} className="text-xs text-primary hover:underline">
            + Row
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex gap-1">
          {headers.map((header, i) => (
            <div key={i} className="flex-1 flex gap-1">
              <Input
                value={header}
                onChange={(e) => updateHeader(i, e.target.value)}
                className="text-xs"
                placeholder={`Header ${i + 1}`}
              />
              {headers.length > 1 && (
                <button
                  onClick={() => removeColumn(i)}
                  className="text-red-500 hover:text-red-700 text-xs px-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1 items-center">
            {row.map((cell, ci) => (
              <Input
                key={ci}
                value={cell}
                onChange={(e) => updateCell(ri, ci, e.target.value)}
                className="flex-1 text-xs"
                placeholder={`Row ${ri + 1}`}
              />
            ))}
            <button
              onClick={() => removeRow(ri)}
              className="text-red-500 hover:text-red-700 text-xs px-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div>
        <Label className="text-xs">Header Background</Label>
        <div className="flex gap-2 mt-1">
          <input
            type="color"
            value={headerBackground}
            onChange={(e) => onChangeHeaderBackground(e.target.value)}
            className="w-8 h-8 rounded border cursor-pointer"
          />
          <Input
            value={headerBackground}
            onChange={(e) => onChangeHeaderBackground(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Border Color</Label>
        <div className="flex gap-2 mt-1">
          <input
            type="color"
            value={borderColor}
            onChange={(e) => onChangeBorderColor(e.target.value)}
            className="w-8 h-8 rounded border cursor-pointer"
          />
          <Input
            value={borderColor}
            onChange={(e) => onChangeBorderColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="stripedRows"
          checked={stripedRows}
          onChange={(e) => onChangeStripedRows(e.target.checked)}
        />
        <Label htmlFor="stripedRows" className="text-xs">
          Striped rows
        </Label>
      </div>
    </div>
  );
}
