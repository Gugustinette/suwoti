/**
 * Represents the coordinates of a hexagonal cell using axial coordinates.
 */
interface HexAxialCoord {
	q: number; // The 'q' axial coordinate
	r: number; // The 'r' axial coordinate
}

/**
 * A minimal generic class to manipulate an hexagonal grid.
 * The grid uses axial coordinates and has a fixed size.
 * Type parameter T represents the type of data stored in each cell.
 * @example
 * ```ts
 * const hexGrid = new HexGrid<string>(100, 100);
 * hexGrid.set({ q: 0, r: 0 }, "Hello");
 * const value = hexGrid.get({ q: 0, r: 0 }); // "Hello"
 * ```
 */
export class HexGrid<T> {
	private readonly width: number;
	private readonly height: number;
	private grid: Map<string, T>; // Using a Map for sparse grid and easy key-value storage

	/**
	 * Initializes a new HexGrid.
	 * @param width The width of the grid (number of 'q' coordinates).
	 * @param height The height of the grid (number of 'r' coordinates).
	 */
	constructor(width: number, height: number) {
		if (width <= 0 || height <= 0) {
			throw new Error("Grid dimensions must be positive.");
		}
		this.width = width;
		this.height = height;
		this.grid = new Map<string, T>();
	}

	/**
	 * Generates a unique string key for a given hexagonal coordinate.
	 * @param coord The hexagonal axial coordinate.
	 * @returns A string key representing the coordinate.
	 */
	private static getKey(coord: HexAxialCoord): string {
		return `${coord.q},${coord.r}`;
	}

	/**
	 * Checks if the given axial coordinates are within the grid bounds.
	 * For a 100x100 grid, assumes q from 0 to 99 and r from 0 to 99.
	 * @param coord The hexagonal axial coordinate.
	 * @returns True if the coordinate is within bounds, false otherwise.
	 */
	public isInBounds(coord: HexAxialCoord): boolean {
		return (
			coord.q >= 0 &&
			coord.q < this.width &&
			coord.r >= 0 &&
			coord.r < this.height
		);
	}

	/**
	 * Sets the value of a cell at the given coordinates.
	 * If the coordinates are out of bounds, a warning is logged and the operation fails.
	 * @param coord The hexagonal axial coordinate.
	 * @param value The value to set.
	 * @returns True if the value was set successfully, false otherwise (e.g., out of bounds).
	 */
	public set(coord: HexAxialCoord, value: T): boolean {
		if (!this.isInBounds(coord)) {
			console.warn(
				`Attempted to set value out of bounds: q=${coord.q}, r=${coord.r}. Operation skipped.`,
			);
			return false;
		}
		this.grid.set(HexGrid.getKey(coord), value);
		return true;
	}

	/**
	 * Gets the value of a cell at the given coordinates.
	 * Returns undefined if the coordinates are out of bounds or the cell is empty.
	 * @param coord The hexagonal axial coordinate.
	 * @returns The value of the cell, or undefined if not found or out of bounds.
	 */
	public get(coord: HexAxialCoord): T | undefined {
		if (!this.isInBounds(coord)) {
			return undefined;
		}
		return this.grid.get(HexGrid.getKey(coord));
	}
}
