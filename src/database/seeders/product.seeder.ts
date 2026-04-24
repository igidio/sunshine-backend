import type { InferInsertModel } from "drizzle-orm";
import { product_schema } from "~/api/product/product.schema";

type Product = InferInsertModel<typeof product_schema>;

const data: Product[] = [
	{
		name: "Product 1",
		description: "Description for Product 1",
		category_id: 1,
		price: 19.99,
		image: "https://example.com/product1.jpg"
	},
	{
		name: "Product 2",
		description: "Description for Product 2",
		category_id: 2,
		price: 29.99,
		image: "https://example.com/product2.jpg"
	},
	{
		name: "Product 3",
		description: "Description for Product 3",
		category_id: 1,
		price: 9.99,
		image: "https://example.com/product3.jpg"
	},
	{
		name: "Product 4",
		description: "Description for Product 4",
		category_id: 3,
		price: 49.99,
		image: "https://example.com/product4.jpg"
	},
	{
		name: "Product 5",
		description: "Description for Product 5",
		category_id: 2,
		price: 12.5,
		image: "https://example.com/product5.jpg"
	},
	{
		name: "Product 6",
		description: "Description for Product 6",
		category_id: 3,
		price: 39.99,
		image: "https://example.com/product6.jpg"
	},
	{
		name: "Product 7",
		description: "Description for Product 7",
		category_id: 1,
		price: 24.99,
		image: "https://example.com/product7.jpg"
	},
	{
		name: "Product 8",
		description: "Description for Product 8",
		category_id: 4,
		price: 59.99,
		image: "https://example.com/product8.jpg"
	},
	{
		name: "Product 9",
		description: "Description for Product 9",
		category_id: 4,
		price: 34.99,
		image: "https://example.com/product9.jpg"
	},
	{
		name: "Product 10",
		description: "Description for Product 10",
		category_id: 5,
		price: 15.0,
		image: "https://example.com/product10.jpg"
	},
	{
		name: "Product 11",
		description: "Description for Product 11",
		category_id: 2,
		price: 22.99,
		image: "https://example.com/product11.jpg"
	},
	{
		name: "Product 12",
		description: "Description for Product 12",
		category_id: 3,
		price: 18.75,
		image: "https://example.com/product12.jpg"
	},
	{
		name: "Product 13",
		description: "Description for Product 13",
		category_id: 5,
		price: 27.5,
		image: "https://example.com/product13.jpg"
	},
	{
		name: "Product 14",
		description: "Description for Product 14",
		category_id: 1,
		price: 44.0,
		image: "https://example.com/product14.jpg"
	},
	{
		name: "Product 15",
		description: "Description for Product 15",
		category_id: 4,
		price: 8.99,
		image: "https://example.com/product15.jpg"
	},
	{
		name: "Product 16",
		description: "Description for Product 16",
		category_id: 2,
		price: 31.99,
		image: "https://example.com/product16.jpg"
	},
	{
		name: "Product 17",
		description: "Description for Product 17",
		category_id: 5,
		price: 52.5,
		image: "https://example.com/product17.jpg"
	},
	{
		name: "Product 18",
		description: "Description for Product 18",
		category_id: 1,
		price: 11.99,
		image: "https://example.com/product18.jpg"
	},
	{
		name: "Product 19",
		description: "Description for Product 19",
		category_id: 3,
		price: 71.0,
		image: "https://example.com/product19.jpg"
	},
	{
		name: "Product 20",
		description: "Description for Product 20",
		category_id: 4,
		price: 65.5,
		image: "https://example.com/product20.jpg"
	}
]

export default {
	data,
	type: product_schema
};