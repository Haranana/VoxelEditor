import { createContext } from "react";
import type { EditorController } from "./EditorController";

export const ControllerContext = createContext<EditorController | null>(null);