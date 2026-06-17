import { create } from "zustand";

import type {
  ChangeColorBlock,
  MoveBlock,
  ProgramBlock,
  RepeatBlock,
  RotateBlock,
} from "../types/block";
import { createId } from "../utils/createId";

const ROOT_CONTAINER_ID = "root";

const updateBlockRecursively = (
  blocks: ProgramBlock[],
  id: string,
  changes: Partial<ProgramBlock>,
): ProgramBlock[] =>
  blocks.map((block) => {
    if (block.id === id) {
      return {
        ...block,
        ...changes,
      } as ProgramBlock;
    }

    if (block.type === "repeat") {
      return {
        ...block,
        children: updateBlockRecursively(block.children, id, changes),
      };
    }

    return block;
  });

const removeBlockRecursively = (
  blocks: ProgramBlock[],
  id: string,
): {
  blocks: ProgramBlock[];
  removedBlock: ProgramBlock | null;
} => {
  let removedBlock: ProgramBlock | null = null;

  const nextBlocks: ProgramBlock[] = [];

  for (const block of blocks) {
    if (block.id === id) {
      removedBlock = block;
      continue;
    }

    if (block.type === "repeat") {
      const childResult = removeBlockRecursively(block.children, id);

      if (childResult.removedBlock) {
        removedBlock = childResult.removedBlock;
      }

      nextBlocks.push({
        ...block,
        children: childResult.blocks,
      });

      continue;
    }

    nextBlocks.push(block);
  }

  return {
    blocks: nextBlocks,
    removedBlock,
  };
};

const insertBlockRecursively = (
  blocks: ProgramBlock[],
  parentId: string,
  blockToInsert: ProgramBlock,
  overId: string | null,
): ProgramBlock[] => {
  if (parentId === ROOT_CONTAINER_ID) {
    const nextBlocks = [...blocks];

    if (!overId) {
      nextBlocks.push(blockToInsert);
      return nextBlocks;
    }

    const overIndex = nextBlocks.findIndex((block) => block.id === overId);

    if (overIndex === -1) {
      nextBlocks.push(blockToInsert);
      return nextBlocks;
    }

    nextBlocks.splice(overIndex, 0, blockToInsert);
    return nextBlocks;
  }

  return blocks.map((block) => {
    if (block.type !== "repeat") {
      return block;
    }

    if (block.id === parentId) {
      const nextChildren = [...block.children];

      if (!overId) {
        nextChildren.push(blockToInsert);
      } else {
        const overIndex = nextChildren.findIndex(
          (child) => child.id === overId,
        );

        if (overIndex === -1) {
          nextChildren.push(blockToInsert);
        } else {
          nextChildren.splice(overIndex, 0, blockToInsert);
        }
      }

      return {
        ...block,
        children: nextChildren,
      };
    }

    return {
      ...block,
      children: insertBlockRecursively(
        block.children,
        parentId,
        blockToInsert,
        overId,
      ),
    };
  });
};

const findParentId = (
  blocks: ProgramBlock[],
  targetId: string,
  parentId = ROOT_CONTAINER_ID,
): string | null => {
  for (const block of blocks) {
    if (block.id === targetId) {
      return parentId;
    }

    if (block.type === "repeat") {
      const childParentId = findParentId(block.children, targetId, block.id);

      if (childParentId) {
        return childParentId;
      }
    }
  }

  return null;
};

const containsBlock = (block: ProgramBlock, targetId: string): boolean => {
  if (block.id === targetId) {
    return true;
  }

  if (block.type !== "repeat") {
    return false;
  }

  return block.children.some((child) => containsBlock(child, targetId));
};

const findBlock = (blocks: ProgramBlock[], id: string): ProgramBlock | null => {
  for (const block of blocks) {
    if (block.id === id) {
      return block;
    }

    if (block.type === "repeat") {
      const childBlock = findBlock(block.children, id);

      if (childBlock) {
        return childBlock;
      }
    }
  }

  return null;
};

export const getBlockParentId = (blocks: ProgramBlock[], blockId: string) =>
  findParentId(blocks, blockId);

export const countProgramBlocks = (blocks: ProgramBlock[]): number =>
  blocks.reduce((count, block) => {
    if (block.type === "repeat") {
      return count + 1 + countProgramBlocks(block.children);
    }

    return count + 1;
  }, 0);

interface ProgramState {
  blocks: ProgramBlock[];

  addMoveBlock: (targetShapeId: string) => void;
  addRotateBlock: (targetShapeId: string) => void;
  addChangeColorBlock: (targetShapeId: string) => void;
  addRepeatBlock: () => void;

  updateBlock: (id: string, changes: Partial<ProgramBlock>) => void;

  moveBlock: (
    activeId: string,
    targetParentId: string,
    overId?: string | null,
  ) => void;

  removeBlock: (id: string) => void;
  clearProgram: () => void;
}

export const useProgramStore = create<ProgramState>((set) => ({
  blocks: [],

  addMoveBlock: (targetShapeId) =>
    set((state) => {
      const block: MoveBlock = {
        id: createId("block"),
        type: "move",
        targetShapeId,
        direction: "right",
        distance: 50,
      };

      return {
        blocks: [...state.blocks, block],
      };
    }),

  addRotateBlock: (targetShapeId) =>
    set((state) => {
      const block: RotateBlock = {
        id: createId("block"),
        type: "rotate",
        targetShapeId,
        angle: 45,
      };

      return {
        blocks: [...state.blocks, block],
      };
    }),

  addChangeColorBlock: (targetShapeId) =>
    set((state) => {
      const block: ChangeColorBlock = {
        id: createId("block"),
        type: "changeColor",
        targetShapeId,
        color: "#0091ff",
      };

      return {
        blocks: [...state.blocks, block],
      };
    }),

  addRepeatBlock: () =>
    set((state) => {
      const block: RepeatBlock = {
        id: createId("block"),
        type: "repeat",
        count: 3,
        children: [],
      };

      return {
        blocks: [...state.blocks, block],
      };
    }),

  updateBlock: (id, changes) =>
    set((state) => ({
      blocks: updateBlockRecursively(state.blocks, id, changes),
    })),

  moveBlock: (activeId, targetParentId, overId = null) =>
    set((state) => {
      const activeBlock = findBlock(state.blocks, activeId);

      if (!activeBlock) {
        return state;
      }

      if (
        activeBlock.type === "repeat" &&
        targetParentId !== ROOT_CONTAINER_ID &&
        containsBlock(activeBlock, targetParentId)
      ) {
        return state;
      }

      if (activeId === targetParentId || activeId === overId) {
        return state;
      }

      const removeResult = removeBlockRecursively(state.blocks, activeId);

      if (!removeResult.removedBlock) {
        return state;
      }

      return {
        blocks: insertBlockRecursively(
          removeResult.blocks,
          targetParentId,
          removeResult.removedBlock,
          overId,
        ),
      };
    }),

  removeBlock: (id) =>
    set((state) => ({
      blocks: removeBlockRecursively(state.blocks, id).blocks,
    })),

  clearProgram: () => {
    set({
      blocks: [],
    });
  },
}));
