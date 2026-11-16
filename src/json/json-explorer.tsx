import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { Textarea } from "@ui-sdk/react/textarea";
import { toast } from "@ui-sdk/react/toast";
import { Tree, TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from "@ui-sdk/react/tree";
import { branchIds, filterNode, flatten, parseJson, sample } from "./json-model";
import type { JsonNode } from "./json-model";

function JsonExplorer() {
  const [text, setText] = React.useState(sample);
  const [search, setSearch] = React.useState("");
  const [expanded, setExpanded] = React.useState<string[]>(["n"]);
  const [selected, setSelected] = React.useState<string | null>("n");

  const parsed = React.useMemo(() => parseJson(text), [text]);
  const tree = "node" in parsed ? parsed.node : null;
  const words = search.trim().toLowerCase();
  const shown = tree && words ? filterNode(tree, words) : tree;
  const all = tree ? flatten(tree) : [];
  const current = all.find((node) => node.id === selected) ?? null;

  async function copy(value: string, what: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast(`Copied the ${what}`);
    } catch {
      toast("The browser blocked the clipboard");
    }
  }

  return (
    <div className="json">
      <div className="json-source">
        <Field invalid={"error" in parsed ? true : undefined}>
          <FieldLabel>JSON source</FieldLabel>
          <Textarea
            className="json-input"
            spellCheck={false}
            value={text}
            onValueChange={setText}
          />
          <FieldError>{"error" in parsed ? parsed.error : null}</FieldError>
        </Field>
      </div>

      <div className="json-tree">
        <div className="toolbar-row">
          <Field>
            <FieldLabel>Filter keys and values</FieldLabel>
            <Input type="search" value={search} onValueChange={setSearch} />
          </Field>
          <div className="button-row">
            <Button onClick={() => tree && setExpanded(branchIds(tree))}>Expand all</Button>
            <Button onClick={() => setExpanded([])}>Collapse all</Button>
          </div>
        </div>
        {shown ? (
          <Tree
            aria-label="JSON tree"
            value={selected}
            onValueChange={setSelected}
            expanded={words ? branchIds(shown) : expanded}
            onExpandedChange={(next) => {
              if (!words) {
                setExpanded(next);
              }
            }}
          >
            <Nodes nodes={[shown]} words={words} />
          </Tree>
        ) : (
          <p className="hint">
            {tree ? "Nothing matches the filter." : "Fix the JSON to see the tree."}
          </p>
        )}
      </div>

      <div className="json-detail">
        <h3>Selected node</h3>
        {current ? (
          <>
            <code className="json-path">{current.path}</code>
            <p className="hint">
              {current.kind}
              {current.children ? ` · ${current.preview}` : ""}
            </p>
            <pre className="code-box">{JSON.stringify(current.value, null, 2)}</pre>
            <div className="button-row">
              <Button onClick={() => copy(current.path, "path")}>Copy path</Button>
              <Button onClick={() => copy(JSON.stringify(current.value, null, 2), "value")}>
                Copy value
              </Button>
            </div>
          </>
        ) : (
          <p className="hint">Select a node in the tree.</p>
        )}
      </div>
    </div>
  );
}

interface NodesProps {
  nodes: JsonNode[];
  words: string;
}

function Nodes({ nodes, words }: NodesProps) {
  return nodes.map((node) => (
    <TreeItem key={node.id} value={node.id} label={node.name}>
      <TreeItemLabel>
        {node.children ? <TreeItemIndicator /> : <span className="tree-spacer" />}
        <span className="json-key">
          <Marked text={node.name} words={words} />
        </span>
        <span className="json-value" data-kind={node.kind}>
          {node.children ? node.preview : <Marked text={node.preview} words={words} />}
        </span>
      </TreeItemLabel>
      {node.children && (
        <TreeGroup>
          <Nodes nodes={node.children} words={words} />
        </TreeGroup>
      )}
    </TreeItem>
  ));
}

interface MarkedProps {
  text: string;
  words: string;
}

function Marked({ text, words }: MarkedProps) {
  const at = words ? text.toLowerCase().indexOf(words) : -1;
  if (at < 0) {
    return text;
  }
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + words.length)}</mark>
      {text.slice(at + words.length)}
    </>
  );
}

export { JsonExplorer };
