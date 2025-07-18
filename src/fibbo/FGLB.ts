import { FModel, type FModelOptions } from "@fibbojs/3d";
import type { AnimationClip } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class FGLB extends FModel {
	__ANIMATIONS__: AnimationClip[];

	constructor(options: FModelOptions) {
		super({
			fileExtension: "glb",
			...options,
		});
		// Create GLTF Loader
		const loader = new GLTFLoader();
		// Load the glTF resource
		loader.load(
			this.path,
			// Called when the resource is loaded
			(gltf) => {
				console.log(gltf);
				// Get the mesh from the glTF scene
				this.__MESH__ = gltf.scene;
				// Get the animations from the glTF
				this.__ANIMATIONS__ = gltf.animations || [];

				// Define mesh transforms
				this.defineMeshTransforms();

				// Call the onLoaded Callbacks
				this.emitOnLoaded();
			},
			// Called while loading is progressing
			(_xhr) => {},
			// Called when loading has errors
			(error) => {
				console.log(`An error happened while loading the model : ${this.path}`);
				console.log(error);
			},
		);
	}
}
