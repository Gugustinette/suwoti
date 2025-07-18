import {
	FAmbientLight,
	FComponentEmpty,
	FCuboid,
	FDirectionalLight,
	FGameCamera,
	FRigidBodyType,
	FScene,
} from "@fibbojs/3d";
import { fDebug } from "@fibbojs/devtools";
import { FKeyboard } from "@fibbojs/event";
import "./style.css";
import Character from "./classes/Character";

(async () => {
	// Initialize the scene
	const scene = new FScene({
		shadows: true,
	});
	scene.init();
	await scene.initPhysics();
	// Debug the scene
	// @ts-ignore
	if (import.meta.env.DEV) fDebug(scene);

	// Add directional light to represent the sun
	new FDirectionalLight({
		position: { x: 20, y: 20, z: 0 },
		color: 0xffffff,
		intensity: 3,
		shadowQuality: 12,
	});
	// Add ambient light
	new FAmbientLight({
		color: 0x404040,
		intensity: 20,
	});

	// Create a death zone
	const deathZone = new FComponentEmpty({
		position: { x: 0, y: -20, z: 0 },
		scale: { x: 100, y: 1, z: 100 },
	});
	deathZone.initCollider();

	// Create a ground
	const ground = new FCuboid({
		position: { x: 0, y: -0.1, z: 0 },
		scale: { x: 15, y: 0.1, z: 15 },
		color: 0x348c31,
	});
	ground.initRigidBody({
		rigidBodyType: FRigidBodyType.FIXED,
	});

	// Create a character
	const character = new Character();

	// Attach a camera to the character
	scene.camera = new FGameCamera({ target: character });

	// Add collision events
	character.onCollisionWith(deathZone, () => {
		console.log("Character fell into the death zone!");
		character.transform.position = { x: 0, y: 10, z: 0 };
	});

	// Create keyboard
	const keyboard = new FKeyboard();
	keyboard.onKeyDown("p", () => {
		character.transform.position = { x: 0, y: 5, z: 0 };
	});
})();
