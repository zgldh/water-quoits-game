import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Texture, CannonJSPlugin, IPhysicsEnabledObject, IPhysicsEngine, PhysicsImpostor, BoxBuilder, AmmoJSPlugin } from "@babylonjs/core";
import { BOX_BORDER, BOX_DEEPTH, BOX_HEIGHT, BOX_WIDTH, CAMERA_POSITION_Y, CAMERA_POSITION_Z, MAX_SPHERES, SPHERE_DIAMETER } from "./consts";

class App {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene!: Scene;
    private camera!: ArcRotateCamera;

    private physicsEngine!: IPhysicsEngine;

    private currentOrientationGamma: number = 0;


    constructor() {
        // create the canvas html element and attach it to the webpage
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "gameCanvas";
        document.body.appendChild(this.canvas);

        // initialize babylon scene and engine
        this.engine = new Engine(this.canvas, true);
        this.prepareScene();
        // this.scene.debugLayer.show();

        this.prepareInput();

        // run the main render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    private prepareScene() {
        this.scene = new Scene(this.engine);
        var gravityVector = new Vector3(0, -9.81, 0);
        // var physicsPlugin = new CannonJSPlugin();
        var physicsPlugin = new AmmoJSPlugin();
        this.scene.enablePhysics(gravityVector, physicsPlugin);
        this.physicsEngine = this.scene.getPhysicsEngine() as IPhysicsEngine;

        this.camera = new ArcRotateCamera("Camera", 0, 0, 10, new Vector3(0, CAMERA_POSITION_Y, 0), this.scene);
        this.camera.position = new Vector3(0, 0, CAMERA_POSITION_Z);
        this.camera.attachControl(this.canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);

        // Play box
        const wallLeft = BoxBuilder.CreateBox("wallLeft", { width: BOX_BORDER, height: BOX_HEIGHT - BOX_BORDER * 2, depth: BOX_DEEPTH });
        const wallRight = BoxBuilder.CreateBox("wallRight", { width: BOX_BORDER, height: BOX_HEIGHT - BOX_BORDER * 2, depth: BOX_DEEPTH });
        const wallTop = BoxBuilder.CreateBox("wallTop", { width: BOX_WIDTH, height: BOX_BORDER, depth: BOX_DEEPTH });
        const wallBottom = BoxBuilder.CreateBox("wallBottom", { width: BOX_WIDTH, height: BOX_BORDER, depth: BOX_DEEPTH });
        const frontWall = BoxBuilder.CreateBox("frontWall", { width: BOX_WIDTH, height: BOX_HEIGHT, depth: BOX_DEEPTH });
        const backWall = BoxBuilder.CreateBox("backWall", { width: BOX_WIDTH, height: BOX_HEIGHT, depth: BOX_DEEPTH });

        wallLeft.position.x = -BOX_WIDTH / 2 + BOX_BORDER / 2;
        wallRight.position.x = BOX_WIDTH / 2 - BOX_BORDER / 2;
        wallTop.position.y = BOX_HEIGHT / 2 - BOX_BORDER / 2;
        wallBottom.position.y = -BOX_HEIGHT / 2 + BOX_BORDER / 2;
        frontWall.position.z = -BOX_DEEPTH;
        backWall.position.z = BOX_DEEPTH;

        wallLeft.physicsImpostor = new PhysicsImpostor(wallLeft, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        wallRight.physicsImpostor = new PhysicsImpostor(wallRight, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        wallTop.physicsImpostor = new PhysicsImpostor(wallTop, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        wallBottom.physicsImpostor = new PhysicsImpostor(wallBottom, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        frontWall.physicsImpostor = new PhysicsImpostor(frontWall, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        backWall.physicsImpostor = new PhysicsImpostor(backWall, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);

        frontWall.visibility = 0.2;

        // Spheres
        for (let i = 0; i < MAX_SPHERES; i++) {
            let sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: SPHERE_DIAMETER }, this.scene);
            sphere.position.x = Math.random() * (BOX_WIDTH - BOX_BORDER * 2) - (BOX_WIDTH - BOX_BORDER * 2) / 2;
            sphere.position.y = Math.random() * (BOX_HEIGHT - BOX_BORDER * 2) - (BOX_HEIGHT - BOX_BORDER * 2) / 2;
            sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, this.scene);
        }

    }
    private prepareInput() {
        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });

        window.addEventListener('deviceorientation', (event: DeviceOrientationEvent) => {
            this.currentOrientationGamma = event.gamma;
            this.engine.resize();
        }, true);

        window.addEventListener('devicemotion', event => {
            if (event.accelerationIncludingGravity.y !== null) {
                const gravityVector = new Vector3(
                    event.accelerationIncludingGravity.y,
                    -event.accelerationIncludingGravity.x,
                    event.accelerationIncludingGravity.z);
                this.physicsEngine.setGravity(gravityVector);
            }
        }, true);

    }
}
new App();