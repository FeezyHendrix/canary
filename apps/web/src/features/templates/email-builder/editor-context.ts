import { create } from 'zustand';

export type EditorBlock = {
  type: string;
  data: Record<string, unknown>;
};

export type EditorDocument = Record<string, EditorBlock>;

export type SidebarTab = 'styles' | 'block-configuration';

const MAX_HISTORY_SIZE = 50;

interface EditorState {
  document: EditorDocument;
  selectedBlockId: string | null;
  selectedSidebarTab: SidebarTab;
  inspectorOpen: boolean;
  history: EditorDocument[];
  historyIndex: number;
  clipboard: { block: EditorBlock; childBlocks?: EditorDocument } | null;
  isPdf: boolean;
}

interface EditorActions {
  setDocument: (doc: Partial<EditorDocument>) => void;
  resetDocument: (doc: EditorDocument) => void;
  updateBlock: (blockId: string, data: Partial<EditorBlock['data']>) => void;
  setSelectedBlockId: (id: string | null) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setInspectorOpen: (open: boolean) => void;
  addBlock: (block: EditorBlock, parentId: string, index?: number) => string;
  addBlockToColumn: (
    block: EditorBlock,
    parentId: string,
    columnIndex: number,
    index?: number
  ) => string;
  deleteBlock: (blockId: string) => void;
  moveBlockUp: (blockId: string, parentId: string) => void;
  moveBlockDown: (blockId: string, parentId: string) => void;
  moveBlock: (
    blockId: string,
    fromParentId: string,
    toParentId: string,
    toIndex: number,
    toColumnIndex?: number
  ) => void;
  duplicateBlock: (blockId: string) => void;
  copyBlock: (blockId: string) => void;
  pasteBlock: (parentId: string, index?: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setIsPdf: (isPdf: boolean) => void;
}

const DEFAULT_DOCUMENT: EditorDocument = {
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

function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getColumns(block: EditorBlock): Array<{ childrenIds: string[] }> | null {
  const props = block.data.props as Record<string, unknown> | undefined;
  return (props?.columns as Array<{ childrenIds: string[] }>) || null;
}

function getChildrenIds(block: EditorBlock): string[] | null {
  const props = block.data.props as Record<string, unknown> | undefined;
  if (props?.childrenIds) {
    return props.childrenIds as string[];
  }
  if (block.data.childrenIds) {
    return block.data.childrenIds as string[];
  }
  return null;
}

function findParentOfBlock(
  doc: EditorDocument,
  blockId: string
): { parentId: string; columnIndex?: number } | null {
  for (const [id, block] of Object.entries(doc)) {
    const childrenIds = getChildrenIds(block);
    if (childrenIds?.includes(blockId)) {
      return { parentId: id };
    }
    const columns = getColumns(block);
    if (columns) {
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].childrenIds.includes(blockId)) {
          return { parentId: id, columnIndex: i };
        }
      }
    }
  }
  return null;
}

function collectChildBlocks(doc: EditorDocument, blockId: string): EditorDocument {
  const result: EditorDocument = {};
  const block = doc[blockId];
  if (!block) return result;

  result[blockId] = deepClone(block);

  const childrenIds = getChildrenIds(block);
  if (childrenIds) {
    for (const childId of childrenIds) {
      Object.assign(result, collectChildBlocks(doc, childId));
    }
  }

  const columns = getColumns(block);
  if (columns) {
    for (const column of columns) {
      for (const childId of column.childrenIds) {
        Object.assign(result, collectChildBlocks(doc, childId));
      }
    }
  }

  return result;
}

function remapBlockIds(blocks: EditorDocument): {
  blocks: EditorDocument;
  idMap: Record<string, string>;
} {
  const idMap: Record<string, string> = {};
  const newBlocks: EditorDocument = {};

  for (const oldId of Object.keys(blocks)) {
    idMap[oldId] = generateBlockId();
  }

  for (const [oldId, block] of Object.entries(blocks)) {
    const newBlock = deepClone(block);
    const props = newBlock.data.props as Record<string, unknown> | undefined;

    if (props?.childrenIds) {
      props.childrenIds = (props.childrenIds as string[]).map((id) => idMap[id] || id);
    }

    if (props?.columns) {
      props.columns = (props.columns as Array<{ childrenIds: string[] }>).map((col) => ({
        ...col,
        childrenIds: col.childrenIds.map((id) => idMap[id] || id),
      }));
    }

    newBlocks[idMap[oldId]] = newBlock;
  }

  return { blocks: newBlocks, idMap };
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  document: DEFAULT_DOCUMENT,
  selectedBlockId: null,
  selectedSidebarTab: 'styles',
  inspectorOpen: true,
  history: [DEFAULT_DOCUMENT],
  historyIndex: 0,
  clipboard: null,
  isPdf: false,

  setDocument: (doc) => {
    const state = get();
    const newDoc = { ...state.document, ...doc } as EditorDocument;
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }
    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  resetDocument: (doc) => {
    set({
      document: doc,
      selectedBlockId: null,
      selectedSidebarTab: 'styles',
      history: [deepClone(doc)],
      historyIndex: 0,
    });
  },

  updateBlock: (blockId, data) => {
    const state = get();
    const block = state.document[blockId];
    if (!block) return;

    const newDoc = {
      ...state.document,
      [blockId]: {
        ...block,
        data: { ...block.data, ...data },
      },
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setSelectedBlockId: (id) => {
    const state = get();
    // Only change tab if selecting a different block
    const shouldChangeTab = id !== state.selectedBlockId;
    set({
      selectedBlockId: id,
      selectedSidebarTab: shouldChangeTab
        ? (id ? 'block-configuration' : 'styles')
        : state.selectedSidebarTab,
      inspectorOpen: id ? true : state.inspectorOpen,
    });
  },

  setSidebarTab: (tab) => set({ selectedSidebarTab: tab }),
  setInspectorOpen: (open) => set({ inspectorOpen: open }),

  addBlock: (block, parentId, index) => {
    const state = get();
    const blockId = generateBlockId();
    const parent = state.document[parentId];
    if (!parent) return blockId;

    const childrenIds = [...((parent.data.childrenIds as string[]) || [])];
    if (index !== undefined) {
      childrenIds.splice(index, 0, blockId);
    } else {
      childrenIds.push(blockId);
    }

    const newDoc = {
      ...state.document,
      [blockId]: block,
      [parentId]: {
        ...parent,
        data: { ...parent.data, childrenIds },
      },
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedBlockId: blockId,
      selectedSidebarTab: 'block-configuration',
    });

    return blockId;
  },

  addBlockToColumn: (block, parentId, columnIndex, index) => {
    const state = get();
    const blockId = generateBlockId();
    const parent = state.document[parentId];
    const props = parent?.data?.props as Record<string, unknown> | undefined;
    if (!parent || !props?.columns) return blockId;

    const columns = deepClone(props.columns as Array<{ childrenIds: string[] }>);
    if (!columns[columnIndex]) return blockId;

    if (index !== undefined) {
      columns[columnIndex].childrenIds.splice(index, 0, blockId);
    } else {
      columns[columnIndex].childrenIds.push(blockId);
    }

    const newDoc = {
      ...state.document,
      [blockId]: block,
      [parentId]: {
        ...parent,
        data: { ...parent.data, props: { ...props, columns } },
      },
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedBlockId: blockId,
      selectedSidebarTab: 'block-configuration',
    });

    return blockId;
  },

  deleteBlock: (blockId) => {
    const state = get();
    const newDoc = deepClone(state.document);

    const deleteRecursive = (id: string) => {
      const block = newDoc[id];
      if (!block) return;

      const childrenIds = getChildrenIds(block);
      if (childrenIds) {
        childrenIds.forEach(deleteRecursive);
      }

      const columns = getColumns(block);
      if (columns) {
        columns.forEach((col) => col.childrenIds.forEach(deleteRecursive));
      }

      delete newDoc[id];
    };

    deleteRecursive(blockId);

    Object.keys(newDoc).forEach((key) => {
      const block = newDoc[key];
      const props = block?.data?.props as Record<string, unknown> | undefined;
      if (props?.childrenIds) {
        props.childrenIds = (props.childrenIds as string[]).filter((id) => id !== blockId);
      }
      if (props?.columns) {
        props.columns = (props.columns as Array<{ childrenIds: string[] }>).map((col) => ({
          ...col,
          childrenIds: col.childrenIds.filter((id) => id !== blockId),
        }));
      }
      if (block?.data?.childrenIds) {
        block.data.childrenIds = (block.data.childrenIds as string[]).filter(
          (id) => id !== blockId
        );
      }
    });

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
    });
  },

  moveBlockUp: (blockId, parentId) => {
    const state = get();
    const parent = state.document[parentId];
    if (!parent?.data?.childrenIds) return;

    const childrenIds = [...(parent.data.childrenIds as string[])];
    const index = childrenIds.indexOf(blockId);
    if (index <= 0) return;

    [childrenIds[index - 1], childrenIds[index]] = [childrenIds[index], childrenIds[index - 1]];

    const newDoc = {
      ...state.document,
      [parentId]: {
        ...parent,
        data: { ...parent.data, childrenIds },
      },
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  moveBlockDown: (blockId, parentId) => {
    const state = get();
    const parent = state.document[parentId];
    if (!parent?.data?.childrenIds) return;

    const childrenIds = [...(parent.data.childrenIds as string[])];
    const index = childrenIds.indexOf(blockId);
    if (index < 0 || index >= childrenIds.length - 1) return;

    [childrenIds[index], childrenIds[index + 1]] = [childrenIds[index + 1], childrenIds[index]];

    const newDoc = {
      ...state.document,
      [parentId]: {
        ...parent,
        data: { ...parent.data, childrenIds },
      },
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  moveBlock: (blockId, fromParentId, toParentId, toIndex, toColumnIndex) => {
    const state = get();
    const newDoc = deepClone(state.document);

    const fromParent = newDoc[fromParentId];
    if (!fromParent) return;

    const parentInfo = findParentOfBlock(newDoc, blockId);
    if (!parentInfo) return;

    const fromProps = fromParent.data.props as Record<string, unknown> | undefined;
    if (parentInfo.columnIndex !== undefined && fromProps?.columns) {
      const columns = fromProps.columns as Array<{ childrenIds: string[] }>;
      columns[parentInfo.columnIndex].childrenIds = columns[
        parentInfo.columnIndex
      ].childrenIds.filter((id) => id !== blockId);
    } else if (fromProps?.childrenIds) {
      fromProps.childrenIds = (fromProps.childrenIds as string[]).filter((id) => id !== blockId);
    } else if (fromParent.data.childrenIds) {
      fromParent.data.childrenIds = (fromParent.data.childrenIds as string[]).filter(
        (id) => id !== blockId
      );
    }

    const toParent = newDoc[toParentId];
    if (!toParent) return;

    const toProps = toParent.data.props as Record<string, unknown> | undefined;
    if (toColumnIndex !== undefined && toProps?.columns) {
      const columns = toProps.columns as Array<{ childrenIds: string[] }>;
      columns[toColumnIndex].childrenIds.splice(toIndex, 0, blockId);
    } else if (toProps?.childrenIds !== undefined) {
      const childrenIds = toProps.childrenIds as string[];
      childrenIds.splice(toIndex, 0, blockId);
    } else if (toParent.data.childrenIds !== undefined) {
      const childrenIds = toParent.data.childrenIds as string[];
      childrenIds.splice(toIndex, 0, blockId);
    }

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  duplicateBlock: (blockId) => {
    const state = get();
    const parentInfo = findParentOfBlock(state.document, blockId);
    if (!parentInfo) return;

    const childBlocks = collectChildBlocks(state.document, blockId);
    const { blocks: newBlocks, idMap } = remapBlockIds(childBlocks);
    const newBlockId = idMap[blockId];

    const newDoc = { ...state.document, ...newBlocks };

    if (parentInfo.columnIndex !== undefined) {
      const parent = newDoc[parentInfo.parentId];
      const props = parent.data.props as Record<string, unknown>;
      const columns = deepClone(props.columns as Array<{ childrenIds: string[] }>);
      const colChildrenIds = columns[parentInfo.columnIndex].childrenIds;
      const index = colChildrenIds.indexOf(blockId);
      colChildrenIds.splice(index + 1, 0, newBlockId);
      newDoc[parentInfo.parentId] = {
        ...parent,
        data: { ...parent.data, props: { ...props, columns } },
      };
    } else {
      const parent = newDoc[parentInfo.parentId];
      const props = parent.data.props as Record<string, unknown>;
      const childrenIds = [...(props.childrenIds as string[])];
      const index = childrenIds.indexOf(blockId);
      childrenIds.splice(index + 1, 0, newBlockId);
      newDoc[parentInfo.parentId] = {
        ...parent,
        data: { ...parent.data, props: { ...props, childrenIds } },
      };
    }

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedBlockId: newBlockId,
    });
  },

  copyBlock: (blockId) => {
    const state = get();
    const block = state.document[blockId];
    if (!block) return;

    const childBlocks = collectChildBlocks(state.document, blockId);
    delete childBlocks[blockId];

    set({
      clipboard: {
        block: deepClone(block),
        childBlocks: Object.keys(childBlocks).length > 0 ? childBlocks : undefined,
      },
    });
  },

  pasteBlock: (parentId, index) => {
    const state = get();
    if (!state.clipboard) return;

    const { block, childBlocks } = state.clipboard;
    const allBlocks: EditorDocument = { temp: block, ...(childBlocks || {}) };
    const { blocks: newBlocks, idMap } = remapBlockIds(allBlocks);
    const newBlockId = idMap['temp'];

    const parent = state.document[parentId];
    if (!parent) return;

    const newDoc = { ...state.document };

    for (const [id, b] of Object.entries(newBlocks)) {
      if (id !== 'temp') {
        newDoc[id] = b;
      }
    }
    newDoc[newBlockId] = newBlocks[newBlockId];

    const childrenIds = [...((parent.data.childrenIds as string[]) || [])];
    if (index !== undefined) {
      childrenIds.splice(index, 0, newBlockId);
    } else {
      childrenIds.push(newBlockId);
    }
    newDoc[parentId] = { ...parent, data: { ...parent.data, childrenIds } };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(newDoc));
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      document: newDoc,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedBlockId: newBlockId,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;

    const newIndex = state.historyIndex - 1;
    set({
      document: deepClone(state.history[newIndex]),
      historyIndex: newIndex,
      selectedBlockId: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;

    const newIndex = state.historyIndex + 1;
    set({
      document: deepClone(state.history[newIndex]),
      historyIndex: newIndex,
      selectedBlockId: null,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  setIsPdf: (isPdf) => set({ isPdf }),
}));

export const useDocument = () => useEditorStore((s) => s.document);
export const useSelectedBlockId = () => useEditorStore((s) => s.selectedBlockId);
export const useSelectedBlock = () => {
  const doc = useEditorStore((s) => s.document);
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  return selectedId ? doc[selectedId] : null;
};
export const useCanUndo = () => useEditorStore((s) => s.historyIndex > 0);
export const useCanRedo = () => useEditorStore((s) => s.historyIndex < s.history.length - 1);
export const useClipboard = () => useEditorStore((s) => s.clipboard);
