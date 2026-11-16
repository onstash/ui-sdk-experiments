import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { ToastRegion } from "@ui-sdk/react/toast";
import { BlockEditor } from "./blocks/block-editor";
import { Gestures } from "./gestures/gestures";
import { JsonExplorer } from "./json/json-explorer";
import { ThemeLab } from "./theme/theme-lab";
import type { Scheme } from "./theme/theme-lab";

const experiments = [
  { value: "blocks", label: "Block editor", hint: "Slash menu, shortcuts, drag to reorder" },
  { value: "json", label: "JSON explorer", hint: "Tree, filter, paths" },
  { value: "theme", label: "Theme lab", hint: "Live tokens and contrast" },
  { value: "gestures", label: "Gestures", hint: "Hold to confirm, scrub a number" },
];

const schemes: { value: Scheme; label: string }[] = [
  { value: "system", label: "Use the system color scheme" },
  { value: "light", label: "Use the light color scheme" },
  { value: "dark", label: "Use the dark color scheme" },
];

function App() {
  const [tab, setTab] = React.useState("blocks");
  const [scheme, setScheme] = React.useState<Scheme>("light");
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  function run(value: string) {
    const target = schemes.find((entry) => entry.value === value);
    if (target) {
      setScheme(target.value);
    } else {
      setTab(value);
    }
    setPaletteOpen(false);
  }

  return (
    <main>
      <header className="lab-header">
        <div>
          <h1>UI lab</h1>
          <p className="hint">Interface experiments built with UI SDK behaviors.</p>
        </div>
        <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
          <DialogTrigger shortcut="mod+k" className="palette-trigger">
            Jump to
            <DialogShortcut />
          </DialogTrigger>
          <DialogBackdrop />
          <DialogContent className="palette">
            <DialogTitle className="visually-hidden">Command palette</DialogTitle>
            <Command onAction={run}>
              <CommandInput
                aria-label="Search commands"
                placeholder="Search experiments and commands"
              />
              <CommandEmpty>No command matches.</CommandEmpty>
              <CommandList>
                {experiments.map((entry) => (
                  <CommandItem key={entry.value} value={entry.value}>
                    Open {entry.label}
                  </CommandItem>
                ))}
                {schemes.map((entry) => (
                  <CommandItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </header>

      <Tabs value={tab} onValueChange={(value) => setTab(value ?? "blocks")}>
        <TabsList aria-label="Experiments">
          {experiments.map((entry) => (
            <TabsTab key={entry.value} value={entry.value}>
              {entry.label}
            </TabsTab>
          ))}
        </TabsList>
        <TabsPanel value="blocks">
          <BlockEditor />
        </TabsPanel>
        <TabsPanel value="json">
          <JsonExplorer />
        </TabsPanel>
        <TabsPanel value="theme" keepMounted>
          <ThemeLab scheme={scheme} onSchemeChange={setScheme} />
        </TabsPanel>
        <TabsPanel value="gestures">
          <Gestures />
        </TabsPanel>
      </Tabs>

      <div data-agent-hidden>
        <ToastRegion />
      </div>
    </main>
  );
}

export { App };
