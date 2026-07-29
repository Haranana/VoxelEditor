import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import EditorPage from "./editor_app/page/EditorPage";
import './index.css'
import { EditorController } from "./editor_app/editor_controller/EditorController";
import { ControllerContext } from "./editor_app/editor_controller/ControllerContext";

const controller = new EditorController(); 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ControllerContext.Provider value={controller}>
      <EditorPage />
    </ControllerContext.Provider>
  </StrictMode>
);