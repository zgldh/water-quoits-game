import { BoxBuilder, Color3, GlowLayer, Mesh, MeshBuilder, PhysicsImpostor, Scene, StandardMaterial } from "@babylonjs/core";
import { TORUS_DIAMETER, TORUS_THICKNESS, TORUS_TESSELLATION, TORUS_MASS, TORUS_FRICTION, TORUS_RESTITUTION, BOX_BORDER, BOX_DEEPTH, BOX_FRICTION, BOX_HEIGHT, BOX_RESTITUTION, BOX_WIDTH, BUSTER_COLOR, BUSTER_LEFT_X, BUSTER_RIGHT_X, BUSTER_Y, BUSTER_Z, MAX_TORUS_COLORS, PIN_DIAMETER_BOTTOM, PIN_DIAMETER_TOP, PIN_HEIGHT, PIN_LEFT_X, PIN_MIDDLE_X, PIN_MIDDLE_Y, PIN_RIGHT_X, PIN_Y, PIN_Z, PIN_BOTTOM_HEIGHT } from "./consts";
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';

export class MeshMaker {
    private scene: Scene;
    private torusCount = 0;

    public constructor(scene: Scene) {
        this.scene = scene;
    }
    setScene(scene: Scene) {
        this.scene = scene;
    }
    public makePins(): { leftPin: any; middlePin: any; rightPin: any; } {
        var gl = new GlowLayer("glow", this.scene);
        gl.intensity = 0.5;

        const leftPin = this.makePin("leftPin");
        const middlePin = this.makePin("middlePin");
        const rightPin = this.makePin("rightPin");
        leftPin.position.x = PIN_LEFT_X;
        leftPin.position.y = PIN_Y;
        leftPin.position.z = PIN_Z;
        middlePin.position.x = PIN_MIDDLE_X;
        middlePin.position.y = PIN_MIDDLE_Y;
        middlePin.position.z = PIN_Z;
        rightPin.position.x = PIN_RIGHT_X;
        rightPin.position.y = PIN_Y;
        rightPin.position.z = PIN_Z;
        return { leftPin, middlePin, rightPin };
    }
    private makePin(name: string): Mesh {
        const rootMesh = new Mesh(name, this.scene);

        const pin = MeshBuilder.CreateCylinder(`${name}-pin`, {
            height: PIN_HEIGHT, diameter: PIN_DIAMETER_TOP
        }, this.scene);
        const bottom = MeshBuilder.CreateCylinder(`${name}-bottom`, {
            height: PIN_BOTTOM_HEIGHT, diameter: PIN_DIAMETER_BOTTOM
        }, this.scene);

        rootMesh.addChild(pin);
        rootMesh.addChild(bottom);
        pin.position.y = PIN_HEIGHT / 2;

        pin.physicsImpostor = new PhysicsImpostor(pin, PhysicsImpostor.CylinderImpostor, { mass: 0 }, this.scene);
        bottom.physicsImpostor = new PhysicsImpostor(bottom, PhysicsImpostor.CylinderImpostor, { mass: 0 }, this.scene);
        rootMesh.physicsImpostor = new PhysicsImpostor(rootMesh, PhysicsImpostor.NoImpostor, { mass: 0 }, this.scene);
        return rootMesh;
    }
    public makeBusters(): { leftBuster: Mesh; rightBuster: Mesh; } {
        const leftBuster: Mesh = MeshBuilder.CreateCylinder("leftBuster", { height: 0.1, diameter: 1 }, this.scene);
        const rightBuster: Mesh = MeshBuilder.CreateCylinder("rightBuster", { height: 0.1, diameter: 1 }, this.scene);
        leftBuster.position.x = BUSTER_LEFT_X;
        leftBuster.position.y = BUSTER_Y + 0.5;
        leftBuster.position.z = BUSTER_Z;
        rightBuster.position.x = BUSTER_RIGHT_X;
        rightBuster.position.y = BUSTER_Y + 0.5;
        rightBuster.position.z = BUSTER_Z;
        const busterMaterial = new StandardMaterial("busterMaterial", this.scene);
        busterMaterial.diffuseColor = Color3.FromHexString(BUSTER_COLOR);
        leftBuster.material = busterMaterial;
        rightBuster.material = busterMaterial;

        return { leftBuster, rightBuster };
    }
    public makeWaterBox(): { wallLeft: Mesh; wallRight: Mesh; wallTop: Mesh; wallBottom: Mesh; frontWall: Mesh; backWall: Mesh; } {
        const wallLeft = BoxBuilder.CreateBox("wall_left", { width: BOX_BORDER, height: BOX_HEIGHT - BOX_BORDER * 2, depth: BOX_DEEPTH });
        const wallRight = BoxBuilder.CreateBox("wall_right", { width: BOX_BORDER, height: BOX_HEIGHT - BOX_BORDER * 2, depth: BOX_DEEPTH });
        const wallTop = BoxBuilder.CreateBox("wall_top", { width: BOX_WIDTH, height: BOX_BORDER, depth: BOX_DEEPTH });
        const wallBottom = BoxBuilder.CreateBox("wall_bottom", { width: BOX_WIDTH, height: BOX_BORDER, depth: BOX_DEEPTH });
        const frontWall = BoxBuilder.CreateBox("front_wall", { width: BOX_WIDTH, height: BOX_HEIGHT, depth: BOX_DEEPTH });
        const backWall = BoxBuilder.CreateBox("back_wall", { width: BOX_WIDTH, height: BOX_HEIGHT, depth: BOX_DEEPTH });

        wallLeft.position.x = -BOX_WIDTH / 2 + BOX_BORDER / 2;
        wallRight.position.x = BOX_WIDTH / 2 - BOX_BORDER / 2;
        wallTop.position.y = BOX_HEIGHT / 2 - BOX_BORDER / 2;
        wallBottom.position.y = -BOX_HEIGHT / 2 + BOX_BORDER / 2;
        frontWall.position.z = -BOX_DEEPTH;
        backWall.position.z = BOX_DEEPTH;

        wallLeft.physicsImpostor = new PhysicsImpostor(wallLeft, PhysicsImpostor.BoxImpostor, { mass: 0, friction: BOX_FRICTION, restitution: BOX_RESTITUTION }, this.scene);
        wallRight.physicsImpostor = new PhysicsImpostor(wallRight, PhysicsImpostor.BoxImpostor, { mass: 0, friction: BOX_FRICTION, restitution: BOX_RESTITUTION }, this.scene);
        wallTop.physicsImpostor = new PhysicsImpostor(wallTop, PhysicsImpostor.BoxImpostor, { mass: 0, friction: BOX_FRICTION, restitution: BOX_RESTITUTION }, this.scene);
        wallBottom.physicsImpostor = new PhysicsImpostor(wallBottom, PhysicsImpostor.BoxImpostor, { mass: 0, friction: BOX_FRICTION, restitution: BOX_RESTITUTION }, this.scene);
        frontWall.physicsImpostor = new PhysicsImpostor(frontWall, PhysicsImpostor.BoxImpostor, { mass: 0, friction: BOX_FRICTION, restitution: BOX_RESTITUTION }, this.scene);
        backWall.physicsImpostor = new PhysicsImpostor(backWall, PhysicsImpostor.BoxImpostor, { mass: 0, friction: BOX_FRICTION, restitution: BOX_RESTITUTION }, this.scene);

        frontWall.visibility = 0.2;

        return { wallLeft, wallRight, wallTop, wallBottom, frontWall, backWall };
    }


    public createBustButton(name: string) {
        const button = Button.CreateImageOnlyButton(name, "assets/textures/button1.png");
        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        button.top = "100px";
        const diameter = "300px";
        button.width = diameter;
        button.height = diameter;
        button.thickness = 0;
        button.image.width = diameter;
        button.image.height = diameter;
        return button;
    }
    public makeTorusMaterials(count: number): StandardMaterial[] {
        let materials: StandardMaterial[] = [];
        let colors = [
            '#FF0000', '#33FF00', '#3366FF', '#993399', '#FF9900', '#00FFCC'
        ];
        for (let i = 0; i < count; i++) {
            let material = new StandardMaterial("torusMaterial" + i, this.scene);
            material.diffuseColor = Color3.FromHexString(colors[i]);
            materials.push(material);
        }
        return materials;
    }
    public makeTorus(): Mesh {
        let name = `torus_${this.torusCount}`;
        let torus = MeshBuilder.CreateTorus(name, {
            diameter: TORUS_DIAMETER,
            thickness: TORUS_THICKNESS,
            tessellation: TORUS_TESSELLATION
        }, this.scene);

        const width = Math.tan(Math.PI / TORUS_TESSELLATION) * TORUS_DIAMETER;
        let box_xp = MeshBuilder.CreateBox(`${name}_box_xp`, { size: 1, width: width, height: TORUS_THICKNESS, depth: TORUS_THICKNESS }, this.scene);
        let box_xn = MeshBuilder.CreateBox(`${name}_box_xn`, { size: 1, width: width, height: TORUS_THICKNESS, depth: TORUS_THICKNESS }, this.scene);
        let box_zp = MeshBuilder.CreateBox(`${name}_box_zp`, { size: 1, width: width, height: TORUS_THICKNESS, depth: TORUS_THICKNESS }, this.scene);
        let box_zn = MeshBuilder.CreateBox(`${name}_box_zn`, { size: 1, width: width, height: TORUS_THICKNESS, depth: TORUS_THICKNESS }, this.scene);
        let box_xpzp = MeshBuilder.CreateBox(`${name}_box_xpzp`, { size: 1, width: width, height: TORUS_THICKNESS, depth: TORUS_THICKNESS }, this.scene);
        let box_xnzp = MeshBuilder.CreateBox(`${name}_box_xnzp`, { size: 1, width: width, height: TORUS_THICKNESS, depth: TORUS_THICKNESS }, this.scene);
        let box_xpzn = MeshBuilder.CreateBox(`${name}_box_xpzn`, { size: 1, width: width, height: TORUS_THICKNESS, depth: TORUS_THICKNESS }, this.scene);
        let box_xnzn = MeshBuilder.CreateBox(`${name}_box_xnzn`, { size: 1, width: width, height: TORUS_THICKNESS, depth: TORUS_THICKNESS }, this.scene);
        torus.addChild(box_xp);
        torus.addChild(box_xn);
        torus.addChild(box_zp);
        torus.addChild(box_zn);
        torus.addChild(box_xpzp);
        torus.addChild(box_xnzp);
        torus.addChild(box_xpzn);//
        torus.addChild(box_xnzn);//
        const subOffset = width * Math.cos(Math.PI / 4);
        box_xp.position.x = width / 2 + TORUS_THICKNESS;
        box_xp.rotation.y = Math.PI / 2;
        box_xn.position.x = - width / 2 - TORUS_THICKNESS;
        box_xn.rotation.y = Math.PI / 2;
        box_zp.position.z = width / 2 + TORUS_THICKNESS;
        box_zn.position.z = -width / 2 - TORUS_THICKNESS;
        box_xpzp.position.x = subOffset;
        box_xpzp.position.z = subOffset;
        box_xnzp.position.x = -subOffset;
        box_xnzp.position.z = subOffset;
        box_xpzn.position.x = subOffset;
        box_xpzn.position.z = -subOffset;
        box_xnzn.position.x = -subOffset;
        box_xnzn.position.z = -subOffset;
        box_xpzp.rotation.y = Math.PI / 4;
        box_xnzp.rotation.y = Math.PI / 4 + Math.PI / 2;
        box_xpzn.rotation.y = - Math.PI / 4;
        box_xnzn.rotation.y = - Math.PI / 4 - Math.PI / 2;

        torus.getChildMeshes().forEach((m) => {
            m.isVisible = false;
            m.scaling.x = Math.abs(m.scaling.x)
            m.scaling.y = Math.abs(m.scaling.y)
            m.scaling.z = Math.abs(m.scaling.z)
            m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0 }, this.scene);
        });

        let hitter = MeshBuilder.CreateCylinder(`${name}_hitter`, { diameter: TORUS_DIAMETER, height: TORUS_THICKNESS }, this.scene);
        // hitter.physicsImpostor = new PhysicsImpostor(hitter, PhysicsImpostor.NoImpostor, { mass: 0 }, this.scene);
        hitter.isVisible = false;
        torus.addChild(hitter);

        torus.physicsImpostor = new PhysicsImpostor(torus, PhysicsImpostor.NoImpostor, {
            mass: TORUS_MASS,
            friction: TORUS_FRICTION,
            restitution: TORUS_RESTITUTION
        }, this.scene);
        torus.isPickable = true;
        this.torusCount++;

        return torus;
    }
}