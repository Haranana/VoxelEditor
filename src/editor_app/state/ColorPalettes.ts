import { create} from "zustand";
import { persist } from "zustand/middleware";
import { Vector4 } from "../math/vector4.type";
import { Vector3 } from "../math/vector3.type";
import type { RGBColor } from "react-color";

export type ColorRGB = {
    R: number,
    G: number,
    B: number, 
}

export type ColorHSV = {
    H: number,
    S: number,
    V: number, 
}

export type ColorHex = string;

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

export type ColorPalette = ColorRGB[];

export type ColorPalettesStore = {
  colorPalletes: ColorPalette[],
  setColorPallete: (palettes: ColorPalette[])=>void,
  setColor: (pallete: number, id: number, newColor: ColorRGB)=>void;
};

export function getDefaultColorPalettes(): ColorPalette[] {
    return [        
        [
            {R:10,G:10,B:10},{R:20,G:20,B:20},{R:30,G:30,B:30},{R:40,G:40,B:40},
            {R:55,G:55,B:55},{R:70,G:70,B:70},{R:90,G:90,B:90},{R:120,G:120,B:120},
            {R:150,G:150,B:150},{R:180,G:180,B:180},{R:210,G:210,B:210},{R:240,G:240,B:240},
            {R:60,G:10,B:10},{R:120,G:20,B:20},{R:180,G:30,B:30},{R:255,G:60,B:60},
            {R:10,G:60,B:10},{R:20,G:120,B:20},{R:30,G:180,B:30},{R:60,G:255,B:60},
            {R:10,G:10,B:60},{R:20,G:20,B:120},{R:30,G:30,B:180},{R:60,G:60,B:255},
            {R:255,G:200,B:0},{R:255,G:150,B:0},{R:0,G:200,B:200},{R:200,G:0,B:200},
            {R:255,G:255,B:0},{R:0,G:255,B:255},{R:255,G:0,B:255},{R:255,G:120,B:0}
        ],        
        [
            {R:255,G:255,B:255},{R:245,G:245,B:245},{R:230,G:230,B:230},{R:210,G:210,B:210},
            {R:190,G:190,B:190},{R:170,G:170,B:170},{R:150,G:150,B:150},{R:120,G:120,B:120},
            {R:90,G:90,B:90},{R:70,G:70,B:70},{R:50,G:50,B:50},{R:30,G:30,B:30},
            {R:255,G:100,B:100},{R:255,G:150,B:150},{R:200,G:50,B:50},{R:150,G:0,B:0},
            {R:100,G:255,B:100},{R:150,G:255,B:150},{R:50,G:200,B:50},{R:0,G:150,B:0},
            {R:100,G:100,B:255},{R:150,G:150,B:255},{R:50,G:50,B:200},{R:0,G:0,B:150},
            {R:255,G:220,B:120},{R:255,G:200,B:80},{R:200,G:160,B:40},{R:150,G:120,B:0},
            {R:120,G:255,B:255},{R:80,G:220,B:220},{R:40,G:180,B:180},{R:0,G:140,B:140}
        ],
        [
            {R:15,G:15,B:25},{R:25,G:25,B:40},{R:40,G:40,B:60},{R:60,G:60,B:90},
            {R:80,G:80,B:120},{R:100,G:100,B:150},{R:130,G:130,B:180},{R:160,G:160,B:210},
            {R:200,G:200,B:230},{R:220,G:220,B:240},{R:240,G:240,B:250},{R:255,G:255,B:255},
            {R:30,G:0,B:50},{R:60,G:0,B:100},{R:90,G:0,B:150},{R:140,G:0,B:200},
            {R:0,G:50,B:100},{R:0,G:100,B:150},{R:0,G:150,B:200},{R:0,G:200,B:255},
            {R:50,G:0,B:0},{R:100,G:0,B:0},{R:150,G:0,B:0},{R:200,G:0,B:0},
            {R:50,G:50,B:0},{R:100,G:100,B:0},{R:150,G:150,B:0},{R:200,G:200,B:0},
            {R:0,G:50,B:50},{R:0,G:100,B:100},{R:0,G:150,B:150},{R:0,G:200,B:200}
        ],
        [
            {R:20,G:30,B:20},{R:40,G:60,B:40},{R:60,G:90,B:60},{R:80,G:120,B:80},
            {R:100,G:150,B:100},{R:120,G:180,B:120},{R:150,G:200,B:150},{R:180,G:220,B:180},
            {R:210,G:235,B:210},{R:230,G:245,B:230},{R:245,G:250,B:245},{R:255,G:255,B:255},
            {R:60,G:30,B:0},{R:100,G:50,B:0},{R:140,G:70,B:0},{R:180,G:90,B:0},
            {R:30,G:60,B:0},{R:50,G:100,B:0},{R:70,G:140,B:0},{R:90,G:180,B:0},
            {R:0,G:40,B:60},{R:0,G:80,B:120},{R:0,G:120,B:180},{R:0,G:160,B:220},
            {R:60,G:0,B:40},{R:100,G:0,B:80},{R:140,G:0,B:120},{R:180,G:0,B:160},
            {R:100,G:80,B:40},{R:140,G:110,B:60},{R:180,G:140,B:80},{R:210,G:170,B:110}
        ],
        [
            {R:0,G:0,B:0},{R:32,G:32,B:32},{R:64,G:64,B:64},{R:96,G:96,B:96},
            {R:128,G:128,B:128},{R:160,G:160,B:160},{R:192,G:192,B:192},{R:224,G:224,B:224},
            {R:255,G:255,B:255},{R:255,G:0,B:0},{R:0,G:255,B:0},{R:0,G:0,B:255},
            {R:255,G:255,B:0},{R:0,G:255,B:255},{R:255,G:0,B:255},{R:255,G:128,B:0},
            {R:128,G:255,B:0},{R:0,G:255,B:128},{R:0,G:128,B:255},{R:128,G:0,B:255},
            {R:255,G:0,B:128},{R:128,G:0,B:0},{R:0,G:128,B:0},{R:0,G:0,B:128},
            {R:128,G:128,B:0},{R:0,G:128,B:128},{R:128,G:0,B:128},{R:200,G:100,B:50},
            {R:50,G:200,B:100},{R:100,G:50,B:200},{R:200,G:50,B:100},{R:50,G:100,B:200}
        ],
    ]
}

export const useColorPalettesStore = create<ColorPalettesStore>()(
  persist(
    (set) => ({
        colorPalletes: getDefaultColorPalettes(),
        setColorPallete: (palettes) => set({colorPalletes: palettes }),
        setColor: (paletteIndex, colorIndex, newColor) =>
            set((state) => ({
                colorPalletes: state.colorPalletes.map((palette, pIdx) =>
                pIdx === paletteIndex
                    ? palette.map((color, cIdx) =>
                        cIdx === colorIndex ? newColor : color
                    )
                    : palette
                ),
        })),
    }),
    { name: "palettes-store" }
  )
);