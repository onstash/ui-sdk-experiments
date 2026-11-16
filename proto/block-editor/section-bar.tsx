import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import { BaseRows } from "./base";
import { worstCase } from "./content";
import { nameOf, sectionsOf } from "./sections";
import { useBlocks } from "./use-blocks";

// Axis: no extra width. A sticky bar names the section you are in and jumps to any other.
export function SectionBar() {
  const root = React.useRef(null);
  const editor = useBlocks(worstCase, root);
  const [activeId, setActiveId] = React.useState(null);
  const { sections, current } = sectionsOf(editor.blocks, activeId);
  const at = current ? sections.indexOf(current) : -1;
  const shown = current ?? sections[0];

  function go(step) {
    const target = sections[(at < 0 ? 0 : at) + step];
    if (target) editor.focus(target.heading.id);
  }

  return (
    <div className="editor v-sectionbar" ref={root}>
      {sections.length > 0 && (
        <div className="sb-bar" role="group" aria-label="Section navigation">
          <Select
            value={shown.heading.id}
            onValueChange={(value) => value && editor.focus(value)}
            items={sections.map((section) => ({
              value: section.heading.id,
              label: nameOf(section),
            }))}
          >
            <SelectTrigger className="sb-trigger" aria-label="Jump to section">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.heading.id} value={section.heading.id}>
                  {nameOf(section)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shown.todos > 0 && (
            <span className="sb-count" role="status" aria-label="Section progress">
              {shown.done}/{shown.todos} done
            </span>
          )}
          <div className="sb-step">
            <Button aria-label="Previous section" disabled={at <= 0} onClick={() => go(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m18 15-6-6-6 6" />
              </svg>
            </Button>
            <Button
              aria-label="Next section"
              disabled={at >= sections.length - 1}
              onClick={() => go(1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
          </div>
        </div>
      )}
      <BaseRows editor={editor} onFocusBlock={setActiveId} />
    </div>
  );
}
