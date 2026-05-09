import { category_schema, type category_insert } from "~/modules/category/category.schema";

const data: category_insert[] = [
	{
		name: "Cuidado de la piel",
		description: "Productos para el cuidado de la piel",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Maquillaje",
		description: "Productos de maquillaje",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado del cabello",
		description: "Productos para el cuidado del cabello",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Perfumes",
		description: "Fragancias y perfumes",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado de las uñas",
		description: "Productos para el cuidado de las uñas",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado corporal",
		description: "Productos para el cuidado del cuerpo",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado facial",
		description: "Productos para el cuidado del rostro",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado dental",
		description: "Productos para el cuidado dental",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Protección solar",
		description: "Productos de protección solar",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Aromaterapia",
		description: "Productos de aromaterapia",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Accesorios de belleza",
		description: "Accesorios para la belleza",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado de los pies",
		description: "Productos para el cuidado de los pies",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado de los ojos",
		description: "Productos para el cuidado de los ojos",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado de labios",
		description: "Productos para el cuidado de los labios",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado masculino",
		description: "Productos de belleza para hombres",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Cuidado infantil",
		description: "Productos de belleza para niños",
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		name: "Otros",
		description: "Otros productos, que pueden o no estar categorizados",
		created_at: new Date(),
		updated_at: new Date(),
	},
];

export default {
	data,
	type: category_schema,
}