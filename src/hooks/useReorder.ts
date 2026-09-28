import { type DragEvent, useState } from "react";

/**
 * Lightweight HTML5 drag-and-drop reordering. Items only become draggable while
 * their handle is pressed, so text inside inputs stays selectable. Up/down buttons
 * should be offered alongside for keyboard and touch users.
 */
export function useReorder(onMove: (from: number, to: number) => void) {
  const [armedIndex, setArmedIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const reset = () => {
    setArmedIndex(null);
    setDragIndex(null);
  };

  return {
    dragIndex,
    handleProps: (index: number) => ({
      onPointerDown: () => setArmedIndex(index),
      onPointerUp: () => setArmedIndex(null),
    }),
    itemProps: (index: number) => ({
      draggable: armedIndex === index,
      onDragStart: (event: DragEvent) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        setDragIndex(index);
      },
      onDragOver: (event: DragEvent) => {
        if (dragIndex === null) return;
        event.preventDefault();
        if (dragIndex !== index) {
          onMove(dragIndex, index);
          setDragIndex(index);
        }
      },
      onDrop: (event: DragEvent) => event.preventDefault(),
      onDragEnd: reset,
    }),
  };
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}
