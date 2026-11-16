import { contrastRatio, parseColor } from "@ui-sdk/core/color";

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

function ratio(first: string, second: string) {
  const a = parseColor(first);
  const b = parseColor(second);
  return a && b ? contrastRatio(a, b) : 1;
}

function readableOn(background: string) {
  return ratio("#ffffff", background) >= ratio("#111111", background) ? "#ffffff" : "#111111";
}

export { hslToHex, ratio, readableOn };
