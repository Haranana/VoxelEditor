import { AppCoreEvent } from "../events/event";
import type { ColorRGB } from "./color-types";

export class ColorPalette{

    // Maximum amount of cells that 
    // 512 was picked arbitrary, but some limit is necessary nonetheless
    readonly maxPaletteSize = 512;
    // Actual amount of cells in this palette
    paletteSize = 60;
    #palette : ColorRGB[] = this.#loadPalette(); 

    paletteChangedEvent: AppCoreEvent<void> = new AppCoreEvent();
    #notifyOnPaletteChanged(){
        this.paletteChangedEvent.emit();
    }

    // Loads palette from local storage 
    // if any exception during loading is found the default palette is loaded instead
    #loadPalette(): ColorRGB[]{
        const json : string | null = localStorage.getItem("customPalette");
        if(!json){
            return this.#generateDefaultPalette();
        }
        try {
            return JSON.parse(json) as ColorRGB[];
        }
        catch {
            return this.#generateDefaultPalette();
        }
    }

    loadDefaultPalette(){
        this.#palette = this.#generateDefaultPalette();
        this.#notifyOnPaletteChanged();
    }

    #generateDefaultPalette(): ColorRGB[]{
        const basicColors = [
            { R: 0,   G: 0,   B: 0   }, // Black
            { R: 64,  G: 64,  B: 64  },
            { R: 128, G: 128, B: 128 },
            { R: 192, G: 192, B: 192 },
            { R: 255, G: 255, B: 255 }, // White

            { R: 255, G: 0,   B: 0   }, // Red
            { R: 192, G: 0,   B: 0   },
            { R: 255, G: 128, B: 128 },

            { R: 255, G: 128, B: 0   }, // Orange
            { R: 192, G: 96,  B: 0   },

            { R: 139, G: 69,  B: 19  }, // Brown
            { R: 245, G: 222, B: 179 }, // Beige

            { R: 255, G: 255, B: 0   }, // Yellow
            { R: 192, G: 192, B: 0   },

            { R: 128, G: 255, B: 0   }, // Lime
            { R: 96,  G: 192, B: 0   },

            { R: 0,   G: 255, B: 0   }, // Green
            { R: 0,   G: 192, B: 0   },

            { R: 0,   G: 255, B: 128 }, // Spring Green
            { R: 0,   G: 192, B: 96  },

            { R: 0,   G: 255, B: 255 }, // Cyan
            { R: 0,   G: 192, B: 192 },

            { R: 0,   G: 128, B: 255 }, // Sky Blue
            { R: 0,   G: 96,  B: 192 },

            { R: 0,   G: 0,   B: 255 }, // Blue
            { R: 0,   G: 0,   B: 192 },

            { R: 128, G: 0,   B: 255 }, // Violet
            { R: 96,  G: 0,   B: 192 },

            { R: 255, G: 0,   B: 255 }, // Magenta
            { R: 192, G: 0,   B: 192 },
        ];        

        const emptyColors = [];
        for(let i=0; i<this.paletteSize/2; i++){
            emptyColors.push(
                { R: 255, G: 255, B: 255 }
            );
        }

        return basicColors.concat(emptyColors);
    }    

    // Converts this palette to Blob, for exporting    
    async getPaletteBlob(): Promise<Blob>{
        const paletteToArray = (p: ColorRGB[]): Uint8ClampedArray<ArrayBuffer> => {
            const out = new Uint8ClampedArray(p.length * 4);
            let offset = 0;
            p.forEach(c=>{
                out[offset] = c.R;
                out[offset+1] = c.G;
                out[offset+2] = c.B;
                out[offset+3] = 255;
                offset+=4
            })
            return out;
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = this.#palette.length;
        canvas.height = 1;
        const ctx = canvas.getContext("2d")!;
        const imageData = new ImageData(
            paletteToArray(this.#palette),
            canvas.width,
            canvas.height
        );
        ctx.putImageData(imageData, 0, 0);
        const promise = new Promise<Blob>((resolve, reject) => (
            canvas.toBlob((blob)=>{return blob? resolve(blob) : reject(new Error("couldn't create blob of palette"))},"image/png")
        ));
        return promise;
    }

    // Loads palette from .png bitmap
    async loadFromBitmap(bitmap: ImageBitmap){
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0);

        const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
        
        const newPaletteSize = Math.min(imageData.data.length/4, this.maxPaletteSize);
        const newPalette: ColorRGB[] = [];
        for(let i=0; i<4*newPaletteSize; i+=4){
            const R = imageData.data[i];
            const G = imageData.data[i+1];
            const B = imageData.data[i+2];
            newPalette.push({R,G,B});
        }
        this.paletteSize = newPaletteSize;
        this.#palette = newPalette;
        this.#notifyOnPaletteChanged();
    }

    getPalette(): ColorRGB[]{
        return this.#palette;
    }


    getColor(colorId: number) : ColorRGB | null{
        if(colorId >= this.paletteSize || colorId < 0) return null;
        const palette = this.getPalette();
        return palette[colorId] ?? null;
    }

    setCustomColor(colorId: number, newColor: ColorRGB){
        if(colorId >= this.paletteSize || colorId < 0) return;
        const oldColor = this.#palette[colorId];
        if(oldColor !== newColor ){
            this.#notifyOnPaletteChanged();
        }
        this.#palette[colorId] = newColor;       
    }

    // Searches the palette for specified color
    // returns id of the first cell with the color or null if none is found
    findIdByColor(c: ColorRGB): number | null{        
        this.#palette.forEach((v,i)=>{
            if(v.R === c.R && v.G === c.G && v.B === c.B){
                return i;
            }
        });
        return null;
    }
}