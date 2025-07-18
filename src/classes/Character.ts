import type { FRigidBodyOptions } from "@fibbojs/3d";
import { AnimationClip, AnimationMixer } from "three";
import { FGLB } from "../fibbo/FGLB";
import { CharacterController } from "./CharacterController";

export default class Mage extends FGLB {
	constructor() {
		super({
			name: "mage",
			path: "/assets/mage/Mage.glb",
			position: { x: 0, y: 10, z: 0 },
			scale: { x: 2, y: 2, z: 2 },
			textures: {
				default: "/assets/mage/mage_texture.png",
			},
		});

		// Initialize the character controller
		const movementController = new CharacterController({
			component: this,
		});
		this.addController(movementController);

		this.onLoaded(() => {
			// Verify if the mesh is loaded
			if (this.__MESH__ === undefined) {
				console.error("Mage model not loaded correctly.");
				return;
			}
			/**
			 * Mesh setup
			 */
			// Hide the book mesh
			const bookMesh = this.__MESH__.getObjectByName("Spellbook");
			if (bookMesh) {
				bookMesh.visible = false;
			}
			const bookOpenMesh = this.__MESH__.getObjectByName("Spellbook_open");
			if (bookOpenMesh) {
				bookOpenMesh.visible = false;
			}

			/**
			 * Animation setup
			 */
			// Create an animation mixer for the character
			const mixer = new AnimationMixer(this.__MESH__);
			// Load the Idle animation
			const idleClip = AnimationClip.findByName(this.__ANIMATIONS__, "Idle");
			const idleAction = mixer.clipAction(idleClip);
			// Load the Running_A animation
			const runningClip = AnimationClip.findByName(
				this.__ANIMATIONS__,
				"Running_A",
			);
			const runningAction = mixer.clipAction(runningClip);
			// Start with the idle animation
			idleAction.play();
			this.scene.onFrame((delta) => {
				mixer.update(delta);
				// Switch between idle and walking animations based on the controller state
				if (
					movementController.inputs.forward ||
					movementController.inputs.backward ||
					movementController.inputs.left ||
					movementController.inputs.right
				) {
					if (!runningAction.isRunning()) {
						runningAction.play();
						idleAction.stop();
					}
				} else {
					if (!idleAction.isRunning()) {
						idleAction.play();
						runningAction.stop();
					}
				}
			});
		});
	}

	initRigidBody(options?: FRigidBodyOptions) {
		super.initRigidBody({
			positionOffset: { x: 0, y: 1.3, z: 0 },
			scaleOffset: { x: -1, y: -0.5, z: -1.5 },
			...options,
		});
	}

	initSensor(options?: FRigidBodyOptions) {
		super.initSensor({
			...options,
			positionOffset: { x: 0, y: 1.3, z: 0 },
			scaleOffset: { x: -1, y: -0.5, z: -1.5 },
		});
	}
}
