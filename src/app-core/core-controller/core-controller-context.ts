import { createContext } from "react";
import type { CoreController } from "./core-controller";

export const ControllerContext = createContext<CoreController | null>(null);