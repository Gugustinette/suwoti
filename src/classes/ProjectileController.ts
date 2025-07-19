import { FController } from "@fibbojs/3d";
import * as THREE from "three";

export class ProjectileController extends FController {
	private acceleration = 200; // Acceleration factor
	private currentSpeed = 0.000001; // Start with very slow speed
	private maxSpeed = 50; // Maximum speed limit

	frame(delta: number): void {
		const radian = this.component.transform.rotation;
		// Calculate movement vector so the projectile moves forward
		const direction = new THREE.Vector3(0, 1, 0)
			.applyEuler(new THREE.Euler(radian.x, radian.y, radian.z))
			.normalize();

		// Increase speed over time with acceleration
		this.currentSpeed = Math.min(
			this.currentSpeed + this.acceleration * delta,
			this.maxSpeed,
		);

		const movement = direction.multiplyScalar(this.currentSpeed * delta);
		// Update the position of the projectile
		this.component.transform.position.x += movement.x;
		this.component.transform.position.y += movement.y;
		this.component.transform.position.z += movement.z;
	}
}
