import type { Plan, User, Subscription, Invoice } from './api/types';

export type { Plan, User, Subscription, Invoice, PlanTech } from './api/types';

export const plans: Plan[] = [
  {
    id: 'ro5',
    name: 'Ósmosis Inversa 5 etapas',
    tech: 'RO',
    stages: 5,
    subscription: 245,
    finance: 315,
    financeMonths: 24,
    purchase: 8990,
    description:
      'Elimina hasta 99.99% de contaminantes: minerales, metales pesados, bacterias, virus y cloro.',
    descriptionEn:
      'Removes up to 99.99% of contaminants: minerals, heavy metals, bacteria, viruses, and chlorine.',
  },
  {
    id: 'uv3',
    name: 'Ultravioleta 3 etapas',
    tech: 'UV',
    stages: 3,
    subscription: 195,
    finance: 250,
    financeMonths: 24,
    purchase: 6490,
    description:
      'Filtración + luz ultravioleta para eliminar bacterias y virus. Ideal para agua de buena calidad.',
    descriptionEn:
      'Filtration + UV light to eliminate bacteria and viruses. Ideal for good-quality water.',
  },
];

export const coveredZips: string[] = [
  // CDMX
  '03100', '03200', '03300', '03400', '03500', '03600', '03700', '03800',
  '03900', '03920', '04100', '04200', '04300', '04400', '06000', '06100',
  '06600', '06700', '06800', '11000', '11100', '11200', '11300', '11400',
  // Guadalajara
  '44100', '44200', '44600', '44650',
  // Monterrey
  '64000', '64460', '64620',
];

const roZipPrefixes = ['03', '04', '06', '64'];
const uvZipPrefixes = ['11', '44'];

export function recommendPlan(zip: string): Plan {
  const prefix = zip.slice(0, 2);
  if (uvZipPrefixes.includes(prefix)) return plans[1];
  if (roZipPrefixes.includes(prefix)) return plans[0];
  return plans[0];
}

export const sampleUser: User = {
  id: 'CUST-001842',
  name: 'María González',
  email: 'maria.gonzalez@example.com',
  phone: '+52 55 1234 5678',
  address: 'Av. Insurgentes Sur 1602, Col. Crédito Constructor, CDMX',
  zip: '03940',
};

// Anchored to a fixed date so the mock stays deterministic; real backend
// would compute nextServiceDate = installDate + 6 months.
export const sampleSubscription: Subscription = {
  planId: 'ro5',
  status: 'active',
  paymentMode: 'subscription',
  monthlyPrice: 245,
  installDate: '2026-04-20',
  nextServiceDate: '2026-10-20',
  technicianName: 'Carlos Ramírez',
  nextCartridge: 'Cartucho de sedimentos + carbón activado',
  nextCartridgeEn: 'Sediment + activated carbon cartridge',
};

export const invoices: Invoice[] = [
  { id: 'INV-2026-08', date: '2026-08-20', amount: 245, status: 'pending' },
  { id: 'INV-2026-07', date: '2026-07-20', amount: 245, status: 'paid' },
  { id: 'INV-2026-06', date: '2026-06-20', amount: 245, status: 'paid' },
  { id: 'INV-2026-05', date: '2026-05-20', amount: 245, status: 'paid' },
];

export const supportPhone = '522223616423'; // Purifácil WhatsApp — E.164 without +
