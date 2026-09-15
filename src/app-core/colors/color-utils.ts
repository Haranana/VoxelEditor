import type { RGBColor } from "react-color";
import { Vector3 } from "../../math/vector/vector3";
import { Vector4 } from "../../math/vector/vector4";
import type { ColorHex, ColorHSV, ColorRGB } from "./color-types";

export function rgbToHsv(c: ColorRGB): ColorHSV {
    const r = c.R / 255;
    const g = c.G / 255;
    const b = c.B / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;

    if (d !== 0) {
        if (max === r) {
            h = ((g - b) / d) % 6;
        } else if (max === g) {
            h = (b - r) / d + 2;
        } else {
            h = (r - g) / d + 4;
        }
        h *= 60;
        if (h < 0) h += 360;
    }

    const s = max === 0 ? 0 : d / max;
    const v = max;

    return { H: h, S: s, V: v };
}

export function rgbToHex(c: ColorRGB): ColorHex {
    const toHex = (v: number) => v.toString(16).padStart(2, "0");
    return `#${toHex(c.R)}${toHex(c.G)}${toHex(c.B)}`;
}

export function hexToRgb(c: ColorHex): ColorRGB {
    const hex = c.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { R: r, G: g, B: b };
}

export function hexToHsv(c: ColorHex): ColorHSV {
    return rgbToHsv(hexToRgb(c));
}

export function hsvToRgb(c: ColorHSV): ColorRGB {
    const h = c.H;
    const s = c.S;
    const v = c.V;

    const c1 = v * s;
    const x = c1 * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c1;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        r = c1; g = x; b = 0;
    } else if (h < 120) {
        r = x; g = c1; b = 0;
    } else if (h < 180) {
        r = 0; g = c1; b = x;
    } else if (h < 240) {
        r = 0; g = x; b = c1;
    } else if (h < 300) {
        r = x; g = 0; b = c1;
    } else {
        r = c1; g = 0; b = x;
    }

    return {
        R: Math.round((r + m) * 255),
        G: Math.round((g + m) * 255),
        B: Math.round((b + m) * 255),
    };
}

export function hsvToHex(c: ColorHSV): ColorHex {
    return rgbToHex(hsvToRgb(c));
}

export function rgbToVector4(c: ColorRGB, a: number = 255): Vector4{
    return new Vector4(c.R, c.G, c.B, a);
}

export function vector4ToRgb(v: Vector4): ColorRGB{
    return{
        R: v.x,
        G: v.y,
        B: v.z
    };
}

export function rgbToVector3(c: ColorRGB): Vector3{
    return new Vector3(c.R, c.G, c.B);
}

export function rgbToReactColorType(c: ColorRGB): RGBColor{
    return {
        r: c.R,
        g: c.G,
        b: c.B,
    }
}

export function reactColorTypeToRgb(c: RGBColor): ColorRGB{
    return {
        R: c.r,
        G: c.g,
        B: c.b,
    };
}
