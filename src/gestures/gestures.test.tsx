import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Gestures } from "./gestures";

test("the opacity control updates its preview with keyboard input", async () => {
  const user = userEvent.setup();
  const { container } = render(<Gestures />);
  const opacity = screen.getByRole("textbox", { name: "Opacity" });

  expect(opacity).toHaveProperty("value", "40");
  opacity.focus();
  await user.keyboard("{ArrowUp}");
  expect(opacity).toHaveProperty("value", "41");
  expect((container.querySelector(".scrub-preview") as HTMLElement).style.opacity).toBe("0.41");
});
