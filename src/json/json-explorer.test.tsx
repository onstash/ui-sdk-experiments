import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { JsonExplorer } from "./json-explorer";
import { filterNode, parseJson } from "./json-model";

test("paths quote keys that are not plain names", () => {
  const parsed = parseJson('{"a": [{"b c": 1}], "d.e": true}');
  if (!("node" in parsed)) {
    throw new Error(parsed.error);
  }
  const paths = JSON.stringify(parsed.node);
  expect(paths).toContain('$.a[0][\\"b c\\"]');
  expect(paths).toContain('$[\\"d.e\\"]');
});

test("a filter keeps the ancestors of a match", () => {
  const parsed = parseJson('{"a": {"b": {"needle": 1}}, "c": 2}');
  if (!("node" in parsed)) {
    throw new Error(parsed.error);
  }
  const shown = filterNode(parsed.node, "needle");
  expect(shown?.children?.map((child) => child.name)).toEqual(["a"]);
});

test("invalid JSON shows an error and hides the tree", async () => {
  const user = userEvent.setup();
  render(<JsonExplorer />);
  const source = screen.getByLabelText("JSON source");
  await user.clear(source);
  await user.type(source, "{{ nope");
  expect(source.getAttribute("aria-invalid")).toBe("true");
  expect(screen.queryByRole("tree")).toBeNull();
  expect(screen.getByText("Fix the JSON to see the tree.")).toBeTruthy();
});

test("selecting a node shows its path and value", async () => {
  const user = userEvent.setup();
  render(<JsonExplorer />);

  await user.click(screen.getByRole("button", { name: "Expand all" }));
  await user.click(screen.getByRole("treeitem", { name: /^site/ }));
  expect(document.querySelector(".json-path")?.textContent).toBe("$.author.links.site");
  expect(document.querySelector(".code-box")?.textContent).toBe('"https://example.com"');
});

test("the filter narrows the tree and marks the match", async () => {
  const user = userEvent.setup();
  render(<JsonExplorer />);

  await user.type(screen.getByLabelText("Filter keys and values"), "downloads");
  const names = screen
    .getAllByRole("treeitem")
    .map((item) => item.querySelector(".json-key")?.textContent);
  expect(names).toEqual(["$", "releases", "0", "downloads", "1", "downloads", "2", "downloads"]);
  expect(document.querySelectorAll("mark")).toHaveLength(3);

  await user.clear(screen.getByLabelText("Filter keys and values"));
  await user.type(screen.getByLabelText("Filter keys and values"), "zzz");
  expect(screen.getByText("Nothing matches the filter.")).toBeTruthy();
});
