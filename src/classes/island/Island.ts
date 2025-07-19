import type { FScene } from "@fibbojs/3d";
import * as THREE from "three";
import { HexGrid } from "../../util/HexGrid";
import { PerlinNoiseGenerator } from "../../util/PerlinNoiseGenerator";
import HexGrassBottom from "./HexGrassBottom";
import HexGrassUnder from "./HexGrassUnder";
import { WaterArea } from "./WaterArea";

const GRID_SIZE = 50;
// const GRID_SIZE = 10;
const HEX_RADIUS = 6;

export class Island {
	grid: HexGrid<HexGrassBottom>;

	constructor() {
		// Get Fibbo scene
		const fibboScene: FScene = globalThis.__FIBBO_ACTUAL_SCENE__;
		// Make scene background light blue
		fibboScene.scene.background = new THREE.Color(0x87ceeb);
		// Create water area
		new WaterArea(fibboScene.scene, 10000, { x: 480, y: 20, z: 280 });
		// Initialize the hexagonal grid
		this.grid = new HexGrid<HexGrassBottom>(GRID_SIZE, GRID_SIZE);

		// Create a noise generator for the vertical variation of the terrain
		const noiseGen = new PerlinNoiseGenerator(GRID_SIZE, GRID_SIZE, {
			frequency: 0.05, // Larger features
			octaves: 6, // More detail layers
			persistence: 0.6, // Each octave contributes more
			lacunarity: 2.0, // Standard frequency doubling
			seed: 17042002, // Reproducible results
			constraintBlendRadius: 8, // Smooth constraint blending
		});
		// Create an island shape by constraining the edges
		const ISLAND_EDGE_CONSTRAINT_INFLUENCE = 0.4;
		for (let i = 0; i <= GRID_SIZE; i++) {
			noiseGen.setConstraint(0, i, 0.0, ISLAND_EDGE_CONSTRAINT_INFLUENCE);
		}
		for (let i = 0; i <= GRID_SIZE; i++) {
			noiseGen.setConstraint(i, 0, 0.0, ISLAND_EDGE_CONSTRAINT_INFLUENCE);
		}
		for (let i = 0; i <= GRID_SIZE; i++) {
			noiseGen.setConstraint(
				GRID_SIZE - 1,
				i,
				0.0,
				ISLAND_EDGE_CONSTRAINT_INFLUENCE,
			);
		}
		for (let i = 0; i <= GRID_SIZE; i++) {
			noiseGen.setConstraint(
				i,
				GRID_SIZE - 1,
				0.0,
				ISLAND_EDGE_CONSTRAINT_INFLUENCE,
			);
		}
		// Create a valley in the center
		const VALLEY_RADIUS = 5;
		for (let q = 0; q < GRID_SIZE; q++) {
			for (let r = 0; r < GRID_SIZE; r++) {
				const distance = Math.sqrt(
					(q - GRID_SIZE / 2) ** 2 + (r - GRID_SIZE / 2) ** 2,
				);
				if (distance < VALLEY_RADIUS) {
					noiseGen.setConstraint(q, r, 0.6, ISLAND_EDGE_CONSTRAINT_INFLUENCE);
				}
			}
		}

		// Generate the noise grid
		const noiseGrid = noiseGen.generate();

		// Calculate the dimensions needed for rendering
		const hexWidth = HEX_RADIUS * 2;
		const hexHeight = Math.sqrt(3) * HEX_RADIUS;

		// Populate the grid with HexGrassBottom instances
		for (let q = 0; q < GRID_SIZE; q++) {
			for (let r = 0; r < GRID_SIZE; r++) {
				// Proper hexagonal grid positioning with alternating row offsets
				const x = hexWidth * (q + (r % 2) * 0.5) - hexWidth * (GRID_SIZE / 2);
				const z = hexHeight * r - hexHeight * (GRID_SIZE / 2);
				const hex = new HexGrassBottom({
					position: { x, y: noiseGrid[q][r] * 100, z },
				});
				this.grid.set({ q, r }, hex);

				// Create a HexGrassUnder that will be place under the HexGrassBottom
				new HexGrassUnder({
					position: { x, y: noiseGrid[q][r] * 100 - 6, z },
				});
			}
		}
	}
}
