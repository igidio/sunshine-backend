export class BcryptHelper {
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
}