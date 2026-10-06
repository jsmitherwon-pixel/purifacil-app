import {
  plans as mockPlans,
  invoices as mockInvoices,
  sampleUser,
  sampleSubscription,
  coveredZips,
  recommendPlan,
} from '../mockData';
import type {
  ApiError,
  CoverageResult,
  FaqEntry,
  Invoice,
  LoginResult,
  Paginated,
  PaymentMethod,
  PaymentMethodPatch,
  PaymentRecord,
  Plan,
  PurchaseDetail,
  PurchaseSummary,
  SignupPayload,
  Subscription,
  User,
  NewPaymentMethodPayload,
} from './types';

function delay<T>(value: T, min = 250, max = 600): Promise<T> {
  const ms = min + Math.floor((max - min) * hashFractional(JSON.stringify(value ?? '')));
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function fail<T = never>(err: ApiError, min = 200, max = 400): Promise<T> {
  const ms = min + Math.floor((max - min) * hashFractional(JSON.stringify(err)));
  return new Promise((_, reject) => setTimeout(() => reject(err), ms));
}

// Deterministic pseudo-random in [0,1) — avoids Math.random to keep mock-mode
// call sites reproducible for snapshot testing.
function hashFractional(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

// --- mutable seed state (payment methods + purchases) --------------------

const ACTIVE_SUB_ID = 'SUB-001';

const paymentMethods: PaymentMethod[] = [
  {
    id: 'PM-001',
    brand: 'visa',
    last4: '5868',
    expMonth: 8,
    expYear: 2028,
    holderName: 'María González',
    isDefault: true,
    linkedSubscriptionIds: [ACTIVE_SUB_ID],
  },
  {
    id: 'PM-002',
    brand: 'mastercard',
    last4: '3341',
    expMonth: 3,
    expYear: 2027,
    holderName: 'María González',
    isDefault: false,
    linkedSubscriptionIds: [],
  },
  {
    id: 'PM-003',
    brand: 'amex',
    last4: '0025',
    expMonth: 11,
    expYear: 2026,
    holderName: 'María González',
    isDefault: false,
    linkedSubscriptionIds: [],
  },
];

let nextPmSeq = 4;

// Product catalog for mock purchases (RO/UV + accessories).
const products = {
  ro5: {
    name: 'Ósmosis Inversa 5 etapas',
    description: 'Equipo bajo tarja con 5 etapas de filtración incluida instalación.',
    descriptionEn: 'Under-sink 5-stage reverse osmosis system, professional install included.',
  },
  uv3: {
    name: 'Ultravioleta 3 etapas',
    description: 'Sistema UV bajo tarja para eliminar bacterias y virus.',
    descriptionEn: 'Under-sink UV system to eliminate bacteria and viruses.',
  },
  cartridge: {
    name: 'Kit de cartuchos anuales',
    description: 'Reemplazos de cartuchos para todo un año, compatibles con equipos RO/UV.',
    descriptionEn: 'One year of replacement cartridges compatible with RO/UV systems.',
  },
  faucet: {
    name: 'Llave dedicada premium',
    description: 'Llave de acero inoxidable para agua purificada, instalación separada.',
    descriptionEn: 'Stainless-steel dedicated faucet for purified water, separate install.',
  },
};

function historyFor(id: string, monthly: number, months: number): PaymentRecord[] {
  const anchor = new Date('2026-08-20T00:00:00Z');
  const items: PaymentRecord[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(anchor);
    d.setUTCMonth(d.getUTCMonth() - i);
    const iso = d.toISOString().slice(0, 10);
    const seed = hashFractional(`${id}:${iso}`);
    const status: PaymentRecord['status'] = seed < 0.03 ? 'failed' : 'paid';
    items.push({
      id: `PAY-${id}-${i}`,
      amount: monthly,
      currency: 'MXN',
      date: iso,
      status,
    });
  }
  return items;
}

const purchases: PurchaseDetail[] = [
  {
    id: ACTIVE_SUB_ID,
    productId: 'ro5',
    productName: products.ro5.name,
    productDescription: products.ro5.description,
    productDescriptionEn: products.ro5.descriptionEn,
    type: 'subscription',
    purchaseDate: '2026-04-20',
    subscriptionStatus: 'active',
    warrantyUrl: 'https://purifacil.mx/garantia/ro5',
    subscription: {
      status: 'active',
      nextPaymentDate: '2026-09-20',
      nextPaymentAmount: 245,
      currentPaymentMethodId: 'PM-001',
    },
    paymentHistory: historyFor(ACTIVE_SUB_ID, 245, 5),
  },
  {
    id: 'SUB-002',
    productId: 'uv3',
    productName: products.uv3.name,
    productDescription: products.uv3.description,
    productDescriptionEn: products.uv3.descriptionEn,
    type: 'subscription',
    purchaseDate: '2026-01-15',
    subscriptionStatus: 'active',
    warrantyUrl: 'https://purifacil.mx/garantia/uv3',
    subscription: {
      status: 'active',
      nextPaymentDate: '2026-09-15',
      nextPaymentAmount: 195,
      currentPaymentMethodId: 'PM-002',
    },
    paymentHistory: historyFor('SUB-002', 195, 8),
  },
  {
    id: 'SUB-003',
    productId: 'ro5',
    productName: `${products.ro5.name} — oficina`,
    productDescription: `${products.ro5.description} Equipo secundario en la oficina.`,
    productDescriptionEn: `${products.ro5.descriptionEn} Secondary unit for the office.`,
    type: 'subscription',
    purchaseDate: '2025-11-10',
    subscriptionStatus: 'active',
    subscription: {
      status: 'active',
      nextPaymentDate: '2026-09-10',
      nextPaymentAmount: 245,
      currentPaymentMethodId: 'PM-001',
    },
    paymentHistory: historyFor('SUB-003', 245, 10),
  },
  {
    id: 'SUB-004',
    productId: 'uv3',
    productName: `${products.uv3.name} — casa de playa`,
    productDescription: `${products.uv3.description} Instalado en casa de playa.`,
    productDescriptionEn: `${products.uv3.descriptionEn} Installed at the beach house.`,
    type: 'subscription',
    purchaseDate: '2025-06-01',
    subscriptionStatus: 'paused',
    subscription: {
      status: 'paused',
      currentPaymentMethodId: 'PM-002',
    },
    paymentHistory: historyFor('SUB-004', 195, 6),
  },
  {
    id: 'SUB-005',
    productId: 'ro5',
    productName: `${products.ro5.name} — anterior`,
    productDescription: 'Suscripción anterior, cancelada en 2025.',
    productDescriptionEn: 'Previous subscription, canceled in 2025.',
    type: 'subscription',
    purchaseDate: '2024-08-05',
    subscriptionStatus: 'canceled',
    subscription: {
      status: 'canceled',
      currentPaymentMethodId: null,
    },
    paymentHistory: historyFor('SUB-005', 245, 12),
  },
  {
    id: 'PUR-006',
    productId: 'cartridge',
    productName: products.cartridge.name,
    productDescription: products.cartridge.description,
    productDescriptionEn: products.cartridge.descriptionEn,
    type: 'one_time',
    purchaseDate: '2026-07-04',
    warrantyUrl: 'https://purifacil.mx/garantia/cartuchos',
    oneTimeAmount: 1490,
    paymentHistory: [
      {
        id: 'PAY-PUR-006-0',
        amount: 1490,
        currency: 'MXN',
        date: '2026-07-04',
        status: 'paid',
      },
    ],
  },
  {
    id: 'PUR-007',
    productId: 'faucet',
    productName: products.faucet.name,
    productDescription: products.faucet.description,
    productDescriptionEn: products.faucet.descriptionEn,
    type: 'one_time',
    purchaseDate: '2026-03-22',
    oneTimeAmount: 890,
    paymentHistory: [
      {
        id: 'PAY-PUR-007-0',
        amount: 890,
        currency: 'MXN',
        date: '2026-03-22',
        status: 'paid',
      },
    ],
  },
  {
    id: 'PUR-008',
    productId: 'cartridge',
    productName: `${products.cartridge.name} (kit inicial)`,
    productDescription: products.cartridge.description,
    productDescriptionEn: products.cartridge.descriptionEn,
    type: 'one_time',
    purchaseDate: '2025-09-14',
    oneTimeAmount: 1490,
    paymentHistory: [
      {
        id: 'PAY-PUR-008-0',
        amount: 1490,
        currency: 'MXN',
        date: '2025-09-14',
        status: 'paid',
      },
    ],
  },
];

function summariesSortedDesc(): PurchaseSummary[] {
  return purchases
    .slice()
    .sort((a, b) => (a.purchaseDate < b.purchaseDate ? 1 : -1))
    .map((p) => ({
      id: p.id,
      productId: p.productId,
      productName: p.productName,
      productImage: p.productImage,
      type: p.type,
      purchaseDate: p.purchaseDate,
      subscriptionStatus: p.subscriptionStatus,
    }));
}

// -------------------------------------------------------------------------

export const mockAdapter = {
  async login(email: string, _password: string): Promise<LoginResult> {
    return delay({
      token: `mock-token-${email.replace(/[^a-z0-9]/gi, '').slice(0, 12)}`,
      user: { ...sampleUser, email: email || sampleUser.email },
    });
  },
  async me(): Promise<{ user: User }> {
    return delay({ user: sampleUser });
  },
  async coverageCheck(zip: string): Promise<CoverageResult> {
    const covered = coveredZips.includes(zip.trim());
    return delay({
      covered,
      recommendedPlanId: covered ? recommendPlan(zip).id : undefined,
    });
  },
  async plans(): Promise<Plan[]> {
    return delay(mockPlans);
  },
  async subscription(): Promise<Subscription> {
    return delay(sampleSubscription);
  },
  async invoices(): Promise<Invoice[]> {
    return delay(mockInvoices);
  },
  async faq(_lang: 'es' | 'en'): Promise<FaqEntry[]> {
    return delay([
      { q: 'faq.savings.q', a: 'faq.savings.a' },
      { q: 'faq.install.q', a: 'faq.install.a' },
      { q: 'faq.cancel.q', a: 'faq.cancel.a' },
      { q: 'faq.cartridge.q', a: 'faq.cartridge.a' },
    ]);
  },
  async signup(payload: SignupPayload): Promise<LoginResult> {
    return delay({
      token: `mock-token-signup-${payload.email.slice(0, 6)}`,
      user: {
        id: 'CUST-NEW',
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        zip: payload.zip,
      },
    });
  },

  // --- payment methods ---------------------------------------------------

  async paymentMethodsList(): Promise<PaymentMethod[]> {
    return delay(paymentMethods.slice());
  },
  async paymentMethodsAdd(payload: NewPaymentMethodPayload): Promise<PaymentMethod> {
    const id = `PM-${String(nextPmSeq++).padStart(3, '0')}`;
    const created: PaymentMethod = {
      id,
      brand: payload.brand ?? 'unknown',
      last4: payload.last4 ?? '0000',
      expMonth: payload.expMonth ?? 1,
      expYear: payload.expYear ?? new Date().getUTCFullYear() + 1,
      holderName: payload.holderName,
      isDefault: !!payload.setAsDefault || paymentMethods.length === 0,
      linkedSubscriptionIds: [],
    };
    if (created.isDefault) {
      for (const pm of paymentMethods) pm.isDefault = false;
    }
    paymentMethods.push(created);
    return delay(created);
  },
  async paymentMethodsUpdate(id: string, patch: PaymentMethodPatch): Promise<PaymentMethod> {
    const pm = paymentMethods.find((p) => p.id === id);
    if (!pm) return fail({ status: 404, code: 'NOT_FOUND', message: 'Tarjeta no encontrada.' });
    if (patch.holderName !== undefined) pm.holderName = patch.holderName;
    if (patch.setAsDefault === true) {
      for (const other of paymentMethods) other.isDefault = false;
      pm.isDefault = true;
    }
    return delay({ ...pm });
  },
  async paymentMethodsRemove(id: string): Promise<{ ok: true }> {
    const pm = paymentMethods.find((p) => p.id === id);
    if (!pm) return fail({ status: 404, code: 'NOT_FOUND', message: 'Tarjeta no encontrada.' });
    if (pm.linkedSubscriptionIds.length > 0) {
      return fail({
        status: 409,
        code: 'CARD_LINKED_TO_SUB',
        message: `linked:${pm.linkedSubscriptionIds.join(',')}`,
      });
    }
    const idx = paymentMethods.indexOf(pm);
    paymentMethods.splice(idx, 1);
    if (pm.isDefault && paymentMethods.length > 0) paymentMethods[0].isDefault = true;
    return delay({ ok: true });
  },

  // --- purchases ---------------------------------------------------------

  async purchasesList(page: number, pageSize: number): Promise<Paginated<PurchaseSummary>> {
    const all = summariesSortedDesc();
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return delay({ items, total: all.length, page, pageSize });
  },
  async purchasesGet(id: string): Promise<PurchaseDetail> {
    const p = purchases.find((x) => x.id === id);
    if (!p) return fail({ status: 404, code: 'NOT_FOUND', message: 'Compra no encontrada.' });
    return delay({ ...p, paymentHistory: p.paymentHistory.slice() });
  },
  async purchasesUpdateSubscriptionCard(
    purchaseId: string,
    paymentMethodId: string
  ): Promise<PurchaseDetail> {
    const p = purchases.find((x) => x.id === purchaseId);
    if (!p) return fail({ status: 404, code: 'NOT_FOUND', message: 'Compra no encontrada.' });
    if (p.type !== 'subscription' || p.subscription?.status !== 'active') {
      return fail({
        status: 409,
        code: 'SUB_NOT_ACTIVE',
        message: 'La suscripción no está activa.',
      });
    }
    const pm = paymentMethods.find((m) => m.id === paymentMethodId);
    if (!pm) return fail({ status: 404, code: 'NOT_FOUND', message: 'Tarjeta no encontrada.' });
    // Unlink previous, link new.
    const prevId = p.subscription.currentPaymentMethodId;
    if (prevId) {
      const prev = paymentMethods.find((m) => m.id === prevId);
      if (prev) prev.linkedSubscriptionIds = prev.linkedSubscriptionIds.filter((s) => s !== p.id);
    }
    if (!pm.linkedSubscriptionIds.includes(p.id)) pm.linkedSubscriptionIds.push(p.id);
    p.subscription.currentPaymentMethodId = pm.id;
    return delay({ ...p, paymentHistory: p.paymentHistory.slice() });
  },
};
