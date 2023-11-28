//-----------------------------------------------------
//TOP OF CODE - IMPORTING BABYLONJS
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import * as GUI from "@babylonjs/gui"
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    SpotLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    Color3,
    Space,
    ShadowGenerator,
    PointLight,
    DirectionalLight,
    CubeTexture,
    Sprite,
    SpriteManager,
    SceneLoader,
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    CannonJSPlugin,
    PhysicsImpostor,
    Scalar,
  } from "@babylonjs/core";
  import HavokPhysics from "@babylonjs/havok";
  import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
  import * as CANNON from "cannon"
  //----------------------------------------------------
  console.log(CANNON)
  //----------------------------------------------------
  // Initialisation of Physics (Havok)
  // let initializedHavok;
  // HavokPhysics().then((havok) => {
  //   initializedHavok = havok;
  //   console.log(initializedHavok)
  // });

  // const havokInstance = await HavokPhysics();
  // const havokPlugin = new HavokPlugin(true, havokInstance);

  // globalThis.HK = await HavokPhysics();
  //-----------------------------------------------------

  //MIDDLE OF CODE - FUNCTIONS
  let runningSpeed: any = .1
  let isMoving: Boolean = false
  let gamgeGround: any = undefined 
  let anims: any

  function importPlayerMesh(scene: Scene,pos: any) {

    
    const Model = SceneLoader.ImportMeshAsync("", "./models/", "gladiator.glb").then( result => {
      const M = result.meshes
      anims = result.animationGroups
      console.log(M)
      console.log(anims)
      // M[2].showBoundingBox = true


      const bodyBox = MeshBuilder.CreateBox("bodyBox", {height: 2, size: .8}, scene)
      bodyBox.isVisible = false
      bodyBox.visibility = 0
      bodyBox.physicsImpostor = new PhysicsImpostor(bodyBox, PhysicsImpostor.BoxImpostor, {
        mass: 0 }, scene )

      M[0].parent = bodyBox
      M[0].position = new Vector3(0,-1,0)

      // bodyBox.visibility = 
      const {x,z} = pos
      bodyBox.position = new Vector3(x, 1, z)

      // registered the box physics
    

      window.addEventListener("keydown", e => {
          if(e.key === "a"){
           
            anims.forEach(anim => anim.name ==="running" && anim.play(true))
          }
          if(e.key === "d"){
            bodyBox.locallyTranslate(new Vector3(.25,0, 0))
            anims.forEach(anim => anim.name ==="running" && anim.play(true))
          }
      })
      window.addEventListener("keydown", e => {

        if(e.key === "a"){
          bodyBox.locallyTranslate(new Vector3(-.25,0,0))
          anims.forEach(anim => anim.name ==="running" && anim.play(true))
        }
        if(e.key === "d"){
          bodyBox.locallyTranslate(new Vector3(.25,0, 0))
          anims.forEach(anim => anim.name ==="running" && anim.play(true))
        }
      })

      scene.registerAfterRender(() => {
        if(isMoving && gamgeGround)  {
          
          gamgeGround.locallyTranslate(new Vector3(0,0,-runningSpeed))
        }
      })

    })
   


  }

  function actionManagerIntersect(scene: Scene, mainMesh: any, toCollideWith: Mesh){
    mainMesh.actionManager = new ActionManager(scene);

    mainMesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: toCollideWith
        },
        function(evt) {
          console.log("successfully collided")
        }
      )
    );
    mainMesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionExitTrigger,
          parameter: toCollideWith
        },
        function(evt) {
          console.log("successfully UN-COLLIDED")
        }
      )
    );
  } 



  function createBox(scene: Scene, x: number, y: number, z: number) {
    let box: Mesh = MeshBuilder.CreateBox("box", { });
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
    return box;
  }
    
  function createGround(scene: Scene) {
    const ground: Mesh = MeshBuilder.CreateGround("ground", {height: 10, width: 10, subdivisions: 4});
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return ground;
  }

  //----------------------------------------------------------------------------------------------
   //Create Skybox
   function createSkybox(scene: Scene) {
    //Skybox
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }

    //Create Skybox
    function createHdrEnvironment(scene: Scene) {
      let hdrTexture = CubeTexture.CreateFromPrefilteredData("./textures/environment.env", scene)

      scene.createDefaultSkybox(hdrTexture, false)

    }



  function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh) {
    // only spotlight, point and directional can cast shadows in BabylonJS
    switch (index) {
      case 1: //hemispheric light
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(px, py, pz), scene);
        hemiLight.intensity = 0.1;
        return hemiLight;
        break;
      case 2: //spot light
        const spotLight = new SpotLight("spotLight", new Vector3(px, py, pz), new Vector3(0, -1, 0), Math.PI / 3, 10, scene);
        spotLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
        let shadowGenerator = new ShadowGenerator(1024, spotLight);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.useExponentialShadowMap = true;
        return spotLight;
        break;
      case 3: //point light
        const pointLight = new PointLight("pointLight", new Vector3(px, py, pz), scene);
        pointLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
        shadowGenerator = new ShadowGenerator(1024, pointLight);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.useExponentialShadowMap = true;
        return pointLight;
        break;
    }
  }
 
  function createHemiLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }

  //PREVIOUS METHODS
  // function createSpotLight(scene: Scene, px: number, py: number, pz: number) {
  //   var light = new SpotLight("spotLight", new Vector3(-1, 1, -1), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
  //   light.diffuse = new Color3(0.39, 0.44, 0.91);
	//   light.specular = new Color3(0.22, 0.31, 0.79);
  //   return light;
  // }
  
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
    // camera.attachControl(true);
    return camera;
  }
  //----------------------------------------------------------
  
  function initializePhysicss(scene: Scene){
    // const havokInstacnce = HavokPhysics()

    

  }
  //----------------------------------------------------------
  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      ground?: Mesh;
      importMesh?: any;
      actionManager?: any;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    // that.scene.debugLayer.show();
    //initialise physics
    
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), new CannonJSPlugin(true, 10, CANNON));
    //----------------------------------------------------------
    const ground = MeshBuilder.CreateGround("ground",{height: 500, width: 50}, that.scene)

    //pasted ground mat
    const groundMat = new StandardMaterial("groundMat")
    ground.material = groundMat
    groundMat.specularColor = new Color3(0,0,0)
    const diffuseTex = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/grey_stone_path/grey_stone_path_diff_4k.jpg")
    groundMat.diffuseTexture = diffuseTex
    const bumpTex = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/grey_stone_path/grey_stone_path_nor_gl_4k.jpg")
    groundMat.bumpTexture = bumpTex
    ground.physicsImpostor = new PhysicsImpostor(ground , PhysicsImpostor.BoxImpostor,
    { mass: 0,  friction: 0, restitution: 2 })
    gamgeGround = ground
    diffuseTex.uScale = 80
    diffuseTex.vScale = 50
    bumpTex.uScale = 80
    bumpTex.vScale = 50

    importPlayerMesh(that.scene, {x: 0, z: 0})

    const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")

    const startBtn = createSceneButton(that.scene, "startBtn", "start", "40", 30, ui)

    createHdrEnvironment(that.scene)
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);

    return that;
  }
  //----------------------------------------------------

  // createbuttons
  function createSceneButton(scene: Scene, name: string, text: string, x: string,
    y: number, screenUiContainer){
     var button = GUI.Button.CreateSimpleButton(name, text);
     button.top= `${y}%`
     button.left = x;
     
     button.width = "160px"
     button.height = "60px";
     button.color = "white";
     button.cornerRadius = 10;
     button.background = "green";
     button.onPointerUpObservable.add(function() {
        isMoving = !isMoving
        anims.forEach(anim => {
          isMoving ? anim.name ==="running" && anim.play(true) :  anim.name ==="running" && anim.stop() 
        })
     });
     screenUiContainer.addControl(button);
     return button;
    }