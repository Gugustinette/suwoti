import type { FScene } from "@fibbojs/3d";
import * as THREE from "three";
import { HexGrid } from "../../util/HexGrid";
import { PerlinNoiseGenerator } from "../../util/PerlinNoiseGenerator";
import HexGrassBottom from "./HexGrassBottom";
import HexGrassUnder from "./HexGrassUnder";
import { WaterArea } from "./WaterArea";

const GRID_SIZE = 10;
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

		// Create base terrain noise (flatter)
		const baseNoiseGen = new PerlinNoiseGenerator(GRID_SIZE, GRID_SIZE, {
			frequency: 0.05, // Even larger features
			octaves: 6, // Fewer detail layers for smoother terrain
			persistence: 0.5, // Much lower persistence for less variation
			lacunarity: 2.0,
			seed: 17042002,
			constraintBlendRadius: 8,
		});

		// Create spike noise (for high peaks)
		const spikeNoiseGen = new PerlinNoiseGenerator(GRID_SIZE, GRID_SIZE, {
			frequency: 0.08, // Higher frequency for more localized spikes
			octaves: 2, // Simple noise for spikes
			persistence: 0.8,
			lacunarity: 2.0,
			seed: 20032002, // Different seed for variety
			constraintBlendRadius: 3,
		});

		// Apply island edge constraints to base terrain
		const ISLAND_EDGE_CONSTRAINT_INFLUENCE = 0.4;
		for (let i = 0; i <= GRID_SIZE; i++) {
			baseNoiseGen.setConstraint(0, i, 0.0, ISLAND_EDGE_CONSTRAINT_INFLUENCE);
			baseNoiseGen.setConstraint(i, 0, 0.0, ISLAND_EDGE_CONSTRAINT_INFLUENCE);
			baseNoiseGen.setConstraint(
				GRID_SIZE - 1,
				i,
				0.0,
				ISLAND_EDGE_CONSTRAINT_INFLUENCE,
			);
			baseNoiseGen.setConstraint(
				i,
				GRID_SIZE - 1,
				0.0,
				ISLAND_EDGE_CONSTRAINT_INFLUENCE,
			);
		}

		// Create a valley in the center for base terrain
		const VALLEY_RADIUS = 5;
		for (let q = 0; q < GRID_SIZE; q++) {
			for (let r = 0; r < GRID_SIZE; r++) {
				const distance = Math.sqrt(
					(q - GRID_SIZE / 2) ** 2 + (r - GRID_SIZE / 2) ** 2,
				);
				if (distance < VALLEY_RADIUS) {
					baseNoiseGen.setConstraint(
						q,
						r,
						0.6,
						ISLAND_EDGE_CONSTRAINT_INFLUENCE,
					);
				}
			}
		}

		// Generate both noise grids
		const baseNoiseGrid = baseNoiseGen.generate();
		const spikeNoiseGrid = spikeNoiseGen.generate();

		// Calculate the dimensions needed for rendering
		const hexWidth = HEX_RADIUS * 2;
		const hexHeight = Math.sqrt(3) * HEX_RADIUS;

		// Populate the grid with combined terrain
		for (let q = 0; q < GRID_SIZE; q++) {
			for (let r = 0; r < GRID_SIZE; r++) {
				// Get base height (flatter terrain)
				let height = baseNoiseGrid[q][r] * 30; // Reduced multiplier for flatter base

				// Add spikes based on threshold
				const spikeValue = spikeNoiseGrid[q][r];
				const SPIKE_THRESHOLD = 0.6; // Only values above this create spikes
				const SPIKE_INTENSITY = 200; // How tall the spikes can be

				if (spikeValue > SPIKE_THRESHOLD) {
					// Create exponential spike growth for dramatic peaks
					const spikeMultiplier = Math.pow(
						(spikeValue - SPIKE_THRESHOLD) / (1 - SPIKE_THRESHOLD),
						2,
					);
					height += spikeMultiplier * SPIKE_INTENSITY;
				}
				height += 20; // Add a base height to ensure visibility

				// Proper hexagonal grid positioning
				const x = hexWidth * (q + (r % 2) * 0.5) - hexWidth * (GRID_SIZE / 2);
				const z = hexHeight * r - hexHeight * (GRID_SIZE / 2);

				const hex = new HexGrassBottom({
					position: { x, y: height, z },
				});
				this.grid.set({ q, r }, hex);

				// Create a HexGrassUnder that will be placed under the HexGrassBottom
				new HexGrassUnder({
					position: { x, y: height - 6, z },
				});
			}
		}
	}
}
