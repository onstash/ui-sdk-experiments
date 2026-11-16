import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { BlockList, BlockListHandle, BlockListItem } from "../../src/blocks/block-list-parts";
import { BlockField } from "./block-field";

// The baseline's row, rebuilt here so riffs can add to it without touching src/.
export function BaseRows({ editor, before, after, onFocusBlock, isHidden }) {
  const { blocks } = editor;
  return (
    <BlockList
      aria-label="Page blocks"
      value={blocks.map((block) => block.id)}
      onValueChange={editor.reorder}
    >
      {({ order }) =>
        order.map((id) => {
          const block = blocks.find((entry) => entry.id === id);
          if (!block) return null;
          const position = blocks.indexOf(block) + 1;
          return (
            <BlockListItem
              key={block.id}
              value={block.id}
              className="block"
              data-block-id={block.id}
              data-type={block.type}
              hidden={isHidden?.(block) || undefined}
              onFocus={() => onFocusBlock?.(block.id)}
            >
              {before?.(block, position)}
              <BlockListHandle className="block-handle" aria-label={`Move block ${position}`}>
                <svg viewBox="0 0 10 16" aria-hidden="true">
                  <circle cx="2" cy="3" r="1.4" />
                  <circle cx="8" cy="3" r="1.4" />
                  <circle cx="2" cy="8" r="1.4" />
                  <circle cx="8" cy="8" r="1.4" />
                  <circle cx="2" cy="13" r="1.4" />
                  <circle cx="8" cy="13" r="1.4" />
                </svg>
              </BlockListHandle>
              <div className="block-body">
                {block.type === "todo" && (
                  <Checkbox
                    aria-label={`Done, block ${position}`}
                    checked={block.checked}
                    onCheckedChange={(checked) =>
                      editor.update(block.id, { checked: checked === true })
                    }
                  >
                    <CheckboxIndicator />
                  </Checkbox>
                )}
                <BlockField
                  block={block}
                  position={position}
                  editor={editor}
                  className="block-text"
                />
              </div>
              {after?.(block, position)}
            </BlockListItem>
          );
        })
      }
    </BlockList>
  );
}
