import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@ui-sdk/react/menu";
import { blockTypes } from "../../src/blocks/model";
import { BaseRows } from "./base";
import { worstCase } from "./content";
import { useBlocks } from "./use-blocks";

// Axis: actions live on the row. A plus before the handle, a menu at the end of the line.
export function Gutter() {
  const root = React.useRef(null);
  const editor = useBlocks(worstCase, root);

  function run(block, value) {
    if (value === "duplicate") editor.duplicate(block.id);
    else if (value === "delete") editor.remove(block.id);
    else editor.setType(block.id, value);
  }

  return (
    <div className="editor v-gutter" ref={root}>
      <BaseRows
        editor={editor}
        before={(block, position) => (
          <Button
            className="g-add"
            aria-label={`Add a block below block ${position}`}
            onClick={() => editor.insertAfter(block.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        )}
        after={(block, position) => (
          <Menu onAction={(value) => run(block, value)}>
            <MenuTrigger className="g-more" aria-label={`More actions for block ${position}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="5" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="19" cy="12" r="1.6" />
              </svg>
            </MenuTrigger>
            <MenuContent>
              {blockTypes
                .filter((entry) => entry.value !== block.type)
                .map((entry) => (
                  <MenuItem key={entry.value} value={entry.value}>
                    Turn into {entry.label}
                  </MenuItem>
                ))}
              <MenuSeparator />
              <MenuItem value="duplicate">Duplicate</MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
            </MenuContent>
          </Menu>
        )}
      />
    </div>
  );
}
