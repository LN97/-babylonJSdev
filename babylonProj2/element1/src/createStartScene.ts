// importing BABYLON-------------------------
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    FreeCamera,
    Color3,
    Color4,
    ShadowGenerator,
    DirectionalLight
  } from "@babylonjs/core";
  //-------------------------------------------
  //-------------------------------------------

  let verticalNum = 0
  let horizontalNum = 0
  let mainBody: Mesh;
  //Middle of code-----------------------------
  function createBox(scene: Scene, shadowGen) {
    const meshId = Math.random().toLocaleString().split(".")[1]
    console.log(meshId)

    var mat = new StandardMaterial("mat", scene);
    var texture = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/snow_01/snow_01_diff_4k.jpg", scene);
    mat.diffuseTexture = texture

    // var columns = 6;  // 6 columns
    // var rows = 1;  // 1 row

    // //alien sprite
    // var faceUV = new Array(6);

    // //set all faces to same
    // // for (var i = 0; i < 6; i++) {
    // //     faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
    // //     console.log(faceUV[i])
    // // }

    var box = MeshBuilder.CreateSphere(meshId, {diameter: 1}, scene);
    shadowGen.addShadowCaster(box)
    box.position = new Vector3(1,2,1)
    setInterval(() => {
      box.locallyTranslate(new Vector3(0,0,.2))
    }, 1000)
    box.material = mat
    mainBody = box

    // const anyObj = MeshBuilder.CreateDisc("disc", { tessellation: 20}, scene)

    return  box;
  }

  // faced box function 
  function createFacedBox(scene: Scene, px: number, py: number, pz: number) {
    // const mat = new StandardMaterial("Mat");
    // const texture = new Texture("https://i.imgur.com/lXehwjZ.jpg")
    // mat.diffuseTexture = texture;

    // var columns = 6;  // 6 columns
    // var rows = 1;  // 1 row

    // //alien sprite
    // var faceUV = new Array(6);

    // //set all faces to same
    // for (var i = 0; i < 6; i++) {
    //     faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
    //     console.log(faceUV[i])
    // }

    // let box = MeshBuilder.CreateBox("newBox",{
    //   size: 1,
    //   faceUV: faceUV,
    //   wrap: true
    // }, scene);
    // box.material = mat

    // box.position = new Vector3(-5, 3, 0);
  
    // return MeshBuilder.CreateBox("box", {size: 1}, scene)
   
    return null
  }

  
  function createLight(scene: Scene) {

    const dirLight = new DirectionalLight("light", new Vector3(2, -2, 0), scene);
    dirLight.intensity = .5

    const shadowGen = new ShadowGenerator(1024, dirLight)
    // shadowGen.setDarkness(.1)

    shadowGen.useExponentialShadowMap = true
    shadowGen.useKernelBlur = true
    shadowGen.blurKernel = 200
    return {dirLight, shadowGen};
  }
  
  function createSphere(scene: Scene) {
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene,
    );
    const sphereMat = new StandardMaterial("groundMat", scene)
    sphere.material = sphereMat
    // sphereMat.wireframe = true
    sphere.position.y = 4;

    // shadowGen.addShadowCaster(sphere)
    // console.log(shadowGen)
    return sphere;
  }
  
  function createGround(scene: Scene) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: 200,
        subdivisions: 10,
        height: 200 
      },
      scene,
    );
    const groundMat = new StandardMaterial("groundMat", scene)
    ground.material = groundMat
    groundMat.specularColor = new Color3(0,0,0)
    const diffuseTex = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/grey_stone_path/grey_stone_path_diff_4k.jpg")
    groundMat.diffuseTexture = diffuseTex
    
    groundMat.bumpTexture = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/grey_stone_path/grey_stone_path_nor_gl_4k.jpg")
    
    diffuseTex.uScale = 10
    diffuseTex.vScale = 10

    ground.receiveShadows = true
    return ground;
  }

  function toRender(mesh: Mesh, engine){ //60
    const deltaT = engine.getDeltaTime()
    mainBody && mainBody.locallyTranslate(new Vector3(horizontalNum,0, verticalNum))
  }
  //--------------------------------------------------
  //--------------------------------------------------
  //Bottom of Code
  
  function createArcRotateCamera(scene: Scene, box: Mesh) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 10,
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );
    // let camera = new FreeCamera("camera", new Vector3(0,0,-5), scene)
    camera.attachControl(true);
    
    const disc = scene.getMeshByName("disc")
    camera.setTarget(mainBody)
    
    return camera;
  }
  
  export default function createStartScene(engine: Engine) {
    const scene = new Scene(engine)
    const {dirLight, shadowGen} = createLight(scene)
    interface SceneData {
      scene: Scene;
      box: Mesh;
      facebox?:Mesh;
      light?: Light;
      sphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;    
    }
    
    let that: SceneData = { 
      scene,
      box: createBox(scene, shadowGen)
    };
    // that.scene.debugLayer.show();



    // that.box = createBox(that.scene, 2, 5, 3, 3, 2, 1);
    // that.facebox = createFacedBox(that.scene, 2, 5, 3,);
    
    
    // that.sphere = createSphere(that.scene);
    that.ground = createGround(that.scene);
    that.camera = createArcRotateCamera(that.scene, that.box)
    // const mainMesh = that.scene.getMeshByName("box")

    // const sphereMesh = that.scene.getMeshByName("sphere")
    // if(mainMesh && sphereMesh){
    //   sphereMesh.locallyTranslate(new Vector3(-1, 0,0))
    //   mainMesh.locallyTranslate(new Vector3(0,0,1))
      
    // }
    window.addEventListener("keydown", e => {
      switch(e.key.toLowerCase()){
        case "w":
          verticalNum = 1

        break
        case "s":
          verticalNum = -1
        break
        case "a":
          horizontalNum = -1
        break
        case "d":
          horizontalNum = 1
        break
      }

      // if(e.key === "d") mainMesh?.addRotation(0,.1,0)
      // if(e.key === "w") mainMesh?.locallyTranslate(new Vector3(0,0,.1))
    })
    window.addEventListener("keyup", e => {
      switch(e.key.toLowerCase()){
        case "w":
          verticalNum =0
        break
        case "s":
          verticalNum = 0
        break
        case "a":
          horizontalNum = 0
        break
        case "d":
          horizontalNum =0
        break
      }
    })
    // window
    that.scene.registerAfterRender(() => {
      toRender(that.box, engine)
    })
    return that;
  }
