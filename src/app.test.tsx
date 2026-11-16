import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test } from "vitest";
import { App } from "./App";

const agent = createAgent();

test("the command palette opens an experiment", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /Jump to/ }));
  await user.keyboard("gest{Enter}");
  expect(screen.getByRole("tab", { name: "Gestures" }).getAttribute("aria-selected")).toBe("true");
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("the theme lab writes tokens and the color scheme to the page", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("tab", { name: "Theme lab" }));
  const panel = document.querySelector<HTMLElement>(".theme")!;
  const root = document.documentElement.style;
  expect(panel.style.getPropertyValue("--ui-radius")).toBe("6px");

  const radius = screen.getByRole("slider", { name: "Corner radius" });
  radius.focus();
  await user.keyboard("{ArrowRight}{ArrowRight}");
  expect(panel.style.getPropertyValue("--ui-radius")).toBe("8px");

  await user.click(screen.getByRole("radio", { name: "Dark" }));
  expect(root.colorScheme).toBe("dark");

  await user.click(screen.getByRole("button", { name: "Reset theme" }));
  expect(panel.style.getPropertyValue("--ui-radius")).toBe("6px");
  expect(screen.getByRole("status", { name: "Contrast verdict" }).textContent).toContain(
    "Passes for all text",
  );
});

test("an agent can find every control and drive the lab", async () => {
  render(<App />);

  const named = () =>
    agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more");
  for (const entry of named()) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  }
  const labels = named().map((entry) => entry.label);
  for (const label of ["Experiments", "Page blocks", "Block 1, Heading 1", "Copy as Markdown"]) {
    expect(labels, `${label} is missing from the snapshot`).toContain(label);
  }

  const moved = await agent.act({
    steps: [{ ref: "Page blocks", action: "move", args: ["block-" + firstBlockNumber(), 2] }],
  });
  expect(moved.ok, moved.error?.message).toBe(true);
  expect(document.querySelectorAll<HTMLElement>(".block")[2]?.dataset.type).toBe("h1");

  const opened = await agent.act({
    steps: [
      { ref: "Experiments", action: "setValue", args: ["JSON explorer"] },
      { ref: "Filter keys and values", action: "setValue", args: ["stable"] },
    ],
  });
  expect(opened.ok, opened.error?.message).toBe(true);
  expect(document.querySelectorAll("mark")).toHaveLength(3);
  for (const entry of named()) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  }
});

function firstBlockNumber() {
  const id = document.querySelector<HTMLElement>(".block")?.dataset.blockId ?? "";
  return id.replace("block-", "");
}
