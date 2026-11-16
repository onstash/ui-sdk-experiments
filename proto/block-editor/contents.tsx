import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import { BaseRows } from "./base";
import { sectionsOf } from "./sections";
import { worstCase } from "./content";
import { useBlocks } from "./use-blocks";

// Axis: document-level navigation. The baseline page, plus a rail built from its headings.
export function Contents() {
  const root = React.useRef(null);
  const editor = useBlocks(worstCase, root);
  const [activeId, setActiveId] = React.useState(null);

  const { sections, current } = sectionsOf(editor.blocks, activeId);

  return (
    <div className="v-contents">
      <div className="editor" ref={root}>
        <BaseRows editor={editor} onFocusBlock={setActiveId} />
      </div>
      <nav className="c-rail" aria-label="On this page">
        <p className="c-title">On this page</p>
        {sections.length === 0 ? (
          <p className="hint">Add a heading with # or ## to build a contents list.</p>
        ) : (
          <ul>
            {sections.map((section) => (
              <li key={section.heading.id} data-level={section.heading.type}>
                <Button
                  className="c-link"
                  aria-current={section === current ? "location" : undefined}
                  onClick={() => editor.focus(section.heading.id)}
                >
                  <span className="c-name">{section.heading.text || "Untitled heading"}</span>
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
      </nav>
    </div>
  );
}
