import type { FRigidBodyOptions } from "@fibbojs/3d";
import * as THREE from "three";
import { FCachedGLB } from "../../fibbo/FCachedGLB";

interface HexGrassUnderOptions {
	position?: { x: number; y: number; z: number };
}

export default class HexGrassUnder extends FCachedGLB {
	constructor(options?: HexGrassUnderOptions) {
		super({
			name: "hex_grass_under",
			path: "/assets/hex_grass_under/hex_grass_bottom.gltf",
			position: { x: 0, y: 1, z: 0 },
			scale: { x: 12, y: 100, z: 12 },
			textures: {
				default: "/assets/hex_grass_under/hexagons_medieval.png",
			},
			...options,
		});

		this.onLoaded(() => {
			this.__MESH__?.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					const color = child.material.color;
					color.r = 159 / 255;
					color.g = 86 / 255;
					color.b = 65 / 255;
					child.material.color = color;
				}
			});
		});

		this.initCollider();
	}

	initCollider(options?: FRigidBodyOptions) {
		super.initCollider({
			positionOffset: { x: 0, y: -25, z: 0 },
			scaleOffset: { x: 0, y: -50, z: 0 },
			...options,
		});
	}

	initSensor(options?: FRigidBodyOptions) {
		super.initSensor({
			...options,
			positionOffset: { x: 0, y: -25, z: 0 },
			scaleOffset: { x: 0, y: -50, z: 0 },
		});
	}
}
