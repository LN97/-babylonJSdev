//-----------------------------------------------------
//TOP OF CODE - IMPORTING BABYLONJS
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import * as GUI from "@babylonjs/gui"

import {
  Sound,
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

  import * as CANNON from "cannon"
  //----------------------------------------------------

// your website name
// changw when uploaded

let urlName = "http://127.0.0.1:5173"
  //----------------------------------------------------

  //-----------------------------------------------------

  //MIDDLE OF CODE - FUNCTIONS
  let keyDownMap: any[] = [];
  let currentSpeed: number = 0.1;
  let walkingSpeed: number = 0.1;
  let runningSpeed: number = 0.4;

  function importPlayerMesh(scene: Scene, collider: Mesh,pos: any) {
    const Model = SceneLoader.ImportMeshAsync("", "./models/", "gladiator.glb").then( result => {
      const M = result.meshes
      const anims = result.animationGroups
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
      collider.physicsImpostor = new PhysicsImpostor(collider , PhysicsImpostor.BoxImpostor,
        { mass: 1,  friction: 0, restitution: .5 })
      
        
      actionManagerIntersect(scene, bodyBox, collider)

      window.addEventListener("keydown", e => {
          if(e.key === "w"){
            bodyBox.locallyTranslate(new Vector3(0,0,.25))
            anims.forEach(anim => anim.name ==="running" && anim.play(true))
          }
          if(e.key === "s"){
            bodyBox.locallyTranslate(new Vector3(0,0,-.25))
            anims.forEach(anim => anim.name ==="running" && anim.play(true))
          }
          if(e.key === "a"){
            bodyBox.locallyTranslate(new Vector3(-.25,0,0))
            anims.forEach(anim => anim.name ==="running" && anim.play(true))
          }
          if(e.key === "d"){
            bodyBox.locallyTranslate(new Vector3(.25,0, 0))
            anims.forEach(anim => anim.name ==="running" && anim.play(true))
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

  function actionManager(scene: Scene){
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyDownTrigger,
          //parameters: 'w'
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = true; }
      )
    );
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = false; }
      )
    );
    return scene.actionManager;
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
    camera.attachControl(true);
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
    // const ground = MeshBuilder.CreateGround("ground",{height: 50, width: 50}, that.scene)

    // sound
    const clickSound = new Sound("clickS", "audio/menu-click.wav", that.scene, null, {
      autoplay: false, loop: false
    })


    // //pasted ground mat
    // const groundMat = new StandardMaterial("groundMat")
    // ground.material = groundMat
    // groundMat.specularColor = new Color3(0,0,0)
    // const diffuseTex = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/grey_stone_path/grey_stone_path_diff_4k.jpg")
    // groundMat.diffuseTexture = diffuseTex
    
    // groundMat.bumpTexture = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/grey_stone_path/grey_stone_path_nor_gl_4k.jpg")

    // ground.physicsImpostor = new PhysicsImpostor(ground , PhysicsImpostor.BoxImpostor,
    // { mass: 0,  friction: 0, restitution: 2 })

    // const box= MeshBuilder.CreateBox("box",{size: 1}, that.scene)
    // box.position = new Vector3(0,1.5,-4)

    // bouncing spheres

  //   const spherertexture = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/slate_floor/slate_floor_diff_4k.jpg", that.scene);


  //  setInterval(() => {
  //      const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.5 }, that.scene);
  //      sphere.position = new Vector3(
  //          Scalar.RandomRange(-5, 5),
  //          5,
  //          Scalar.RandomRange(-5, 5)
  //      );
   
  //      // Creating a material and assigning the texture to it
  //      const material = new StandardMaterial("sphereMaterial", that.scene);
  //      material.diffuseTexture = spherertexture
   
  //      // Applying the material to the sphere
  //      sphere.material = material;
   
  //      sphere.physicsImpostor = new PhysicsImpostor(
  //          sphere,
  //          PhysicsImpostor.SphereImpostor,
  //          { mass: 1, friction: 0, restitution: 0.5 },
  //          that.scene
  //      );
   
  //      if (sphere.intersectsMesh(ground, true)) {
  //          console.log("COLLIDED");
  //      }
   
  //      setTimeout(() => {
  //          sphere.dispose();
  //          material.dispose(); // Dispose the material to free up resources
  //      }, 10000);
  //  }, 100);
   


  //       // bouncing cylinders

  //       const cylindertexture = new Texture("https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/factory_wall/factory_wall_diff_4k.jpg", that.scene);


  //     setInterval(() => {
  //         const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameter: .8, height: 1 }, that.scene);
  //         cylinder.position = new Vector3(
  //             Scalar.RandomRange(-5, 5),
  //             5,
  //             Scalar.RandomRange(-5, 5)
  //         );

  //         // Creating a material and assigning the texture to it
  //          const material = new StandardMaterial("cylinderMaterial", that.scene);
  //          material.diffuseTexture = cylindertexture;

  //           // Applying the material to the cylinder
  //          cylinder.material = material;
      
  //         cylinder.physicsImpostor = new PhysicsImpostor(
  //             cylinder,
  //             PhysicsImpostor.CylinderImpostor,
  //             { mass: 1, friction: 0, restitution: 0.5 },
  //             that.scene
  //         );
      
  //         if (cylinder.intersectsMesh(ground, true)) {
  //             console.log("COLLIDED");
  //         }
      
  //         setTimeout(() => {
  //           cylinder.dispose();
  //           material.dispose(); // Dispose the material to free up resources
  //       }, 10000);
  //   }, 100);
  //   // setTimeout(() => {
     
  //   // }, 4000);

  //   //any further code goes here-----------
  //   // that.box = createBox(that.scene, 2, 2, 2);
  //   // that.ground = createGround(that.scene);

  //   importPlayerMesh(that.scene, box, {x: 0, z: 0})
  //   // that.actionManager = actionManager(that.scene);
    // importPlayerMesh(that.scene, box, {x: 1, z: -2});

    createHdrEnvironment(that.scene)
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    
   const screenUIContainer = GUI.AdvancedDynamicTexture.CreateFullscreenUI("uiscreen")

    const element1Btn = createSceneButton(that.scene, "btn", "Element 1","40" ,-40, screenUIContainer, 1, clickSound)

    const element2Btn = createSceneButton(that.scene, "btn", "Element 2","40" ,-20, screenUIContainer, 2, clickSound)

    const element3Btn = createSceneButton(that.scene, "btn", "Element 3","40" ,0, screenUIContainer, 3, clickSound)

    const element4Btn = createSceneButton(that.scene, "btn", "Element 4","40" ,20, screenUIContainer, 4, clickSound)

    const element5Btn = createSceneButton(that.scene, "btn", "Element 5","40" ,40, screenUIContainer, 5, clickSound)


    return that;
  }
  //----------------------------------------------------
  // createbuttons
  function createSceneButton(scene: Scene, name: string, text: string, x: string,
    y: number, screenUiContainer, elementNumber, sound){
     var button = GUI.Button.CreateSimpleButton(name, text);
     button.top= `${y}%`
     button.left = x;
     
     button.width = "160px"
     button.height = "60px";
     button.color = "white";
     button.cornerRadius = 10;
     button.background = "green";
     button.onPointerUpObservable.add(function() {
      sound.play()
      setTimeout(() => {

            window.location.replace(`${urlName}/element${elementNumber}/`)
       
      }, 1000);
   
      // window.location.replace(`./element${elementNumber}/`)
     });
     screenUiContainer.addControl(button);
     return button;
    }