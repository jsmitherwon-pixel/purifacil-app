import { apiFetch, USE_MOCK_API } from './client';
import { mockAdapter } from './mockAdapter';
import type {
  CoverageResult,
  FaqEntry,
  Invoice,
  LoginResult,
  NewPaymentMethodPayload,
  Paginated,
  PaymentMethod,
  PaymentMethodPatch,
  Plan,
  PurchaseDetail,
  PurchaseSummary,
  SignupPayload,
  Subscription,
  User,
} from './types';

export * from './types';
export { API_BASE, USE_MOCK_API, setAuthToken, getAuthToken } from './client';

export const api = {
  auth: {
    login(email: string, password: string): Promise<LoginResult> {
      if (USE_MOCK_API) return mockAdapter.login(email, password);
      return apiFetch<LoginResult>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    me(): Promise<{ user: User }> {
      if (USE_MOCK_API) return mockAdapter.me();
      return apiFetch<{ user: User }>('/auth/me');
    },
  },
  coverage: {
    check(zip: string): Promise<CoverageResult> {
      if (USE_MOCK_API) return mockAdapter.coverageCheck(zip);
      return apiFetch<CoverageResult>('/coverage/check', {
        method: 'POST',
        body: JSON.stringify({ zip }),
      });
    },
  },
  plans: {
    list(): Promise<Plan[]> {
      if (USE_MOCK_API) return mockAdapter.plans();
      return apiFetch<Plan[]>('/plans');
    },
  },
  subscription: {
    get(): Promise<Subscription> {
      if (USE_MOCK_API) return mockAdapter.subscription();
      return apiFetch<Subscription>('/subscription');
    },
  },
  invoices: {
    list(): Promise<Invoice[]> {
      if (USE_MOCK_API) return mockAdapter.invoices();
      return apiFetch<Invoice[]>('/invoices');
    },
  },
  faq: {
    list(lang: 'es' | 'en'): Promise<FaqEntry[]> {
      if (USE_MOCK_API) return mockAdapter.faq(lang);
      return apiFetch<FaqEntry[]>(`/faq?lang=${encodeURIComponent(lang)}`);
    },
  },
  signup: {
    submit(payload: SignupPayload): Promise<LoginResult> {
      if (USE_MOCK_API) return mockAdapter.signup(payload);
      return apiFetch<LoginResult>('/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },
  paymentMethods: {
    list(): Promise<PaymentMethod[]> {
      if (USE_MOCK_API) return mockAdapter.paymentMethodsList();
      return apiFetch<PaymentMethod[]>('/payment-methods');
    },
    add(payload: NewPaymentMethodPayload): Promise<PaymentMethod> {
      if (USE_MOCK_API) return mockAdapter.paymentMethodsAdd(payload);
      return apiFetch<PaymentMethod>('/payment-methods', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update(id: string, patch: PaymentMethodPatch): Promise<PaymentMethod> {
      if (USE_MOCK_API) return mockAdapter.paymentMethodsUpdate(id, patch);
      return apiFetch<PaymentMethod>(`/payment-methods/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
    },
    remove(id: string): Promise<{ ok: true }> {
      if (USE_MOCK_API) return mockAdapter.paymentMethodsRemove(id);
      return apiFetch<{ ok: true }>(`/payment-methods/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  },
  purchases: {
    list(page = 1, pageSize = 6): Promise<Paginated<PurchaseSummary>> {
      if (USE_MOCK_API) return mockAdapter.purchasesList(page, pageSize);
      return apiFetch<Paginated<PurchaseSummary>>(
        `/purchases?page=${page}&pageSize=${pageSize}`
      );
    },
    get(id: string): Promise<PurchaseDetail> {
      if (USE_MOCK_API) return mockAdapter.purchasesGet(id);
      return apiFetch<PurchaseDetail>(`/purchases/${encodeURIComponent(id)}`);
    },
    updateSubscriptionCard(purchaseId: string, paymentMethodId: string): Promise<PurchaseDetail> {
      if (USE_MOCK_API) {
        return mockAdapter.purchasesUpdateSubscriptionCard(purchaseId, paymentMethodId);
      }
      return apiFetch<PurchaseDetail>(
        `/purchases/${encodeURIComponent(purchaseId)}/subscription/payment-method`,
        {
          method: 'PATCH',
          body: JSON.stringify({ paymentMethodId }),
        }
      );
    },
  },
};
