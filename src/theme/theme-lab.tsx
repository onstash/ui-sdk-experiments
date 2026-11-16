import * as React from "react";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { Meter, MeterIndicator, MeterTrack } from "@ui-sdk/react/meter";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { hslToHex, ratio, readableOn } from "./color";

type Scheme = "system" | "light" | "dark";

interface Theme {
  hue: number;
  saturation: number;
  lightness: number;
  radius: number;
  spacing: number;
  fontSize: number;
}

const defaults: Theme = {
  hue: 24,
  saturation: 75,
  lightness: 40,
  radius: 6,
  spacing: 4,
  fontSize: 13,
};

const knobs: {
  key: keyof Theme;
  label: string;
  min: number;
  max: number;
  unit: string;
}[] = [
  { key: "hue", label: "Accent hue", min: 0, max: 360, unit: "°" },
  { key: "saturation", label: "Accent saturation", min: 0, max: 100, unit: "%" },
  { key: "lightness", label: "Accent lightness", min: 10, max: 90, unit: "%" },
  { key: "radius", label: "Corner radius", min: 0, max: 16, unit: "px" },
  { key: "spacing", label: "Spacing unit", min: 3, max: 6, unit: "px" },
  { key: "fontSize", label: "Font size", min: 11, max: 18, unit: "px" },
];

function verdict(value: number) {
  if (value >= 4.5) {
    return "Passes for all text";
  }
  if (value >= 3) {
    return "Passes for large text only";
  }
  return "Fails for text";
}

interface ThemeLabProps {
  scheme: Scheme;
  onSchemeChange: (scheme: Scheme) => void;
}

function ThemeLab({ scheme, onSchemeChange }: ThemeLabProps) {
  const [theme, setTheme] = React.useState(defaults);
  const accent = hslToHex(theme.hue, theme.saturation, theme.lightness);
  const onAccent = readableOn(accent);
  const contrast = ratio(onAccent, accent);

  // The tokens apply to this panel only, so the rest of the lab keeps its own palette.
  const tokens = {
    "--ui-primary": accent,
    "--ui-primary-foreground": onAccent,
    "--ui-ring": accent,
    "--ui-radius": `${theme.radius}px`,
    "--ui-spacing": `${theme.spacing}px`,
    "--ui-font-size": `${theme.fontSize}px`,
  } as React.CSSProperties;

  React.useEffect(() => {
    document.documentElement.style.colorScheme = scheme === "system" ? "light dark" : scheme;
  }, [scheme]);

  return (
    <div className="theme" style={tokens}>
      <div className="theme-knobs">
        <Field>
          <FieldLabel>Color scheme</FieldLabel>
          <SegmentedControl
            value={scheme}
            onValueChange={(value) => onSchemeChange((value as Scheme) ?? "system")}
          >
            <SegmentedControlIndicator />
            <SegmentedControlItem value="system">System</SegmentedControlItem>
            <SegmentedControlItem value="light">Light</SegmentedControlItem>
            <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
          </SegmentedControl>
        </Field>
        {knobs.map((knob) => (
          <Field key={knob.key}>
            <FieldLabel>{knob.label}</FieldLabel>
            <Slider
              min={knob.min}
              max={knob.max}
              step={1}
              value={theme[knob.key]}
              onValueChange={(value) =>
                setTheme((current) => ({ ...current, [knob.key]: value as number }))
              }
            >
              <SliderControl>
                <SliderTrack>
                  <SliderIndicator />
                  <SliderThumb />
                </SliderTrack>
              </SliderControl>
              <SliderValue>{() => `${theme[knob.key]}${knob.unit}`}</SliderValue>
            </Slider>
          </Field>
        ))}
        <Button onClick={() => setTheme(defaults)}>Reset theme</Button>
      </div>

      <div className="theme-preview">
        <h3>Live preview</h3>
        <p className="hint">The preview uses these tokens. Change a knob and watch it update.</p>
        <div className="swatch" style={{ background: accent, color: onAccent }}>
          <strong>{accent}</strong>
          <span>Text on the accent</span>
        </div>
        <Meter aria-label="Accent contrast" min={1} max={21} value={Number(contrast.toFixed(2))}>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </Meter>
        <p role="status" aria-label="Contrast verdict" data-pass={contrast >= 4.5 || undefined}>
          {contrast.toFixed(2)}:1 · {verdict(contrast)}
        </p>
        <div className="button-row">
          <Button data-variant="solid">Primary action</Button>
          <Button>Secondary</Button>
        </div>
        <Field>
          <FieldLabel>Sample field</FieldLabel>
          <Input placeholder="Type here" />
        </Field>
        <Field className="switch-field">
          <Switch defaultChecked>
            <SwitchThumb />
          </Switch>
          <FieldLabel>Sample switch</FieldLabel>
        </Field>
      </div>
    </div>
  );
}

export { ThemeLab };
export type { Scheme };
