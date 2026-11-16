import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu";
import { blockTypes, shortcuts, typeLabel } from "../../src/blocks/model";

// The text field every variant shares: slash menu, Markdown shortcuts, split, join, and Alt+Arrow to move.
export function BlockField({ block, position, editor, placeholder, className = "p-text" }) {
  const menuOpen = React.useRef(false);
  const field = React.useRef(null);

  React.useEffect(() => {
    if (field.current && field.current.value !== block.text) field.current.value = block.text;
  }, [block.text]);

  if (block.type === "divider") {
    return (
      <div className="p-divider">
        <hr />
        <Button
          data-block-focus
          aria-label={`Delete divider, block ${position}`}
          onClick={() => editor.remove(block.id)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" || event.key === "Delete") editor.remove(block.id);
            if (event.altKey && event.key === "ArrowUp") editor.move(block.id, -1);
            if (event.altKey && event.key === "ArrowDown") editor.move(block.id, 1);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Button>
      </div>
    );
  }

  function onInput(event) {
    const element = event.currentTarget;
    const type = block.type === "text" ? shortcuts[element.value] : undefined;
    if (type) {
      element.value = "";
      editor.update(block.id, { text: "" });
      editor.setType(block.id, type);
      return;
    }
    editor.update(block.id, { text: element.value });
  }

  function onKeyDown(event) {
    if (menuOpen.current || event.nativeEvent.isComposing) return;
    const element = event.currentTarget;
    const { selectionStart, selectionEnd, value } = element;
    const collapsed = selectionStart === selectionEnd;

    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      editor.move(block.id, event.key === "ArrowUp" ? -1 : 1, selectionStart);
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      if (block.type === "code" && !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      if (value === "" && block.type !== "text") {
        editor.setType(block.id, "text");
        return;
      }
      editor.split(block.id, value.slice(0, selectionStart), value.slice(selectionEnd));
      return;
    }
    if (event.key === "Backspace" && collapsed && selectionStart === 0) {
      event.preventDefault();
      if (block.type !== "text") editor.setType(block.id, "text");
      else editor.merge(block.id);
      return;
    }
    if (event.key === "ArrowUp" && collapsed && selectionStart === 0) {
      if (editor.focusNeighbor(block.id, -1)) event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown" && collapsed && selectionStart === value.length) {
      if (editor.focusNeighbor(block.id, 1)) event.preventDefault();
    }
  }

  return (
    <TriggerMenu
      triggers={[{ char: "/" }]}
      onOpenChange={(open) => {
        menuOpen.current = open;
      }}
    >
      <TriggerMenuInput
        ref={field}
        data-block-focus
        className={className}
        data-checked={block.checked ? "" : undefined}
        aria-label={`Block ${position}, ${typeLabel(block.type)}`}
        placeholder={
          placeholder ?? (block.type === "text" ? "Type / for blocks" : typeLabel(block.type))
        }
        rows={1}
        spellCheck={block.type !== "code"}
        defaultValue={block.text}
        onInput={onInput}
        onKeyDown={onKeyDown}
      />
      <TriggerMenuContent className="slash-menu">
        <TriggerMenuEmpty>No block matches</TriggerMenuEmpty>
        <TriggerMenuList>
          {blockTypes.map((entry) => (
            <TriggerMenuItem
              key={entry.value}
              value={entry.value}
              label={entry.label}
              onSelect={(value, details) => {
                details.insert("");
                editor.update(block.id, { text: field.current?.value ?? "" });
                editor.setType(block.id, value);
              }}
            >
              <span>{entry.label}</span>
              <span className="hint">{entry.hint}</span>
            </TriggerMenuItem>
          ))}
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  );
}
