import { supplier_schema, type supplier_insert } from "~/modules/supplier/supplier.schema";

const data: supplier_insert[] = [
  {
    name: "Distribuciones Belleza SA",
    description: "Proveedor de cosméticos profesionales y productos de cuidado personal.",
    phone_number: "0212-5550101",
    email: "ventas@distribucionesbelleza.com",
    address: "Av. Las Flores 123",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Cosmética Selecta",
    description: "Distribuidor de maquillaje y productos dermatológicos.",
    phone_number: "0414-5550202",
    email: "contacto@cosmeticaselct.com",
    address: "Calle Montaña 45",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Aromas y Spa Ltda.",
    description: "Proveedor de aceites, lociones y artículos de spa.",
    phone_number: "0412-5550303",
    email: "pedidos@aromayspa.com",
    address: "Calle Jardín 67",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export default {
  data,
  type: supplier_schema,
};
