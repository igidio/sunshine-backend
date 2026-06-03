import { join } from "path";

export const BILLS_DIR = join(process.cwd(), "storage/bills");

export const BILL_COMPANY_INFO = {
	name: "Salones SUNSHINE",
	address: "Avenida 123 Calle 456",
	phones: "77712345 - 77753321",
	email: "sunshine@mail.com",
} as const;

export const payment_method_labels: Record<string, string> = {
	cash: "Efectivo",
	card: "Tarjeta",
	transfer: "Transferencia",
};