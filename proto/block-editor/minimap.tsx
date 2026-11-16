import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover";
import { BaseRows } from "./base";
import { worstCase } from "./content";
import { nameOf, sectionsOf } from "./sections";
import { useBlocks } from "./use-blocks";

// Axis: smallest footprint. One tick per block at the page edge; press it for the heading list.
export function Minimap() {
  const root = React.useRef(null);
  const editor = useBlocks(worstCase, root);
  const [activeId, setActiveId] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const { sections, current } = sectionsOf(editor.blocks, activeId);

  return (
    <div className="v-minimap">
      <div className="editor" ref={root}>
        <BaseRows editor={editor} onFocusBlock={setActiveId} />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="mm-strip" aria-label="Page outline">
          {editor.blocks.map((block) => (
            <span
              key={block.id}
              className="mm-tick"
              data-level={block.type === "h1" || block.type === "h2" ? block.type : undefined}
              data-current={current?.ids.includes(block.id) ? "" : undefined}
            />
          ))}
        </PopoverTrigger>
        <PopoverContent className="mm-panel" side="left" align="center">
          <PopoverTitle className="c-title">On this page</PopoverTitle>
          {sections.length === 0 ? (
            <p className="hint">Add a heading with # or ## to build an outline.</p>
          ) : (
            <ul className="mm-list">
              {sections.map((section) => (
                <li key={section.heading.id} data-level={section.heading.type}>
                  <Button
                    className="c-link"
                    aria-current={section === current ? "location" : undefined}
                    onClick={() => {
                      setOpen(false);
                      editor.focus(section.heading.id);
                    }}
                  >
                    <span className="c-name">{nameOf(section)}</span>
                    {section.todos > 0 && (
                      <span className="c-count">
                        {section.done}/{section.todos}
                      </span>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
