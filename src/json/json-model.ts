type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type JsonKind = "object" | "array" | "string" | "number" | "boolean" | "null";

interface JsonNode {
  // Tree values go into selectors, so they can't hold quotes or brackets like a path does.
  id: string;
  path: string;
  name: string;
  kind: JsonKind;
  preview: string;
  value: JsonValue;
  children?: JsonNode[];
}

function kindOf(value: JsonValue): JsonKind {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value as JsonKind;
}

const plainKey = /^[A-Za-z_$][\w$]*$/;

function childPath(parent: string, key: string | number) {
  if (typeof key === "number") {
    return `${parent}[${key}]`;
  }
  return plainKey.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
}

function toNode(value: JsonValue, name: string, path: string, id: string): JsonNode {
  const kind = kindOf(value);
  if (kind === "array") {
    const items = value as JsonValue[];
    return {
      id,
      path,
      name,
      kind,
      value,
      preview: `${items.length} ${items.length === 1 ? "item" : "items"}`,
      children: items.map((item, index) =>
        toNode(item, String(index), childPath(path, index), `${id}-${index}`),
      ),
    };
  }
  if (kind === "object") {
    const entries = Object.entries(value as Record<string, JsonValue>);
    return {
      id,
      path,
      name,
      kind,
      value,
      preview: `${entries.length} ${entries.length === 1 ? "key" : "keys"}`,
      children: entries.map(([key, child], index) =>
        toNode(child, key, childPath(path, key), `${id}-${index}`),
      ),
    };
  }
  return { id, path, name, kind, value, preview: JSON.stringify(value) };
}

function parseJson(text: string): { node: JsonNode } | { error: string } {
  try {
    return { node: toNode(JSON.parse(text) as JsonValue, "$", "$", "n") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

function flatten(node: JsonNode): JsonNode[] {
  return [node, ...(node.children ?? []).flatMap(flatten)];
}

function branchIds(node: JsonNode) {
  return flatten(node)
    .filter((entry) => entry.children)
    .map((entry) => entry.id);
}

// Keeps a node when it or something below it matches, so a match stays reachable.
function filterNode(node: JsonNode, words: string): JsonNode | null {
  const own =
    node.name.toLowerCase().includes(words) ||
    (!node.children && node.preview.toLowerCase().includes(words));
  const children = node.children
    ?.map((child) => filterNode(child, words))
    .filter((child) => child !== null);
  if (own) {
    return node;
  }
  if (children?.length) {
    return { ...node, children };
  }
  return null;
}

const sample = JSON.stringify(
  {
    name: "Aurora",
    version: "2.4.0",
    private: false,
    tags: ["ui", "experimental", "keyboard-first"],
    author: { name: "Rowan", links: { site: "https://example.com", feed: null } },
    scripts: { dev: "vite", build: "vite build", test: "vitest run" },
    releases: [
      { id: 1, date: "2026-01-12", stable: true, downloads: 1830 },
      { id: 2, date: "2026-04-03", stable: true, downloads: 9412 },
      { id: 3, date: "2026-09-21", stable: false, downloads: 207 },
    ],
    "odd key": { "a.b": [1.5, -2, 3e8] },
  },
  null,
  2,
);

export { branchIds, filterNode, flatten, parseJson, sample };
export type { JsonKind, JsonNode, JsonValue };
