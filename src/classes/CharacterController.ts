import * as RAPIER from "@dimforge/rapier3d";
import {
	FCharacterControllerKP,
	type FCharacterControllerOptions,
} from "@fibbojs/3d";
import * as THREE from "three";
import Projectile from "./Projectile";

export class CharacterController extends FCharacterControllerKP {
	constructor(options: FCharacterControllerOptions) {
		super(options);

		window.addEventListener("mousedown", () => {
			// Check if the character is ready
			if (this.component.__MESH__ === undefined) {
				console.error("Character model not loaded correctly.");
				return;
			}

			const actualPosition = this.component.transform.position;
			const rotation = this.component.transform.rotation;

			const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
			const direction = new THREE.Vector3(0, 0, 1)
				.applyEuler(euler)
				.normalize();

			const positionProjectile = {
				x: actualPosition.x + direction.x * 3,
				y: actualPosition.y + 1,
				z: actualPosition.z + direction.z * 3,
			};

			const options = {
				position: positionProjectile,
				rotation: {
					x: Math.PI / 2,
					y: 0,
					z: rotation.z < Math.PI ? rotation.y * -1 : Math.PI + rotation.y,
				},
			};

			const projectile = new Projectile(options);

			setTimeout(() => {
				// Remove the projectile after 3 seconds
				projectile.scene.removeComponent(projectile);
			}, 500);
		});
	}
	getCorrectedRotation(): RAPIER.Quaternion {
		// Get the camera direction
		const cameraDirection = this.scene.camera.getCameraDirection();
		// Get the angle between the camera direction and the character direction
		let angle = Math.atan2(cameraDirection.x, cameraDirection.z);

		// Add rotation based on movement inputs
		if (this.inputs.forward) {
			// No additional rotation needed for forward movement
		} else if (this.inputs.backward) {
			angle += Math.PI;
		} else if (this.inputs.right) {
			angle -= Math.PI / 2;
		} else if (this.inputs.left) {
			angle += Math.PI / 2;
		}

		// Handle diagonal movement
		if (this.inputs.forward && this.inputs.right) {
			angle -= Math.PI / 4;
		} else if (this.inputs.forward && this.inputs.left) {
			angle += Math.PI / 4;
		} else if (this.inputs.backward && this.inputs.right) {
			angle += Math.PI / 4;
		} else if (this.inputs.backward && this.inputs.left) {
			angle -= Math.PI / 4;
		}

		// Create a THREE quaternion from the corrected rotation
		const quaternion = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(0, angle, 0),
		);
		// Return the corrected rotation as a RAPIER quaternion
		return new RAPIER.Quaternion(
			quaternion.x,
			quaternion.y,
			quaternion.z,
			quaternion.w,
		);
	}
}
