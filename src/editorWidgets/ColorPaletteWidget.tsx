import { reactColorTypeToRgb, rgbToReactColorType, rgbToVector3, rgbToVector4, useColorPalettesStore, type ColorPalette, type ColorRGB } from "../state/ColorPalettes"
import "./ColorPaletteWidget.css"
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { PhotoshopPicker, SketchPicker} from 'react-color'
import { ExpandableRow } from "./ExpandableRow";
import { useContext, useEffect, useState, type RefObject } from "react";
import { ControllerContext } from "../ControllerContext";

export type ColorPaletteWidgetProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    version: number;
}

export function ColorPaletteWidget(props: ColorPaletteWidgetProps){
    const TriggerIcon = props.isOpen? ChevronDownIcon : ChevronRightIcon;
    const controller = useContext(ControllerContext)!;
    const colorPalletes : ColorPalette[] = useColorPalettesStore().colorPalletes;
    const setPalleteColor = useColorPalettesStore().setColor;
    const palettesAmount: number = colorPalletes.length;
    const [chosenPaletteId, setChosenPaletteId] = useState<number>(0);
    const [chosenColorId, setChosenColorId] = useState<number>(0);
    const [isEditColorWindowOpen, setEditColorWindowOpen] = useState<boolean>(false);
    const [colorChangeWindowColor, setColorChangeWindowColor] = useState<ColorRGB>(colorPalletes[chosenPaletteId][chosenColorId])

    useEffect(()=>{
       controller.setCurrentColor(rgbToVector3(colorPalletes[chosenPaletteId][chosenColorId]))
    },[])

    return <ExpandableRow
            trigger = {<button type="button" className="ExpandableRowTriggerButton">
            <TriggerIcon className="ExpandableRowTriggerButtonIcon" />
            <p className="ExpandableRowTriggerButtonText">Color Palettes</p>
                    </button>}   
            isOpen={props.isOpen}
            onOpenChange={props.onOpenChange}>
                <div className="ColorPaletteWidget">
                    <div className="ColorPalettesIndexList">
                    {
                        Array.from({length: palettesAmount} , (_, i: number)=>
                        <div className={`ColorPaletteIndexButton ${i===chosenPaletteId? "ChosenColorPaletteIndexButton" : ""}`} 
                        key={i} onClick={()=>setChosenPaletteId(i)}>
                            {i+1} 
                        </div>
                        )
                    }
                    </div>
                    <div className="ColorPaletteGrid">
                    {
                        Array.from(colorPalletes[chosenPaletteId], (c: ColorRGB, i)=>{
                            return <div className={`ColorPaletteCell ${chosenColorId===i? "ChosenColorPaletteCell" : ""}`} 
                            onClick={(_)=>{
                                setChosenColorId(i); 
                                const newCurrentColor = rgbToVector3(colorPalletes[chosenPaletteId][i]);
                                controller.setCurrentColor(newCurrentColor);
                                setColorChangeWindowColor(colorPalletes[chosenPaletteId][i]);
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
                        onChangeComplete={(c)=>{}}
                        onAccept={(c)=>{
                            setPalleteColor(chosenPaletteId, chosenColorId, (colorChangeWindowColor));
                            controller.setCurrentColor(rgbToVector3(colorChangeWindowColor));
                            setEditColorWindowOpen(false)}
                        } 
                        onChange={(c)=>{
                            setColorChangeWindowColor(reactColorTypeToRgb(c.rgb))}
                        }
                        onCancel={(_)=>{
                            setEditColorWindowOpen(false); 
                            setColorChangeWindowColor(colorPalletes[chosenPaletteId][chosenColorId])}
                        }
                        color={rgbToReactColorType(colorChangeWindowColor)}></PhotoshopPicker> 
                        : ""
                    }
                </div>
            </ExpandableRow>
}