import { FGLTF, type FRigidBodyOptions } from "@fibbojs/3d";
import { ProjectileController } from "./ProjectileController";

interface ProjectileOptions {
	position?: { x: number; y: number; z: number };
	rotation?: { x: number; y: number; z: number };
}

export default class Projectile extends FGLTF {
	constructor(options: ProjectileOptions = {}) {
		super({
			name: "sword_1handed",
			path: "/assets/sword/sword_1handed.gltf",
			position: options.position,
			scale: { x: 2, y: 2, z: 2 },
			rotation: options.rotation,
			textures: {
				default: "/assets/sword/knight_texture.png",
			},
		});

		this.initSensor();

		this.addController(
			new ProjectileController({
				component: this,
			}),
		);
	}

	initSensor(options?: FRigidBodyOptions) {
		super.initSensor({
			...options,
			positionOffset: { x: 0, y: 0, z: 0.5 },
			scaleOffset: { x: -1.3, y: -0, z: -1.5 },
		});
	}
}
