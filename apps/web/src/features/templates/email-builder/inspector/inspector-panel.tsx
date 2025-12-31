import { useEditorStore } from '../editor-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from './image-upload';

export function InspectorPanel() {
  const document = useEditorStore((s) => s.document);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedSidebarTab = useEditorStore((s) => s.selectedSidebarTab);
  const setSidebarTab = useEditorStore((s) => s.setSidebarTab);

  const selectedBlock = selectedBlockId ? document[selectedBlockId] : null;
  const rootBlock = document.root;

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
          <StylesPanel rootBlock={rootBlock} />
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
}

function StylesPanel({ rootBlock }: StylesPanelProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const data = rootBlock.data as {
    backdropColor?: string;
    canvasColor?: string;
    textColor?: string;
    fontFamily?: string;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Email Styles</h3>

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
            value={data.fontFamily || 'MODERN_SANS'}
            onChange={(e) => updateBlock('root', { fontFamily: e.target.value })}
            className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
          >
            <option value="MODERN_SANS">Modern Sans</option>
            <option value="BOOK_SANS">Book Sans</option>
            <option value="ORGANIC_SANS">Organic Sans</option>
            <option value="GEOMETRIC_SANS">Geometric Sans</option>
            <option value="HEAVY_SANS">Heavy Sans</option>
            <option value="ROUNDED_SANS">Rounded Sans</option>
            <option value="MODERN_SERIF">Modern Serif</option>
            <option value="BOOK_SERIF">Book Serif</option>
            <option value="MONOSPACE">Monospace</option>
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
  const padding = (style.padding || { top: 0, bottom: 0, left: 0, right: 0 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  const updateProps = (newProps: Record<string, unknown>) => {
    updateBlock(blockId, { props: { ...props, ...newProps } });
  };

  const updateStyle = (newStyle: Record<string, unknown>) => {
    updateBlock(blockId, { style: { ...style, ...newStyle } });
  };

  const updatePadding = (key: keyof typeof padding, value: number) => {
    updateStyle({ padding: { ...padding, [key]: value } });
  };

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
