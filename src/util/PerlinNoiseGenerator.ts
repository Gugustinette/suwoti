interface NoiseConstraint {
	x: number;
	y: number;
	value: number;
	influence: number; // How far this constraint affects surrounding areas (0-1)
}

interface NoiseOptions {
	frequency: number; // Controls the "zoom" level of noise (default: 0.1)
	octaves: number; // Number of noise layers to combine (default: 4)
	persistence: number; // How much each octave contributes (default: 0.5)
	lacunarity: number; // Frequency multiplier between octaves (default: 2.0)
	seed: number; // Random seed for reproducible results
	constraintBlendRadius: number; // How smoothly constraints blend (default: 5)
}

class PerlinNoiseGenerator {
	private width: number;
	private height: number;
	private constraints: NoiseConstraint[] = [];
	private options: Required<NoiseOptions>;
	private permutation: number[] = [];

	constructor(
		width: number,
		height: number,
		options: Partial<NoiseOptions> = {},
	) {
		this.width = width;
		this.height = height;
		this.options = {
			frequency: 0.1,
			octaves: 4,
			persistence: 0.5,
			lacunarity: 2.0,
			seed: Math.random() * 1000,
			constraintBlendRadius: 5,
			...options,
		};

		this.initializePermutation();
	}

	private initializePermutation(): void {
		// Create permutation table for Perlin noise
		const p = Array.from({ length: 256 }, (_, i) => i);

		// Shuffle using seed
		const random = this.seededRandom(this.options.seed);
		for (let i = p.length - 1; i > 0; i--) {
			const j = Math.floor(random() * (i + 1));
			[p[i], p[j]] = [p[j], p[i]];
		}

		// Duplicate the permutation table
		this.permutation = [...p, ...p];
	}

	private seededRandom(seed: number): () => number {
		let x = Math.sin(seed) * 10000;
		return () => {
			x = Math.sin(x) * 10000;
			return x - Math.floor(x);
		};
	}

	/**
	 * Set a constraint at specific coordinates
	 */
	setConstraint(
		x: number,
		y: number,
		value: number,
		influence: number = 1.0,
	): void {
		// Clamp values
		x = Math.max(0, Math.min(this.width - 1, Math.round(x)));
		y = Math.max(0, Math.min(this.height - 1, Math.round(y)));
		value = Math.max(0, Math.min(1, value));
		influence = Math.max(0, Math.min(1, influence));

		// Remove existing constraint at same position
		this.constraints = this.constraints.filter(
			(c) => !(c.x === x && c.y === y),
		);

		this.constraints.push({ x, y, value, influence });
	}

	/**
	 * Remove constraint at specific coordinates
	 */
	removeConstraint(x: number, y: number): void {
		this.constraints = this.constraints.filter(
			(c) => !(c.x === x && c.y === y),
		);
	}

	/**
	 * Clear all constraints
	 */
	clearConstraints(): void {
		this.constraints = [];
	}

	/**
	 * Generate the noise grid
	 */
	generate(): number[][] {
		const grid: number[][] = Array(this.height)
			.fill(null)
			.map(() => Array(this.width).fill(0));

		// Generate base Perlin noise
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				grid[y][x] = this.generateNoiseAt(x, y);
			}
		}

		// Apply constraints
		if (this.constraints.length > 0) {
			this.applyConstraints(grid);
		}

		return grid;
	}

	private generateNoiseAt(x: number, y: number): number {
		let value = 0;
		let amplitude = 1;
		let frequency = this.options.frequency;
		let maxValue = 0;

		for (let i = 0; i < this.options.octaves; i++) {
			value += this.perlinNoise(x * frequency, y * frequency) * amplitude;
			maxValue += amplitude;
			amplitude *= this.options.persistence;
			frequency *= this.options.lacunarity;
		}

		// Normalize to 0-1 range
		return (value / maxValue + 1) * 0.5;
	}

	private perlinNoise(x: number, y: number): number {
		// Grid coordinates
		const X = Math.floor(x) & 255;
		const Y = Math.floor(y) & 255;

		// Relative coordinates within grid cell
		const xf = x - Math.floor(x);
		const yf = y - Math.floor(y);

		// Fade curves
		const u = this.fade(xf);
		const v = this.fade(yf);

		// Gradient vectors at corners
		const aa = this.grad(this.permutation[X + this.permutation[Y]], xf, yf);
		const ab = this.grad(
			this.permutation[X + this.permutation[Y + 1]],
			xf,
			yf - 1,
		);
		const ba = this.grad(
			this.permutation[X + 1 + this.permutation[Y]],
			xf - 1,
			yf,
		);
		const bb = this.grad(
			this.permutation[X + 1 + this.permutation[Y + 1]],
			xf - 1,
			yf - 1,
		);

		// Interpolate
		const x1 = this.lerp(aa, ba, u);
		const x2 = this.lerp(ab, bb, u);

		return this.lerp(x1, x2, v);
	}

	private fade(t: number): number {
		// Fade function: 6t^5 - 15t^4 + 10t^3
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	private lerp(a: number, b: number, t: number): number {
		return a + t * (b - a);
	}

	private grad(hash: number, x: number, y: number): number {
		// Convert hash to gradient vector
		const h = hash & 3;
		const u = h < 2 ? x : y;
		const v = h < 2 ? y : x;
		return (h & 1 ? -u : u) + (h & 2 ? -2 * v : 2 * v);
	}

	private applyConstraints(grid: number[][]): void {
		const constraintMap = this.createConstraintInfluenceMap();

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const influence = constraintMap[y][x];
				if (influence.weight > 0) {
					// Blend between original noise and constraint value
					grid[y][x] = this.lerp(grid[y][x], influence.value, influence.weight);
				}
			}
		}
	}

	private createConstraintInfluenceMap(): {
		value: number;
		weight: number;
	}[][] {
		const influenceMap = Array(this.height)
			.fill(null)
			.map(() =>
				Array(this.width)
					.fill(null)
					.map(() => ({ value: 0, weight: 0 })),
			);

		for (const constraint of this.constraints) {
			const radius = this.options.constraintBlendRadius * constraint.influence;

			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					const distance = Math.sqrt(
						Math.pow(x - constraint.x, 2) + Math.pow(y - constraint.y, 2),
					);

					if (distance <= radius) {
						// Calculate influence weight (1 at center, 0 at radius)
						const weight =
							Math.max(0, 1 - distance / radius) * constraint.influence;

						// Smooth falloff
						const smoothWeight = this.smoothstep(0, 1, weight);

						// Blend with existing influences
						const currentWeight = influenceMap[y][x].weight;
						const combinedWeight = Math.min(1, currentWeight + smoothWeight);

						if (smoothWeight > currentWeight) {
							// This constraint has more influence
							influenceMap[y][x] = {
								value: constraint.value,
								weight: combinedWeight,
							};
						} else if (smoothWeight > 0) {
							// Blend values
							const blendFactor = smoothWeight / combinedWeight;
							influenceMap[y][x].value = this.lerp(
								influenceMap[y][x].value,
								constraint.value,
								blendFactor,
							);
							influenceMap[y][x].weight = combinedWeight;
						}
					}
				}
			}
		}

		return influenceMap;
	}

	private smoothstep(edge0: number, edge1: number, x: number): number {
		const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
		return t * t * (3 - 2 * t);
	}

	/**
	 * Update noise options and regenerate permutation if seed changed
	 */
	updateOptions(newOptions: Partial<NoiseOptions>): void {
		const oldSeed = this.options.seed;
		this.options = { ...this.options, ...newOptions };

		if (this.options.seed !== oldSeed) {
			this.initializePermutation();
		}
	}

	/**
	 * Get current options
	 */
	getOptions(): Required<NoiseOptions> {
		return { ...this.options };
	}

	/**
	 * Get current constraints
	 */
	getConstraints(): NoiseConstraint[] {
		return [...this.constraints];
	}
}

export { PerlinNoiseGenerator, type NoiseOptions, type NoiseConstraint };
