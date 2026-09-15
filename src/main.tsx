import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import EditorPage from "./web-app/main-page/MainPage";
import './index.css'
import { ControllerContext } from "./app-core/core-controller/core-controller-context";
import { EditorController } from "./app-core/core-controller/core-controller";


const controller = new EditorController(); 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ControllerContext.Provider value={controller}>
      <EditorPage />
    </ControllerContext.Provider>
  </StrictMode>
);