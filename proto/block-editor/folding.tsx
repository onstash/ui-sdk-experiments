import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import { BaseRows } from "./base";
import { worstCase } from "./content";
import { nameOf, sectionsOf } from "./sections";
import { useBlocks } from "./use-blocks";

// Axis: shrink the page instead of jumping around it. Each heading folds the blocks under it.
export function Folding() {
  const root = React.useRef(null);
  const editor = useBlocks(worstCase, root);
  // Heading id -> block count when it was folded. A fold opens again when its section changes size.
  const [folded, setFolded] = React.useState({});
  const { sections } = sectionsOf(editor.blocks, null);
  const isFolded = (section) => folded[section.heading.id] === section.ids.length;
  const hiddenIds = new Set(sections.filter(isFolded).flatMap((section) => section.ids.slice(1)));
  editor.setHidden((block) => hiddenIds.has(block.id));

  const foldable = sections.filter((section) => section.ids.length > 1);
  const allFolded = foldable.length > 0 && foldable.every(isFolded);

  function toggle(section) {
    setFolded((current) => {
      const next = { ...current };
      if (isFolded(section)) delete next[section.heading.id];
      else next[section.heading.id] = section.ids.length;
      return next;
    });
  }

  return (
    <div className="editor v-folding" ref={root}>
      <div className="f-tools">
        <Button
          disabled={foldable.length === 0}
          onClick={() =>
            setFolded(
              allFolded
                ? {}
                : Object.fromEntries(
                    foldable.map((section) => [section.heading.id, section.ids.length]),
                  ),
            )
          }
        >
          {allFolded ? "Unfold all sections" : "Fold all sections"}
        </Button>
      </div>
      <BaseRows
        editor={editor}
        isHidden={(block) => hiddenIds.has(block.id)}
        before={(block) => {
          const section = sections.find((entry) => entry.heading.id === block.id);
          if (!section || section.ids.length < 2) return <span className="f-spacer" />;
          return (
            <Button
              className="f-fold"
              aria-expanded={!isFolded(section)}
              aria-label={`${isFolded(section) ? "Unfold" : "Fold"} section ${nameOf(section)}`}
              onClick={() => toggle(section)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Button>
          );
        }}
        after={(block) => {
          const section = sections.find((entry) => entry.heading.id === block.id);
          if (!section || !isFolded(section)) return null;
          return (
            <span className="f-count">
              {section.ids.length - 1} hidden
              {section.todos > 0 ? ` · ${section.done}/${section.todos} done` : ""}
            </span>
          );
        }}
      />
    </div>
  );
}
