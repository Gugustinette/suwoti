import { type GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface CachedGLTF {
	gltf: GLTF | null;
	loadingPromise: Promise<GLTF> | null; // Promise resolves with the full GLTF result
}

class AssetManager {
	private static instance: AssetManager;
	private cache: Map<string, CachedGLTF> = new Map();
	private gltfLoader = new GLTFLoader();
	// private textureLoader = new TextureLoader(); // Keep if you load additional textures not embedded in GLTF

	private constructor() {}

	public static getInstance(): AssetManager {
		if (!AssetManager.instance) {
			AssetManager.instance = new AssetManager();
		}
		return AssetManager.instance;
	}

	/**
	 * Loads a GLTF model and caches it. Returns a cloned scene and reference to animations.
	 * @param name A unique identifier for the asset (e.g., "hex_grass_bottom").
	 * @param path The URL path to the GLTF/GLB file.
	 * @returns A promise that resolves with the GLTF result (containing scene and animations).
	 */
	public async loadGLTF(name: string, path: string): Promise<GLTF> {
		if (!this.cache.has(name)) {
			this.cache.set(name, { gltf: null, loadingPromise: null });
		}

		// biome-ignore lint/style/noNonNullAssertion: We ensure the cache entry exists above.
		const cached = this.cache.get(name)!;

		if (cached.gltf) {
			// Asset is already loaded and cached, return it directly.
			return cached.gltf;
		}

		if (cached.loadingPromise) {
			// Asset is currently loading, wait for it to complete.
			return cached.loadingPromise;
		}

		// Asset not in cache and not loading, so start loading it.
		const loadPromise = this.gltfLoader.loadAsync(path);
		cached.loadingPromise = loadPromise;

		try {
			const gltfResult = await loadPromise;
			cached.gltf = gltfResult; // Cache the loaded GLTF result
			return gltfResult;
		} catch (error) {
			console.error(`Error loading GLTF asset ${name} from ${path}:`, error);
			this.cache.delete(name); // Remove failed load from cache
			throw error; // Re-throw to propagate the error
		} finally {
			cached.loadingPromise = null; // Clear the loading promise
		}
	}

	/**
	 * Gets a cached GLTF model. Returns null if not cached or not fully loaded.
	 * @param name The unique identifier for the asset.
	 */
	public getCachedGLTF(name: string): GLTF | null {
		return this.cache.get(name)?.gltf || null;
	}
}

export const assetManager = AssetManager.getInstance();
