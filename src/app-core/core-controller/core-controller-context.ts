import { createContext } from "react";
import type { EditorController } from "./core-controller";

export const ControllerContext = createContext<EditorController | null>(null);