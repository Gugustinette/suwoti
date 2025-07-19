import {
	FAmbientLight,
	FComponentEmpty,
	FDirectionalLight,
	FGameCamera,
	FScene,
} from "@fibbojs/3d";
import { fDebug } from "@fibbojs/devtools";
import { FKeyboard } from "@fibbojs/event";
import "./style.css";
import Character from "./classes/Character";
import { Island } from "./classes/island/Island";

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
		position: { x: 485, y: 100, z: 280 },
		color: 0xffffff,
		intensity: 5,
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

	// Create the island
	new Island();

	// Create a character
	const character = new Character();

	// Attach a camera to the character
	const camera = new FGameCamera({ target: character });
	camera.controls.maxDistance = 1000;
	scene.camera = camera;

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
