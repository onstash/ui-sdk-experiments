import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { blockTypes } from "../../src/blocks/model";
import { BaseRows } from "./base";
import { worstCase } from "./content";
import { useBlocks } from "./use-blocks";

const short = { text: "Text", h1: "H1", h2: "H2", todo: "To-do", quote: "Quote", code: "Code" };

// Axis: controls are always in view. A sticky bar acts on the block you were last in.
export function Toolbar() {
  const root = React.useRef(null);
  const editor = useBlocks(worstCase, root);
  const [activeId, setActiveId] = React.useState(null);
  const active = editor.blocks.find((block) => block.id === activeId) ?? null;
  const index = active ? editor.blocks.indexOf(active) : -1;

  return (
    <div className="editor v-toolbar" ref={root}>
      <div className="t-bar" role="group" aria-label="Block tools">
        <SegmentedControl
          aria-label="Block type"
          disabled={!active || active.type === "divider"}
          value={active && active.type !== "divider" ? active.type : null}
          onValueChange={(value) => active && value && editor.setType(active.id, value)}
        >
          <SegmentedControlIndicator />
          {blockTypes
            .filter((entry) => entry.value !== "divider")
            .map((entry) => (
              <SegmentedControlItem key={entry.value} value={entry.value}>
                {short[entry.value]}
              </SegmentedControlItem>
            ))}
        </SegmentedControl>
        <div className="t-actions">
          <Button
            disabled={!active || index === 0}
            onClick={() => editor.move(active.id, -1, Number.MAX_SAFE_INTEGER)}
          >
            Move up
          </Button>
          <Button
            disabled={!active || index === editor.blocks.length - 1}
            onClick={() => editor.move(active.id, 1, Number.MAX_SAFE_INTEGER)}
          >
            Move down
          </Button>
          <Button disabled={!active} onClick={() => editor.duplicate(active.id)}>
            Duplicate
          </Button>
          <Button
            disabled={!active}
            onClick={() => {
              editor.remove(active.id);
              setActiveId(null);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
      <p className="hint t-status" role="status" aria-label="Selected block">
        {active ? `Block ${index + 1} selected` : "Click into a block to use the tools"}
      </p>
      <BaseRows editor={editor} onFocusBlock={setActiveId} />
    </div>
  );
}
