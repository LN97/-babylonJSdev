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


  //Middle of code-----------------------------
  let shadowGen
  function createBox(scene: Scene, px: number, py: number, pz: number, sx: number, sy: number, sz: number) {
    var mat = new StandardMaterial("mat", scene);
    var texture = new Texture("https://doc.babylonjs.com/img/getstarted/semihouse.png", scene);
    // mat.diffuseColor = new Color3(0,1,4);

    var columns = 6;  // 6 columns
    var rows = 1;  // 1 row

    //alien sprite
    var faceUV = new Array(6);

    //set all faces to same
    // for (var i = 0; i < 6; i++) {
    //     faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
    //     console.log(faceUV[i])
    // }

    var box = MeshBuilder.CreateBox('box', {
        faceColors: [
          new Color4(0,3,0, 1),
          new Color4(1,1,0,1),
          new Color4(1,1,2,1),
        ],
        wrap: true,
        size: 2
    }, scene);
    box.material = mat;

    const box2 = MeshBuilder.CreateBox('box', {
      size: 2
  }, scene);
  box2.position = new Vector3(-1,0,2)

    setTimeout(() => {
      console.log("ready")
      const combinedMesh = Mesh.MergeMeshes([box, box2])
      
      if(combinedMesh){
        console.log(combinedMesh)
        combinedMesh.locallyTranslate(new Vector3(0,2,0))
      }
    }, 3000)
    return box;
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
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.5;

    const dirLight = new DirectionalLight("light", new Vector3(-4, -10, 1), scene);
    dirLight.intensity = 10

    shadowGen = new ShadowGenerator(1024, dirLight)
    shadowGen.setDarkness(0.5)
    
    var box = MeshBuilder.CreateBox('new', {
      size: 2
  }, scene);
  box.position = new Vector3(6,2,2)
    shadowGen.addShadowCaster(box)
    console.log(shadowGen)
    setInterval(() => box.locallyTranslate(new Vector3(0,0,.2)), 500)
    return light;
  }
  
  function createSphere(scene: Scene) {
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene,
    );
    const sphereMat = new StandardMaterial("groundMat", scene)
    sphere.material = sphereMat
    sphereMat.wireframe = true
    sphere.position.y = 4;

    shadowGen.addShadowCaster(sphere)
    console.log(shadowGen)
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
    
    // diffuseTex.uScale = 10
    // diffuseTex.vScale = 10

    ground.receiveShadows = true
    return ground;
  }
  //--------------------------------------------------
  //--------------------------------------------------
  //Bottom of Code
  
  function createArcRotateCamera(scene: Scene) {
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
    const box = scene.getMeshByName("new")
    if(box)camera.setTarget(box.position)
    
    return camera;
  }
  
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      facebox?:Mesh;
      light?: Light;
      sphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    
    }
    
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();



    // that.box = createBox(that.scene, 2, 5, 3, 3, 2, 1);
    // that.facebox = createFacedBox(that.scene, 2, 5, 3,);
    that.light = createLight(that.scene);
    
    
    that.sphere = createSphere(that.scene);
    that.ground = createGround(that.scene);
    that.camera = createArcRotateCamera(that.scene)

    // const mainMesh = that.scene.getMeshByName("box")

    // const sphereMesh = that.scene.getMeshByName("sphere")
    // if(mainMesh && sphereMesh){
    //   sphereMesh.locallyTranslate(new Vector3(-1, 0,0))
    //   mainMesh.locallyTranslate(new Vector3(0,0,1))
      
    // }
    // window.addEventListener("keyup", e => {
    //   if(e.key === "d") mainMesh?.addRotation(0,.1,0)
    //   if(e.key === "w") mainMesh?.locallyTranslate(new Vector3(0,0,.1))
    // })
    return that;
  }
