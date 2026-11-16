import * as React from "react";
import { bindHold } from "@ui-sdk/core";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field";
import {
  NumberInput,
  NumberInputControl,
  NumberInputGroup,
  NumberInputScrubArea,
} from "@ui-sdk/react/number-input";

function HoldToClear() {
  const button = React.useRef<HTMLButtonElement>(null);
  const [cleared, setCleared] = React.useState(false);
  const [note, setNote] = React.useState("Nothing happened yet.");

  React.useEffect(() => {
    if (cleared || !button.current) {
      return;
    }
    return bindHold(button.current, {
      delay: 1200,
      onHold: () => {
        setCleared(true);
        setNote("Held to the end. The canvas is clear.");
      },
      onEnd: ({ held, canceled }) => {
        if (!held) {
          setNote(canceled ? "Canceled." : "Released too early. Keep holding.");
        }
      },
    });
  }, [cleared]);

  return (
    <section className="card">
      <h3>Hold to confirm</h3>
      <p className="hint">
        A risky action that needs a long press, not a dialog. Space and Enter work too.
      </p>
      {cleared ? (
        <Button
          onClick={() => {
            setCleared(false);
            setNote("Restored.");
          }}
        >
          Restore canvas
        </Button>
      ) : (
        <Button ref={button} className="hold-button" data-variant="solid">
          <span className="hold-fill" aria-hidden="true" />
          <span className="hold-text">Hold to clear canvas</span>
        </Button>
      )}
      <p role="status" aria-label="Hold result">
        {note}
      </p>
    </section>
  );
}

function ScrubNumber() {
  const [value, setValue] = React.useState<number | null>(40);

  return (
    <section className="card">
      <h3>Scrub a number</h3>
      <p className="hint">Drag the label left or right. Hold Shift for steps of ten.</p>
      <Field>
        <NumberInput value={value} min={0} max={100} step={1} onValueChange={setValue}>
          <NumberInputScrubArea pixelsPerStep={4} orientation="horizontal">
            <FieldLabel className="scrub-label">Opacity</FieldLabel>
          </NumberInputScrubArea>
          <NumberInputGroup>
            <NumberInputControl />
          </NumberInputGroup>
        </NumberInput>
        <FieldDescription>Between 0 and 100.</FieldDescription>
      </Field>
      <div className="scrub-preview" style={{ opacity: (value ?? 0) / 100 }} />
    </section>
  );
}

function Gestures() {
  return (
    <div className="gestures">
      <HoldToClear />
      <ScrubNumber />
    </div>
  );
}

export { Gestures };
