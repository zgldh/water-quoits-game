import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { AdvancedDynamicTexture, Control } from '@babylonjs/gui';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, IPhysicsEngine, AmmoJSPlugin, Ray, AbstractMesh, MeshBuilder } from "@babylonjs/core";
import { BOX_BORDER, BOX_HEIGHT, BOX_WIDTH, BUSTER_AFFECT_HEIGHT, BUSTER_CENTER_FORCE, BUSTER_LEFT_X, BUSTER_RIGHT_X, BUSTER_SIDE_FORCE, BUSTER_SIDE_RADIUS, BUSTER_Y, BUSTER_Z, CAMERA_POSITION_Y, CAMERA_POSITION_Z, GRAVITY_WATER, MAX_TORUSES, MAX_TORUS_COLORS, TORUS_ANGULAR_VELOCITY_SLOWDOWN, TORUS_LINEAR_VELOCITY_SLOWDOWN, TORUS_MAX_ANGULAR_VELOCITY, TORUS_MAX_LINEAR_VELOCITY } from "./consts";
import { MeshMaker } from './MeshMaker';

class App {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene!: Scene;
    private camera!: ArcRotateCamera;

    private physicsEngine!: IPhysicsEngine;

    private currentOrientationGamma: number = 0;

    private meshMaker: MeshMaker;
    leftBuster: Mesh;
    rightBuster: Mesh;

    constructor() {
        // create the canvas html element and attach it to the webpage
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "gameCanvas";
        document.body.appendChild(this.canvas);

        // initialize babylon scene and engine
        this.engine = new Engine(this.canvas, true, {}, true);
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

        this.meshMaker = new MeshMaker(this.scene)

        let gravityVector = new Vector3(0, GRAVITY_WATER, 0);
        // let physicsPlugin = new CannonJSPlugin();
        let physicsPlugin = new AmmoJSPlugin();
        this.scene.enablePhysics(gravityVector, physicsPlugin);
        this.physicsEngine = this.scene.getPhysicsEngine() as IPhysicsEngine;

        this.camera = new ArcRotateCamera("Camera", 0, 0, 10, new Vector3(0, CAMERA_POSITION_Y, 0), this.scene);
        this.camera.position = new Vector3(0, 0, CAMERA_POSITION_Z);
        this.camera.attachControl(this.canvas, true);
        let light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);

        // Play box
        const { wallLeft, wallRight, wallTop, wallBottom, frontWall, backWall } = this.meshMaker.makeWaterBox();

        // Toruses
        const torusMaterials = this.meshMaker.makeTorusMaterials(MAX_TORUS_COLORS);
        for (let i = 0; i < MAX_TORUSES; i++) {
            let torus: Mesh = this.meshMaker.makeTorus();
            torus.position.x = Math.random() * (BOX_WIDTH - BOX_BORDER * 4) - (BOX_WIDTH - BOX_BORDER * 4) / 2;
            torus.position.y = Math.random() * (BOX_HEIGHT - BOX_BORDER * 2) - (BOX_HEIGHT - BOX_BORDER * 2) / 2;
            torus.material = torusMaterials[Math.floor(Math.random() * MAX_TORUS_COLORS)];
            torus.physicsImpostor.registerBeforePhysicsStep(() => {
                // Torus should be slowed down by the water
                const currentLinearVelocity = torus.physicsImpostor.getLinearVelocity();
                if (currentLinearVelocity.length() > TORUS_MAX_LINEAR_VELOCITY) {
                    currentLinearVelocity.normalize().scaleInPlace(TORUS_MAX_LINEAR_VELOCITY);
                } else {
                    currentLinearVelocity.scaleInPlace(TORUS_LINEAR_VELOCITY_SLOWDOWN);
                }
                torus.physicsImpostor.setLinearVelocity(currentLinearVelocity);
                const currentAngularVelocity = torus.physicsImpostor.getAngularVelocity();
                if (currentAngularVelocity.length() > TORUS_MAX_ANGULAR_VELOCITY) {
                    currentAngularVelocity.normalize().scaleInPlace(TORUS_MAX_ANGULAR_VELOCITY);
                } else {
                    currentAngularVelocity.scaleInPlace(TORUS_ANGULAR_VELOCITY_SLOWDOWN);
                }
                torus.physicsImpostor.setAngularVelocity(currentAngularVelocity);
            });
        }

        // Busters
        const { leftBuster, rightBuster } = this.meshMaker.makeBusters();
        this.leftBuster = leftBuster;
        this.rightBuster = rightBuster;

        // Pins
        const { leftPin, middlePin, rightPin } = this.meshMaker.makePins();
    }
    private prepareInput() {

        window.addEventListener("resize", () => { this.engine.resize(); });
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

        // left and right buttons
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        var leftButton = this.meshMaker.createBustButton("leftbutton");
        leftButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftButton.onPointerDownObservable.add(() => {
            let centerPicked = this.centraPickBustedTorus(this.leftBuster.position);
            let sidePicked = this.sidePickBustedTorus(this.leftBuster.position);
            console.log('leftButton picked', centerPicked, sidePicked);
            centerPicked.forEach(element => {
                element.physicsImpostor.applyImpulse(new Vector3(0, BUSTER_CENTER_FORCE, 0), element.getAbsolutePosition());
            });
            sidePicked.forEach(element => {
                element.physicsImpostor.applyImpulse(new Vector3(0, BUSTER_SIDE_FORCE, 0), element.getAbsolutePosition());
            });
        });

        var rightButton = this.meshMaker.createBustButton("rightbutton");
        rightButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rightButton.onPointerDownObservable.add(() => {
            let centerPicked = this.centraPickBustedTorus(this.rightBuster.position);
            let sidePicked = this.sidePickBustedTorus(this.rightBuster.position);
            console.log('rightButton picked', centerPicked, sidePicked);
            centerPicked.forEach(element => {
                element.physicsImpostor.applyImpulse(new Vector3(Math.random(), BUSTER_CENTER_FORCE, Math.random()), element.getAbsolutePosition());
            });
            let centerPickedNames = centerPicked.map(element => element.name);
            sidePicked.forEach(element => {
                if (!centerPickedNames.includes(element.name)) {
                    element.physicsImpostor.applyImpulse(new Vector3(Math.random(), BUSTER_SIDE_FORCE, Math.random()), element.getAbsolutePosition());
                }
            });
        });

        advancedTexture.addControl(leftButton);
        advancedTexture.addControl(rightButton);
    }
    private pickFilter(mesh: AbstractMesh): boolean {
        return mesh.name.indexOf('torus') >= 0 && mesh.name.indexOf('hitter') >= 0;
    }
    private centraPickBustedTorus(centraVectory: Vector3): AbstractMesh[] {
        return this.scene.multiPickWithRay(
            new Ray(centraVectory, new Vector3(0, 1, 0), BUSTER_AFFECT_HEIGHT),
            this.pickFilter
        ).map(mesh => mesh.pickedMesh.parent as AbstractMesh);
    }
    private sidePickBustedTorus(centraVectory: Vector3): AbstractMesh[] {
        const pickedAll = [];
        for (let i = 0; i < BUSTER_SIDE_RADIUS; i = i + 0.02) {
            let ray1 = new Ray(new Vector3(centraVectory.x + i, centraVectory.y, centraVectory.z + 0), new Vector3(0, 1, 0), BUSTER_AFFECT_HEIGHT);
            let ray2 = new Ray(new Vector3(centraVectory.x - i, centraVectory.y, centraVectory.z + 0), new Vector3(0, 1, 0), BUSTER_AFFECT_HEIGHT);
            let ray3 = new Ray(new Vector3(centraVectory.x + 0, centraVectory.y, centraVectory.z + i), new Vector3(0, 1, 0), BUSTER_AFFECT_HEIGHT);
            let ray4 = new Ray(new Vector3(centraVectory.x + 0, centraVectory.y, centraVectory.z - i), new Vector3(0, 1, 0), BUSTER_AFFECT_HEIGHT);
            // let ray1Mesh = MeshBuilder.CreateLines("ray1", { points: [ray1.origin, ray1.origin.add(new Vector3(0, 1, 0))] }, this.scene);
            // let ray2Mesh = MeshBuilder.CreateLines("ray2", { points: [ray2.origin, ray2.origin.add(new Vector3(0, 1, 0))] }, this.scene);
            // let ray3Mesh = MeshBuilder.CreateLines("ray3", { points: [ray3.origin, ray3.origin.add(new Vector3(0, 1, 0))] }, this.scene);
            // let ray4Mesh = MeshBuilder.CreateLines("ray4", { points: [ray4.origin, ray4.origin.add(new Vector3(0, 1, 0))] }, this.scene);
            // ray1Mesh.position = ray1.origin;
            // ray2Mesh.position = ray2.origin;
            // ray3Mesh.position = ray3.origin;
            // ray4Mesh.position = ray4.origin;
            pickedAll.concat(this.scene.multiPickWithRay(ray1, this.pickFilter));
            pickedAll.concat(this.scene.multiPickWithRay(ray2, this.pickFilter));
            pickedAll.concat(this.scene.multiPickWithRay(ray3, this.pickFilter));
            pickedAll.concat(this.scene.multiPickWithRay(ray4, this.pickFilter));
        }
        const pickedMeshes: { [key: string]: AbstractMesh } = {};
        pickedAll.map(p => p.pickedMesh.parent as AbstractMesh).forEach(m => {
            // if (pickedMeshes.hasOwnProperty(m.name) === false) {
                pickedMeshes[m.name] = m;
            // };
        });

        return Object.values(pickedMeshes);
    }
}
new App();