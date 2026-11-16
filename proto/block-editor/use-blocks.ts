import * as React from "react";
import { createBlock } from "../../src/blocks/model";

export function useBlocks(initial, root) {
  const [blocks, setBlocks] = React.useState(initial);
  const focusRequest = React.useRef(null);

  React.useEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    focusRequest.current = null;
    const target = root.current?.querySelector(
      `[data-block-id="${request.id}"] [data-block-focus]`,
    );
    target?.focus();
    if (target instanceof HTMLTextAreaElement) {
      const caret = Math.min(request.caret, target.value.length);
      target.setSelectionRange(caret, caret);
    }
  }, [blocks, root]);

  const hidden = React.useRef(() => false);
  const focusBlock = (id, caret = 0) => {
    focusRequest.current = { id, caret };
  };
  const indexOf = (id) => blocks.findIndex((block) => block.id === id);

  const api = {
    blocks,
    update(id, patch) {
      setBlocks((current) =>
        current.map((block) => (block.id === id ? { ...block, ...patch } : block)),
      );
    },
    setType(id, type) {
      if (type !== "divider") {
        api.update(id, { type });
        focusBlock(id, Number.MAX_SAFE_INTEGER);
        return;
      }
      const next = createBlock();
      setBlocks((current) =>
        current.flatMap((block) =>
          block.id === id ? [{ ...block, type, text: "" }, next] : [block],
        ),
      );
      focusBlock(next.id);
    },
    insertAfter(id, type = "text", text = "") {
      const block = createBlock(type === "divider" ? "text" : type, text);
      setBlocks((current) =>
        current.flatMap((entry) => (entry.id === id ? [entry, block] : [entry])),
      );
      focusBlock(block.id);
    },
    split(id, before, after) {
      const block = blocks[indexOf(id)];
      api.update(id, { text: before });
      api.insertAfter(id, block.type === "todo" ? "todo" : "text", after);
    },
    remove(id) {
      const index = indexOf(id);
      const neighbor = blocks[index - 1] ?? blocks[index + 1];
      if (!neighbor) {
        api.update(id, { type: "text", text: "", checked: false });
        focusBlock(id);
        return;
      }
      setBlocks((current) => current.filter((block) => block.id !== id));
      focusBlock(neighbor.id, neighbor.text.length);
    },
    merge(id) {
      const index = indexOf(id);
      const previous = blocks[index - 1];
      const block = blocks[index];
      if (!previous) return;
      if (previous.type === "divider") {
        setBlocks((current) => current.filter((entry) => entry.id !== previous.id));
        focusBlock(id);
        return;
      }
      setBlocks((current) =>
        current
          .filter((entry) => entry.id !== id)
          .map((entry) =>
            entry.id === previous.id ? { ...entry, text: previous.text + block.text } : entry,
          ),
      );
      focusBlock(previous.id, previous.text.length);
    },
    setHidden(test) {
      hidden.current = test;
    },
    focusNeighbor(id, step) {
      let at = indexOf(id) + step;
      while (blocks[at] && hidden.current(blocks[at])) at += step;
      const neighbor = blocks[at];
      if (!neighbor) return false;
      focusBlock(neighbor.id, step === -1 ? neighbor.text.length : 0);
      setBlocks((current) => [...current]);
      return true;
    },
    reorder(order) {
      setBlocks((current) => order.flatMap((id) => current.find((block) => block.id === id) ?? []));
    },
    duplicate(id) {
      const block = blocks[indexOf(id)];
      const copy = { ...createBlock(block.type, block.text), checked: block.checked };
      setBlocks((current) =>
        current.flatMap((entry) => (entry.id === id ? [entry, copy] : [entry])),
      );
      focusBlock(copy.id, copy.text.length);
    },
    focus(id) {
      focusBlock(id, Number.MAX_SAFE_INTEGER);
      setBlocks((current) => [...current]);
    },
    move(id, step, caret = 0) {
      const index = indexOf(id);
      const target = index + step;
      if (target < 0 || target >= blocks.length) return;
      setBlocks((current) => {
        const next = [...current];
        const [block] = next.splice(index, 1);
        next.splice(target, 0, block);
        return next;
      });
      focusBlock(id, caret);
    },
  };
  return api;
}
