import type { FRigidBodyOptions } from "@fibbojs/3d";
import { FCachedGLB } from "../../fibbo/FCachedGLB";

interface HexGrassBottomOptions {
	position?: { x: number; y: number; z: number };
}

export default class HexGrassBottom extends FCachedGLB {
	constructor(options?: HexGrassBottomOptions) {
		super({
			name: "hex_grass_bottom",
			path: "/assets/hex_grass_bottom/hex_grass_bottom.gltf",
			position: { x: 0, y: 1, z: 0 },
			scale: { x: 12, y: 12, z: 12 },
			textures: {
				default: "/assets/hex_grass_bottom/hexagons_medieval.png",
			},
			...options,
		});

		this.initCollider();
	}

	initCollider(options?: FRigidBodyOptions) {
		super.initCollider({
			positionOffset: { x: 0, y: -3, z: 0 },
			scaleOffset: { x: 0, y: -6, z: 0 },
			...options,
		});
	}

	initSensor(options?: FRigidBodyOptions) {
		super.initSensor({
			...options,
			positionOffset: { x: 0, y: -3, z: 0 },
			scaleOffset: { x: 0, y: -6, z: 0 },
		});
	}
}
