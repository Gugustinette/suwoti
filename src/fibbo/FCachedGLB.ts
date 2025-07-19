import { FModel, type FModelOptions } from "@fibbojs/3d";
import type { AnimationClip } from "three";
import { assetManager } from "./AssetManager";

export class FCachedGLB extends FModel {
	__ANIMATIONS__: AnimationClip[];

	constructor(options: FModelOptions) {
		super({
			fileExtension: "glb",
			...options,
		});

		this.init();
	}

	private async init() {
		// Get the gltf from the asset manager
		const gltf = await assetManager.loadGLTF(this.name, this.path);

		// Clone the scene and animations
		this.__MESH__ = gltf.scene.clone();
		this.__ANIMATIONS__ = gltf.animations;

		// Define mesh transforms
		this.defineMeshTransforms();

		// Call the onLoaded Callbacks
		this.emitOnLoaded();
	}
}
