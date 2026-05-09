import { treatment_schema, type treatment_insert } from "~/api/treatment/treatment.schema";

const data: treatment_insert[] = [
  {
    name: 'Corte de cabello',
    description: 'Corte y estilo personalizado',
    duration: 30,
    price: 25.0,
  },
  {
    name: 'Tinte completo',
    description: 'Coloración completa del cabello',
    duration: 120,
    price: 60.0,
  },
  {
    name: 'Manicura',
    description: 'Manicura clásica con esmaltado',
    duration: 45,
    price: 15.0,
  },
  {
    name: 'Pedicura',
    description: 'Pedicura completa con masaje',
    duration: 60,
    price: 20.0,
  },
  {
    name: 'Depilación de cejas',
    description: 'Depilación y modelado de cejas',
    duration: 20,
    price: 10.0,
  },
  {
    name: 'Masaje relajante',
    description: 'Masaje corporal completo para aliviar tensiones',
    duration: 90,
    price: 50.0,
  },
  {
    name: 'Limpieza facial',
    description: 'Limpieza profunda con extracción de impurezas',
    duration: 50,
    price: 30.0,
  },
  {
    name: 'Tratamiento antiacné',
    description: 'Tratamiento especializado para piel con acné',
    duration: 60,
    price: 40.0,
  },
  {
    name: 'Hidratación capilar',
    description: 'Tratamiento hidratante para el cabello',
    duration: 60,
    price: 35.0,
  },
  {
    name: 'Maquillaje profesional',
    description: 'Maquillaje para eventos especiales',
    duration: 70,
    price: 45.0,
  },
  {
    name: 'Bronceado spray',
    description: 'Bronceado uniforme y sin sol',
    duration: 20,
    price: 25.0,
  },
  {
    name: 'Exfoliación corporal',
    description: 'Exfoliación para renovar la piel',
    duration: 40,
    price: 30.0,
  },
  {
    name: 'Envoltura corporal',
    description: 'Tratamiento desintoxicante con envoltura de algas',
    duration: 60,
    price: 40.0,
  },
  {
    name: 'Microdermoabrasión',
    description: 'Renovación de la piel con microcristales',
    duration: 45,
    price: 50.0,
  },
  {
    name: 'Peeling químico',
    description: 'Peeling para mejorar la textura de la piel',
    duration: 30,
    price: 55.0,
  },
  {
    name: 'Extensiones de pestañas',
    description: 'Aplicación de extensiones para realzar la mirada',
    duration: 75,
    price: 70.0,
  },
  {
    name: 'Botox capilar',
    description: 'Tratamiento rejuvenecedor para el cabello',
    duration: 90,
    price: 80.0,
  },
];

export default {
	data,
	type: treatment_schema
}