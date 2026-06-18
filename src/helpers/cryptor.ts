import { envs } from "~/config/envs";
import crypto from "node:crypto";

const ALGORITHM = "aes-256-cbc";

const derive_key = (passphrase: string): Buffer => {
	return crypto.createHash("sha256").update(passphrase).digest();
};

export class Cryptor {
	static encrypt({
		message,
		is_alphanumeric = false,
		use_client_key = false,
	}: {
		message: string;
		is_alphanumeric: boolean;
		use_client_key?: boolean;
	}) {
		const key = derive_key(use_client_key ? envs.client_encryption_key : envs.server_encryption_key);
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

		let encrypted = cipher.update(message, "utf8", "base64");
		encrypted += cipher.final("base64");

		const combined = `${iv.toString("base64")}:${encrypted}`;

		if (is_alphanumeric) {
			const base64Data = Buffer.from(combined, "utf8").toString("base64");
			return base64Data.replace(/[+/=]/g, "");
		}

		return combined;
	}

	static decrypt({
		encrypted_message,
		is_alphanumeric = false,
		use_client_key = false,
	}: {
		encrypted_message: string;
		is_alphanumeric: boolean;
		use_client_key?: boolean;
	}) {
		const key = derive_key(use_client_key ? envs.client_encryption_key : envs.server_encryption_key);

		let combined = encrypted_message;

		if (is_alphanumeric) {
			const padLength = encrypted_message.length % 4 ? 4 - (encrypted_message.length % 4) : 0;
			const base64Data = encrypted_message + "=".repeat(padLength);
			combined = Buffer.from(base64Data, "base64").toString("utf8");
		}

		const separatorIndex = combined.indexOf(":");
		const iv = Buffer.from(combined.slice(0, separatorIndex), "base64");
		const encrypted = combined.slice(separatorIndex + 1);

		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		let decrypted = decipher.update(encrypted, "base64", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	}
}
