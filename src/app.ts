import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core";
import { BOX_BORDER, BOX_DEEPTH, BOX_HEIGHT, BOX_WIDTH } from "./consts";

class App {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene!: Scene;
    private camera!: ArcRotateCamera;

    private prepareScene() {
        this.scene = new Scene(this.engine);

        this.camera = new ArcRotateCamera("Camera", 0, 0, 10, Vector3.Zero(), this.scene);
        this.camera.position = new Vector3(0, 0, -10);
        this.camera.attachControl(this.canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 0.5 }, this.scene);

        // Play box
        const wallLeft = MeshBuilder.CreateBox("wallLeft", { width: BOX_BORDER, height: BOX_HEIGHT - BOX_BORDER * 2, depth: BOX_DEEPTH });
        const wallRight = MeshBuilder.CreateBox("wallRight", { width: BOX_BORDER, height: BOX_HEIGHT - BOX_BORDER * 2, depth: BOX_DEEPTH });
        const wallTop = MeshBuilder.CreateBox("wallTop", { width: BOX_WIDTH, height: BOX_BORDER, depth: BOX_DEEPTH });
        const wallBottom = MeshBuilder.CreateBox("wallBottom", { width: BOX_WIDTH, height: BOX_BORDER, depth: BOX_DEEPTH });
        const frontWall = MeshBuilder.CreateBox("frontWall", { width: BOX_WIDTH, height: BOX_HEIGHT, depth: BOX_DEEPTH });
        const backWall = MeshBuilder.CreateBox("backWall", { width: BOX_WIDTH, height: BOX_HEIGHT, depth: BOX_DEEPTH });

        wallLeft.position.x = -BOX_WIDTH / 2 + BOX_BORDER / 2;
        wallRight.position.x = BOX_WIDTH / 2 - BOX_BORDER / 2;
        wallTop.position.y = BOX_HEIGHT / 2 - BOX_BORDER / 2;
        wallBottom.position.y = -BOX_HEIGHT / 2 + BOX_BORDER / 2;
        frontWall.position.z = -BOX_DEEPTH;
        backWall.position.z = BOX_DEEPTH;

        frontWall.visibility = 0.2;
    }

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
        this.scene.debugLayer.show();

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

        // run the main render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}
new App();