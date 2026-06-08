export class Hasher {
	static async hash_password(password: string) {
		const saltRounds = 10;

		return await Bun.password.hash(password, {
			algorithm: "bcrypt",
			cost: saltRounds
		})
	}

	static async match_password(password: string, hash: string) {
		return Bun.password.verify(password, hash);
	}

	static hash_token(value: string): string {
		return Bun.SHA256.hash(value, "hex");
	}

	static verify_token(value: string, hash: string): boolean {
		const valueHash = this.hash_token(value);
		return valueHash === hash;
	}
}