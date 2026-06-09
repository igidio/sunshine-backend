type CacheEntry<T> = { value: T; expires: number };

export const create_cache = <T>(ttl_ms: number, sweep_interval_ms = 60_000) => {
	const store = new Map<string, CacheEntry<T>>();

	const get = (key: string): T | null => {
		const entry = store.get(key);
		if (!entry) return null;
		if (entry.expires < Date.now()) {
			store.delete(key);
			return null;
		}
		return entry.value;
	};

	const set = (key: string, value: T): void => {
		store.set(key, { value, expires: Date.now() + ttl_ms });
	};

	const del = (key: string): void => {
		store.delete(key);
	};

	const sweep = (): void => {
		const now = Date.now();
		for (const [key, entry] of store) {
			if (entry.expires < now) store.delete(key);
		}
	};

	const interval = setInterval(sweep, sweep_interval_ms);

	const destroy = (): void => clearInterval(interval);

	return { get, set, del, sweep, destroy };
};