import { ColorPalettes, reactColorTypeToRgb, rgbToReactColorType, rgbToVector3, type ColorRGB } from "../state/ColorPalettes"
import "./ColorPaletteWidget.css"
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { PhotoshopPicker} from 'react-color'
import { ExpandableRow } from "./ExpandableRow";
import { useContext, useEffect, useRef, useState } from "react";
import { ControllerContext } from "../editor_controller/ControllerContext";

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
    const [chosenColorId, setChosenColorId] = useState<number>(0);
    const [isEditColorWindowOpen, setEditColorWindowOpen] = useState<boolean>(false);
    const [colorChangeWindowColor, setColorChangeWindowColor] = useState<ColorRGB>(colorPalletesRef.current.getColor(chosenColorId) ?? colorPalletesRef.current.getColor(0)!)
    useEffect(()=>{
       controller.setCurrentColor(rgbToVector3(colorPalletesRef.current.getColor(chosenColorId) ?? colorPalletesRef.current.getColor(0)! ));
    },[])

    return <ExpandableRow
            trigger = {<button type="button" className="ExpandableRowTriggerButton">
            <TriggerIcon className="ExpandableRowTriggerButtonIcon" />
            <p className="ExpandableRowTriggerButtonText">Color Palettes</p>
                    </button>}   
            isOpen={props.isOpen}
            onOpenChange={props.onOpenChange}>
                <div className="ColorPaletteWidget">
                    <div className="ColorPaletteGrid">
                    {
                        Array.from(colorPalletesRef.current.getFullPalette(), (c: ColorRGB, i)=>{
                            return <div className={`ColorPaletteCell ${chosenColorId===i? "ChosenColorPaletteCell" : ""}`} 
                            onClick={(_)=>{
                                setChosenColorId(i); 
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
                        <button className="ColorPaletteEditChosenCellButton" onClick={()=>setEditColorWindowOpen(!isEditColorWindowOpen)}>Edit</button>
                        <button className="ColorPaletteExportButton">Export</button>
                        <button className="ColorPaletteImportButton">Import</button>
                    </div>
                    {
                        isEditColorWindowOpen? 
                        <PhotoshopPicker className="EditColorWindow" 
                        onChangeComplete={(_)=>{}}
                        onAccept={(_)=>{
                            colorPalletesRef.current.setCustomColor(chosenColorId, (colorChangeWindowColor));
                            controller.setCurrentColor(rgbToVector3(colorChangeWindowColor));
                            setEditColorWindowOpen(false)}
                        } 
                        onChange={(c)=>{
                            setColorChangeWindowColor(reactColorTypeToRgb(c.rgb))}
                        }
                        onCancel={(_)=>{
                            setEditColorWindowOpen(false); 
                            setColorChangeWindowColor(colorPalletesRef.current.getColor(chosenColorId)!)}
                        }
                        color={rgbToReactColorType(colorChangeWindowColor)}></PhotoshopPicker> 
                        : ""
                    }
                </div>
            </ExpandableRow>
}