import { Engine } from "@babylonjs/core";
import createStartScene from "./createStartScene";
import './main.css';

const CanvasName = "renderCanvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;

canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let eng = new Engine(canvas, true, {}, true);
if ( Engine.audioEngine) {
    Engine.audioEngine.useCustomUnlockedButton = true
  }
let startScene = createStartScene(eng);
window.addEventListener("resize", ()=> eng.resize())
eng.runRenderLoop(() => {
    startScene.scene.render();
});                  