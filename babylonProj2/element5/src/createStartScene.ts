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
  import { PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
  import * as CANNON from "cannon"
  //----------------------------------------------------
  console.log(CANNON)
 
  //-----------------------------------------------------

  //MIDDLE OF CODE - FUNCTIONS

  // initialising movement varaibles and animations

  let runningSpeed: any = .1
  let isMoving: Boolean = false
  let gamgeGround: any = undefined 
  let anims: any
  let blocks: any[] = []

   
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

  // Importing galdiater model

  function importPlayerMesh(scene: Scene,pos: any) {

    
    SceneLoader.ImportMeshAsync("", "./models/", "gladiator.glb").then( result => {
      const M = result.meshes
      anims = result.animationGroups
      console.log(M)
      console.log(anims)

      // container for model mesh
      const bodyBox = MeshBuilder.CreateBox("bodyBox", {height: 2, size: .8}, scene)
      bodyBox.isVisible = false
      bodyBox.visibility = 0
      bodyBox.physicsImpostor = new PhysicsImpostor(bodyBox, PhysicsImpostor.BoxImpostor, {
        mass: 0 }, scene )


      // root control for mesh
      M[0].parent = bodyBox
      M[0].position = new Vector3(0,-1,0)

      const {x,z} = pos
      bodyBox.position = new Vector3(x, 1, z)

      // registered the box physics
      // movement for the model 

      window.addEventListener("keydown", e => {
          if(e.key === "a"){
           bodyBox.locallyTranslate(new Vector3(-.25,0, 0))
            anims.forEach(anim => anim.name ==="running" && anim.play(true))
          }
          if(e.key === "d"){
            bodyBox.locallyTranslate(new Vector3(.25,0, 0))
            anims.forEach(anim => anim.name ==="running" && anim.play(true))
          }
      })


      scene.registerAfterRender(() => {

        //runs 60 times per second while rendering 

        // ground moves backwards infinetly if player is moving 

        if(isMoving && gamgeGround)  {
         
          gamgeGround.locallyTranslate(new Vector3(0,0,-runningSpeed))
          if(gamgeGround.position.z < -50) gamgeGround.position.z = 0

          blocks.length && blocks.forEach(blck =>blck.locallyTranslate(new Vector3(0,0,-runningSpeed) )) 
        }
        
      })
      initInfiniteBlocks(scene, bodyBox)

    })


    
  }
  // manages the action when meshs collide

  function actionManagerIntersect(scene: Scene, mainMesh: any, toCollideWith: Mesh, callback){
    mainMesh.actionManager = new ActionManager(scene);

    mainMesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: toCollideWith
        },
        function(evt) {
          callback()
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

    //Create HDR skybox
    function createHdrEnvironment(scene: Scene) {
      let hdrTexture = CubeTexture.CreateFromPrefilteredData("./textures/environment.env", scene)

      scene.createDefaultSkybox(hdrTexture, false)

    }

    // creates hemispheric light
 
  function createHemiLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }

  //----------------------------------------------------------
  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE

  // typescript template 
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

    // enabels physics 
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), new CannonJSPlugin(true, 10, CANNON));
    //----------------------------------------------------------
    const ground = MeshBuilder.CreateGround("ground",{height: 200, width: 50}, that.scene)

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
    diffuseTex.uScale = 15
    diffuseTex.vScale = 40
    bumpTex.uScale = 15
    bumpTex.vScale = 40

    importPlayerMesh(that.scene, {x: 0, z: 0})

    //  creating a simple user interface (UI) with start and stop buttons for controlling animations

    const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")
    let stopBtn
    const startBtn = createSceneButton(that.scene, "startBtn", "start", "40", 30, ui, () => {
      isMoving = !isMoving
      anims.forEach(anim => {
        isMoving ? anim.name ==="running" && anim.play(true) :  anim.name ==="running" && anim.stop() 
      })
      startBtn.isVisible = false
      stopBtn.isVisible = true
    }, true)
    stopBtn = createSceneButton(that.scene, "stopBtn", "stop", "40", 30, ui, () => {
      isMoving = !isMoving
      anims.forEach(anim => {
        isMoving ? anim.name ==="running" && anim.play(true) :  anim.name ==="running" && anim.stop() 
      })
      startBtn.isVisible = true
      stopBtn.isVisible = false
    }, false)

    createHdrEnvironment(that.scene)
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);


    return that;    
  }
  //----------------------------------------------------

  // createbuttons
  function createSceneButton(scene: Scene, name: string, text: string, x: string,
    y: number, screenUiContainer, callback, isVisible){
     var button = GUI.Button.CreateSimpleButton(name, text);
     button.top= `${y}%`
     button.left = x;
     
     button.width = "160px"
     button.height = "60px";
     button.color = "white";
     button.cornerRadius = 10;
     button.background = "green";
     button.onPointerUpObservable.add(function() {
       callback()
     });

     button.isVisible = isVisible
     screenUiContainer.addControl(button);
     return button;

    

    }

  // initialization for blocks
  function initInfiniteBlocks(scene, characterBody){
    const cylindertexture = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/factory_wall/factory_wall_diff_4k.jpg", scene);

    // that creates a repeating pattern of cylinders
    setInterval(() => {
        if(!isMoving) return 
        const meshId = Math.random().toLocaleString()
        const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameter: 1.8, height: 10 }, scene);
        cylinder.id = meshId
        cylinder.position = new Vector3(
          // always half of the height 
            Scalar.RandomRange(-10, 10),
            5,
            Scalar.RandomRange(15, 20)
        );

        // Creating a material and assigning the texture to it
         const material = new StandardMaterial("cylinderMaterial", scene);
        
         material.diffuseTexture = cylindertexture;

          // Applying the material to the cylinder
         cylinder.material = material;
    
        cylinder.physicsImpostor = new PhysicsImpostor(
            cylinder,
            PhysicsImpostor.CylinderImpostor,
            { mass: 1, friction: 1, restitution: 0.5 },
            scene
        );
        //adds the newly created cylinder to an array named blocks
        blocks.push(cylinder)


        // handles interactions or collisions between the cylindersand model
        actionManagerIntersect(scene, cylinder, characterBody, () => {
          alert("Game Over")
        })

        //It removes the cylinder from the blocks array using the filter method. 
        //The condition blck.id !== meshId ensures that only the cylinder with the specified meshId is removed.
    
        setTimeout(() => {
          blocks = blocks.filter(blck => blck.id !== meshId)
          cylinder.dispose();
          material.dispose(); // Dispose the material to free up resources
      }, 10000);
    }, 1000);
  }