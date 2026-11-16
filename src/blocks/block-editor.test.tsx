import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { BlockEditor } from "./block-editor";

function blocks() {
  return [...document.querySelectorAll<HTMLElement>(".block")].map((block) => {
    const text = block.querySelector("textarea")?.value ?? "";
    return `${block.dataset.type}:${text}`;
  });
}

function lastField() {
  return screen.getAllByRole<HTMLTextAreaElement>("textbox").at(-1)!;
}

test("a Markdown shortcut turns a text block into a heading", async () => {
  const user = userEvent.setup();
  render(<BlockEditor />);

  await user.click(lastField());
  await user.keyboard("## Plans");
  expect(blocks().at(-1)).toBe("h2:Plans");
  expect(lastField().getAttribute("aria-label")).toBe("Block 5, Heading 2");
  expect(document.activeElement).toBe(lastField());
});

test("Enter splits a block and Backspace joins it again", async () => {
  const user = userEvent.setup();
  render(<BlockEditor />);

  await user.click(lastField());
  await user.keyboard("onetwo");
  lastField().setSelectionRange(3, 3);
  await user.keyboard("{Enter}");
  expect(blocks().slice(-2)).toEqual(["text:one", "text:two"]);
  expect(document.activeElement).toBe(lastField());
  expect(lastField().selectionStart).toBe(0);

  await user.keyboard("{Backspace}");
  expect(blocks().at(-1)).toBe("text:onetwo");
  expect(lastField().selectionStart).toBe(3);
});

test("Enter on an empty to-do turns it into text, and a to-do continues a list", async () => {
  const user = userEvent.setup();
  render(<BlockEditor />);

  await user.click(lastField());
  await user.keyboard("[[] milk{Enter}");
  expect(blocks().slice(-2)).toEqual(["todo:milk", "todo:"]);
  await user.keyboard("{Enter}");
  expect(blocks().at(-1)).toBe("text:");
});

test("a divider adds a text block after it and can be deleted", async () => {
  const user = userEvent.setup();
  render(<BlockEditor />);

  await user.click(lastField());
  await user.keyboard("--- ");
  expect(blocks().slice(-2)).toEqual(["divider:", "text:"]);
  await user.click(screen.getByRole("button", { name: "Delete divider, block 5" }));
  expect(blocks()).toHaveLength(5);
});

test("the handle moves a block with the keyboard", async () => {
  const user = userEvent.setup();
  render(<BlockEditor />);

  const handle = screen.getByRole("button", { name: "Move block 3" });
  handle.focus();
  await user.keyboard(" {ArrowUp}{ArrowUp} ");
  expect(blocks()[0]).toBe("todo:Drag the handle, or focus it and press Space");
  expect(blocks()[1]).toBe("h1:Untitled page");
});

test("the checkbox marks a to-do as done", async () => {
  const user = userEvent.setup();
  render(<BlockEditor />);

  const box = screen.getByRole("checkbox", { name: "Done, block 3" });
  box.focus();
  await user.keyboard(" ");
  expect(box.getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("status", { name: "Page stats" }).textContent).toContain(
    "1/1 to-dos done",
  );
});
