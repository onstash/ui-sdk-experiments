# UI lab

This project is a set of interface experiments built with [UI SDK](https://ui-sdk.dev/) and React.
UI SDK is in beta. Its API can change.

## Experiments

| Experiment    | What to try                                                                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Block editor  | Type `/` for a block menu. Type `# `, `## `, `[] `, `> `, ` ``` ` or `--- ` at the start of a block. Press Enter to split a block and Backspace to join two. Drag a handle, or focus it and press Space, then the arrow keys. |
| JSON explorer | Edit the JSON. Filter keys and values. Select a node to see its path and value.                                                                                                                                               |
| Theme lab     | Move the sliders. The whole lab changes. The meter shows the contrast of the accent color.                                                                                                                                    |
| Gestures      | Hold a button to confirm an action. Drag a label to change a number.                                                                                                                                                          |

Press Command+K or Control+K to open the command palette.

## Run it

```sh
pnpm install
pnpm dev
```

## Check it

```sh
pnpm verify
```

The command checks the types, runs the linter, runs the tests, and builds the page.

## Files

| Folder         | Contents                                                                                |
| -------------- | --------------------------------------------------------------------------------------- |
| `src/blocks`   | The block editor. `block-list.ts` is a custom primitive that uses the reorder behavior. |
| `src/json`     | The JSON model and the tree view                                                        |
| `src/theme`    | The theme controls and the contrast check                                               |
| `src/gestures` | The hold and scrub examples                                                             |
| `src/App.tsx`  | The tabs and the command palette                                                        |

## Findings


- A custom primitive needs little code. The reorder behavior supplies the drag, the keyboard moves, and the screen reader messages.
- Tree values go into selectors. A value with a quote or a bracket causes an "Invalid selector" error. The JSON explorer uses a separate safe ID for each node.
- The slash menu does not open in jsdom. Check it in a browser.
- An agent finds controls by name through `createAgent`. The custom block list offers a `move` action.

## Limits

- The block editor uses one text field for each block. A selection cannot span two blocks.
- Block text has no inline formatting.
- The tests run in jsdom. Drag with a pointer, the slash menu, and color contrast are not covered by the tests.
- Nothing is saved. A reload resets each experiment.
