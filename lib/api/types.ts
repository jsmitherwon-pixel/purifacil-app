export type PlanTech = 'RO' | 'UV';

export type Plan = {
  id: string;
  name: string;
  tech: PlanTech;
  stages: number;
  subscription: number;
  finance: number;
  financeMonths: number;
  purchase: number;
  description: string;
  descriptionEn: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
};

export type Subscription = {
  planId: string;
  status: 'active' | 'paused';
  paymentMode: 'subscription' | 'finance' | 'purchase';
  monthlyPrice: number;
  installDate: string; // ISO YYYY-MM-DD
  nextServiceDate: string; // ISO YYYY-MM-DD
  technicianName: string;
  nextCartridge: string;
  nextCartridgeEn: string;
};

export type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending';
};

export type CoverageResult = {
  covered: boolean;
  recommendedPlanId?: string;
};

export type LoginResult = {
  token: string;
  user: User;
};

export type SignupPayload = {
  planId: string;
  mode: 'subscription' | 'finance' | 'purchase';
  name: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  installDate: string;
  installSlot: 'morning' | 'afternoon';
};

export type FaqEntry = {
  q: string;
  a: string;
};

export type ApiError = {
  status: number;
  code: string;
  message: string;
};

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export type PaymentMethod = {
  id: string;
  brand: CardBrand;
  last4: string;                 // exactly 4 digits, never the PAN
  expMonth: number;              // 1–12
  expYear: number;               // 4 digits
  holderName: string;
  isDefault: boolean;
  linkedSubscriptionIds: string[];
};

export type NewPaymentMethodPayload = {
  // Production: a provider token + holderName is enough.
  // Mock accepts brand/last4/exp directly (documented in README).
  token?: string;
  brand?: CardBrand;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  holderName: string;
  setAsDefault?: boolean;
};

export type PaymentMethodPatch = {
  holderName?: string;
  setAsDefault?: boolean;
};

export type PurchaseType = 'subscription' | 'one_time';
export type SubscriptionStatus = 'active' | 'canceled' | 'paused' | 'expired';
export type PaymentStatus = 'paid' | 'failed' | 'refunded';

export type PaymentRecord = {
  id: string;
  amount: number;
  currency: 'MXN';
  date: string;                  // ISO YYYY-MM-DD
  status: PaymentStatus;
};

export type PurchaseSummary = {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  type: PurchaseType;
  purchaseDate: string;          // ISO YYYY-MM-DD
  subscriptionStatus?: SubscriptionStatus;
};

export type PurchaseDetail = PurchaseSummary & {
  productDescription: string;
  productDescriptionEn: string;
  warrantyUrl?: string;
  subscription?: {
    status: SubscriptionStatus;
    nextPaymentDate?: string;
    nextPaymentAmount?: number;
    currentPaymentMethodId: string | null;
  };
  oneTimeAmount?: number;        // for one_time purchases
  paymentHistory: PaymentRecord[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
