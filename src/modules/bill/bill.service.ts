import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import jsPDF from "jspdf";
import { autoTable } from 'jspdf-autotable';
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import { BILLS_DIR, payment_method_labels } from "./bill.data";
import type { sale_select } from "../sale/sale.schema";
import { sale_service } from "../sale/sale.service";

type sale = Awaited<ReturnType<typeof sale_service.find_one>>;

export const bill_service = {
	generate: async (sale?: sale) => {
		if (!sale) throw new ServerError(error_messages.sale_not_found, 404);
		if (sale.bill) throw new ServerError(error_messages.bill_already_exists, 400);

		if (!existsSync(BILLS_DIR)) {
			mkdirSync(BILLS_DIR, { recursive: true });
		}

		const doc = new jsPDF();

		doc.setFontSize(18);
		doc.setFont("helvetica", "bold");
		doc.text("Salones SUNSHINE", 14, 20);
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		doc.text("Avenida 123 Calle 456", 14, 28);
		doc.text("77712345 - 77753321", 14, 34);
		doc.text("sunshine@mail.com", 14, 40);

		doc.setDrawColor(67, 158, 234);
		doc.setLineWidth(0.5);
		doc.line(14, 44, 196, 44);

		doc.setFontSize(16);
		doc.setFont("helvetica", "bold");
		doc.text("Factura de Venta", 14, 56);

		doc.setFontSize(11);
		doc.setFont("helvetica", "normal");
		doc.text(`Venta ID: ${sale.id}`, 14, 66);
		const date = sale.created_at
			? new Date(sale.created_at).toLocaleDateString("es-BO")
			: "N/A";
		doc.text(`Fecha: ${date}`, 14, 73);

		const customer_name = sale.customer?.profile
			? `${sale.customer.profile.first_name} ${sale.customer.profile.last_name}`
			: "N/A";
		doc.text(`Cliente: ${customer_name}`, 14, 80);
		doc.text(`M\u00e9todo de pago: ${payment_method_labels[sale.payment_method]}`, 14, 87);

		let current_Y = 95;

		if (sale.product_details && sale.product_details.length > 0) {
			doc.setFontSize(13);
			doc.setFont("helvetica", "bold");
			doc.text("Productos", 14, current_Y);
			current_Y += 8;

			const product_columns = ["ID", "Nombre", "Cantidad", "Precio Unit.", "Subtotal"];
			const product_rows = sale.product_details.map((pd) => [
				String(pd.product_id),
				(pd.product as any)?.name ?? "N/A",
				String(pd.quantity),
				`Bs. ${Number(pd.unit_price).toFixed(2)}`,
				`Bs. ${(pd.quantity * Number(pd.unit_price)).toFixed(2)}`,
			]);

			autoTable(doc, {
				startY: current_Y,
				head: [product_columns],
				body: product_rows,
				theme: "grid",
				headStyles: { fillColor: [67, 158, 234] },
				styles: { fontSize: 10, cellPadding: 3 },
			});

			current_Y = (doc as any).lastAutoTable.finalY + 10;
		}

		if (sale.appointment_details && sale.appointment_details.length > 0) {
			doc.setFontSize(13);
			doc.setFont("helvetica", "bold");
			doc.text("Servicios / Citas", 14, current_Y);
			current_Y += 8;

			const appointment_columns = ["ID", "Tratamiento", "Fecha", "Precio"];
			const appointment_rows = sale.appointment_details.map((ad) => {
				const treatment = (ad.appointment as any)?.treatment;
				const treatment_rows = treatment?.name ?? "N/A";
				const appointment_date = (ad.appointment as any)?.date ?? "N/A";
				return [
					String(ad.appointment_id),
					treatment_rows,
					appointment_date,
					`Bs. ${Number(ad.price).toFixed(2)}`,
				];
			});

			autoTable(doc, {
				startY: current_Y,
				head: [appointment_columns],
				body: appointment_rows,
				theme: "grid",
				headStyles: { fillColor: [67, 158, 234] },
				styles: { fontSize: 10, cellPadding: 3 },
			});

			current_Y = (doc as any).lastAutoTable.finalY + 10;
		}

		doc.setFontSize(13);
		doc.setFont("helvetica", "bold");
		doc.text(`Total: Bs. ${Number(sale.total).toFixed(2)}`, 14, current_Y);

		const filename = `bill_${sale.id}.pdf`;
		const filepath = join(BILLS_DIR, filename);
		const pdf_buffer = Buffer.from(doc.output("arraybuffer"));
		await Bun.write(filepath, pdf_buffer);
		return { bill: filename };
	},

	get: async (sale: sale_select) => {
		if (!sale.bill) throw new ServerError("Factura no encontrada para esta venta", 404);

		const filepath = join(BILLS_DIR, sale.bill);
		if (!existsSync(filepath)) {
			throw new ServerError("Archivo de factura no encontrado en el servidor", 404);
		}

		const file = Bun.file(filepath);
		return new Response(file, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `inline; filename="${sale.bill}"`,
			},
		});
	},
};
