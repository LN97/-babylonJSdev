
const canvas = document.querySelector("canvas")
const log = console.log

const {Engine, Vector3, FreeCamera, Scene, MeshBuild, Mesh} = BABYLON

const engine = new Engine(canvas, true)
let scene = new Scene(engine)




const cam = FreeCamera("cam", new Vector3(0,0,-3), scene)
const box1 = MeshBuilder.CreateBox("box", {size: 4}, scene)
cam.attachControl(canvas)





engine.runRenderLoop(() => {
    scene.render()
})