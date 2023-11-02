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
    TargetCamera,
    Sprite,
    SpriteManager
  } from "@babylonjs/core";
  //-------------------------------------------
  //-------------------------------------------


  //Middle of code-----------------------------

  function createTerrain (scene: Scene) {
    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "https://assets.babylonjs.com/environments/villageheightmap.png", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});

     //Create large ground for valley environment
     const largeGroundMat = new StandardMaterial("largeGroundMat");
     largeGroundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/valleygrass.png");
     
     largeGround.material = largeGroundMat;
     return largeGround;
 
     
     return scene;
  }
  
  function createBox(scene: Scene, px: number, py: number, pz: number, sx: number, sy: number, sz: number) {
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene);
    box.position = new Vector3(px, py, pz);
    box.scaling = new Vector3(sx, sy, sz);

    return box;
  }
  //h

  // faced box function 
  function createFacedBox(scene: Scene, px: number, py: number, pz: number) {
    const mat = new StandardMaterial("Mat");
    const texture = new Texture("https://assets.babylonjs.com/environment/numbers.jpg")
    mat.diffuseTexture = texture;

    const faceUV = new Array(6);

 // for
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new Vector4((i+1));
    }


  }

  
  function createLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    return light;
  }
  
  function createSphere(scene: Scene) {
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene,
    );
    sphere.position.y = 1;
    return sphere;
  }
  
  function createGround(scene: Scene) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6 },
      scene,
    );
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
    camera.attachControl(true);
    return camera;
  }
  // function to create any light


  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      facebox?:Mesh;
      terrain?:Mesh;
      light?: Light;
      sphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();

    that.terrain = createTerrain(that.scene);
    that.box = createBox(that.scene, 2, 5, 3, 3, 2, 1);
    //that.facebox = createFacedBox(that.scene, 2, 5, 3,);
    that.light = createLight(that.scene);
    that.sphere = createSphere(that.scene);
    that.ground = createGround(that.scene);
    that.camera = createArcRotateCamera(that.scene);

    return that;
  }
