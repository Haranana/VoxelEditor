import { ColorPalettes, reactColorTypeToRgb, rgbToReactColorType, rgbToVector3, type ColorRGB } from "../state/ColorPalettes"
import "./ColorPaletteWidget.css"
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { PhotoshopPicker} from 'react-color'
import { useContext, useEffect, useRef, useState, type ChangeEvent } from "react";
import { ControllerContext } from "../editor_controller/ControllerContext";
import SolarUploadMinimalisticOutline from "../icons/SolarUploadMinimalisticOutline";
import SolarDownloadMinimalisticOutline from "../icons/SolarDownloadMinimalisticOutline";
import MaterialSymbolsLightFormatPaintOutline from "../icons/MaterialSymbolsLightFormatPaintOutline";
import { Tooltip } from "../other_components/tooltip/Tooltip";
import SolarRefreshOutline from "../icons/SolarRefreshOutline";

export type ColorPaletteWidgetProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    version: number;
}

export function ColorPaletteWidget(props: ColorPaletteWidgetProps){
    const TriggerIcon = props.isOpen? ChevronDownIcon : ChevronRightIcon;
    const controller = useContext(ControllerContext)!;
    const colorPalletesRef = useRef<ColorPalettes>(new ColorPalettes());
    //const colorPalletes : ColorPalette[] = useColorPalettesStore().colorPalletes;
    //const setPalleteColor = useColorPalettesStore().setColor;
    //const palettesAmount: number = colorPalletes.length;
    //const [chosenPaletteId, setChosenPaletteId] = useState<number>(0);
    const chosenColorIdRef = useRef<number>(0);
    const [isEditColorWindowOpen, setEditColorWindowOpen] = useState<boolean>(false);
    const [colorChangeWindowColor, setColorChangeWindowColor] = useState<ColorRGB>(colorPalletesRef.current.getColor(chosenColorIdRef.current)!)
    const inputRef = useRef<HTMLInputElement>(null);

    function onPaletteChanged(){          
        setColorChangeWindowColor(colorPalletesRef.current.getColor(chosenColorIdRef.current)!);
        controller.setCurrentColor(rgbToVector3(colorPalletesRef.current.getColor(chosenColorIdRef.current)!)) ;
    }

    async function downloadPalette(){
        try{
            const blob = await colorPalletesRef.current.getPaletteBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "palette.png";
            a.click();
            URL.revokeObjectURL(url);
        }catch(e){
            console.log(e);
        }
    }

    async function uploadPalette(e: ChangeEvent<HTMLInputElement, HTMLInputElement>){
        const file = e.target.files?.[0];
        if (!file) return;

        const bitmap = await createImageBitmap(file);
        colorPalletesRef.current.loadFromBitmap(bitmap);

    }

    useEffect(()=>{
        controller.setCurrentColor(rgbToVector3(colorPalletesRef.current.getColor(chosenColorIdRef.current)!));
        colorPalletesRef.current.paletteChangedEvent.subscribe(onPaletteChanged);
    },[])

    return <div className="ColorPaletteWidget">
        <div className="ColorPaletteGrid">
        {
            Array.from(colorPalletesRef.current.getPalette(), (c: ColorRGB, i)=>{
                return <div className={`ColorPaletteCell ${chosenColorIdRef.current===i? "ChosenColorPaletteCell" : ""}`} 
                onClick={(_)=>{
                    chosenColorIdRef.current = i; 
                    const newCurrentColor = rgbToVector3(colorPalletesRef.current.getColor(i)!);
                    controller.setCurrentColor(newCurrentColor);
                    setColorChangeWindowColor(colorPalletesRef.current.getColor(i)!);
                }}
                key={i}
                style={{background: `rgba(${c.R},${c.G},${c.B})`}}></div>
            })
        }
        </div>
        <div className="ColorPaletteOptions">
            <Tooltip text="Load Default Palette">
                <button className="ColorPaletteOptionsButton ColorPaletteLoadDefaultButton" onClick={()=>{colorPalletesRef.current.loadDefaultPalette()}}>
                    <SolarRefreshOutline/>
                </button>
            </Tooltip>
            <Tooltip text="Edit Color">
                <button className="ColorPaletteOptionsButton ColorPaletteEditChosenCellButton" onClick={()=>setEditColorWindowOpen(!isEditColorWindowOpen)}>
                    <MaterialSymbolsLightFormatPaintOutline/>
                </button>
            </Tooltip>
            <Tooltip text="Export Palette">

                <button className="ColorPaletteOptionsButton ColorPaletteExportButton" onClick={()=>downloadPalette()}><SolarUploadMinimalisticOutline/></button>
            </Tooltip>
            <Tooltip text="Import Palette">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png"
                    style={{ display: "none" }}
                    onChange={(e)=>uploadPalette(e)}
                />
                <button className="ColorPaletteOptionsButton ColorPaletteImportButton" onClick={()=>inputRef.current?.click()}><SolarDownloadMinimalisticOutline/></button>
            </Tooltip>
            
        </div>
        {
            isEditColorWindowOpen? 
            <PhotoshopPicker className="EditColorWindow"  
            onChangeComplete={(_)=>{}}
            onAccept={(_)=>{
                colorPalletesRef.current.setCustomColor(chosenColorIdRef.current, (colorChangeWindowColor));
                controller.setCurrentColor(rgbToVector3(colorChangeWindowColor));
                setEditColorWindowOpen(false)}
            } 
            onChange={(c)=>{
                setColorChangeWindowColor(reactColorTypeToRgb(c.rgb))}
            }
            onCancel={(_)=>{
                setEditColorWindowOpen(false); 
                setColorChangeWindowColor(colorPalletesRef.current.getColor(chosenColorIdRef.current)!)}
            }
            color={rgbToReactColorType(colorChangeWindowColor)}></PhotoshopPicker> 
            : ""
            
        }
    </div>
}