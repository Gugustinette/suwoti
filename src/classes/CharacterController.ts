import * as RAPIER from "@dimforge/rapier3d";
import { FCharacterControllerKP } from "@fibbojs/3d";
import * as THREE from "three";

export class CharacterController extends FCharacterControllerKP {
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
