import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js"; // Make sure this path is correct for your setup

export class WaterArea {
	private water: Water;
	private scene: THREE.Scene;

	/**
	 * Creates a WaterArea instance.
	 * @param scene The THREE.js scene to add the water to.
	 * @param size The size (width and depth) of the water area.
	 * @param position The position of the center of the water area.
	 * @param sunDirection An optional THREE.Vector3 representing the direction of the sun for reflections.
	 */
	constructor(
		scene: THREE.Scene,
		size: number,
		position: { x: number; y: number; z: number },
		sunDirection: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
	) {
		this.scene = scene;

		const waterGeometry = new THREE.PlaneGeometry(size, size);

		this.water = new Water(waterGeometry, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load(
				"https://threejs.org/examples/textures/waternormals.jpg",
				(texture) => {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				},
			),
			alpha: 0.8,
			sunDirection: sunDirection.normalize(),
			sunColor: 0x4444dd,
			waterColor: 0x0000ff,
			distortionScale: 3.7,
			fog: false,
		});

		this.water.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
		this.water.position.copy(position);

		this.scene.add(this.water);
	}

	/**
	 * Returns the THREE.Water object.
	 * @returns The THREE.Water object.
	 */
	getWaterObject(): Water {
		return this.water;
	}

	/**
	 * Updates the water's animation. This should be called in your animation loop.
	 */
	update(): void {
		this.water.material.uniforms.time.value += 1.0 / 60.0; // Assuming 60 FPS
	}
}
