# Purifácil app — API contract

The Expo app talks to the backend through `lib/api/index.ts`. In development
the mock adapter (`mockAdapter.ts`) resolves calls locally with `~300-600 ms`
of simulated latency so the UI can exercise loading/error states.

Toggle with env vars (Expo reads any variable prefixed with `EXPO_PUBLIC_`):

```
EXPO_PUBLIC_API_BASE=https://api.purifacil.mx
EXPO_PUBLIC_USE_MOCK_API=true   # set to "false" to hit the real API
```

All requests carry `Content-Type: application/json` and, when
`setAuthToken(token)` has been called, `Authorization: Bearer <token>`.
Server errors must return the shape `{ code: string, message: string }` — the
client rethrows them as `ApiError { status, code, message }`.

## Endpoints the backend needs to implement

| Method | Path                | Auth | Request body                                                   | Response                                             |
|--------|---------------------|------|----------------------------------------------------------------|------------------------------------------------------|
| POST   | `/auth/login`       | no   | `{ email, password }`                                          | `{ token: string, user: User }`                      |
| GET    | `/auth/me`          | yes  | —                                                              | `{ user: User }`                                     |
| POST   | `/coverage/check`   | no   | `{ zip: string }`                                              | `{ covered: boolean, recommendedPlanId?: string }`   |
| GET    | `/plans`            | no   | —                                                              | `Plan[]`                                             |
| GET    | `/subscription`     | yes  | —                                                              | `Subscription`                                       |
| GET    | `/invoices`         | yes  | —                                                              | `Invoice[]`                                          |
| GET    | `/faq?lang=es\|en`  | no   | —                                                              | `{ q: string, a: string }[]`                         |
| POST   | `/signup`           | no   | `SignupPayload` (see `types.ts`)                               | `{ token: string, user: User }`                      |
| GET    | `/payment-methods`  | yes  | —                                                              | `PaymentMethod[]`                                    |
| POST   | `/payment-methods`  | yes  | `NewPaymentMethodPayload` — provider token + holderName        | `PaymentMethod`                                      |
| PATCH  | `/payment-methods/:id` | yes | `PaymentMethodPatch` — `holderName?`, `setAsDefault?`         | `PaymentMethod`                                      |
| DELETE | `/payment-methods/:id` | yes | —                                                             | `204` on success · `409 CARD_LINKED_TO_SUB` if linked to an active sub |
| GET    | `/purchases?page=&pageSize=` | yes | —                                                       | `Paginated<PurchaseSummary>`                         |
| GET    | `/purchases/:id`    | yes  | —                                                              | `PurchaseDetail`                                     |
| PATCH  | `/purchases/:id/subscription/payment-method` | yes | `{ paymentMethodId: string }`               | `PurchaseDetail` · `409 SUB_NOT_ACTIVE` if the sub isn't active |

The exact TypeScript shapes for `User`, `Plan`, `Subscription`, `Invoice`,
`SignupPayload`, `PaymentMethod`, `NewPaymentMethodPayload`, `PurchaseSummary`,
`PurchaseDetail`, `Paginated<T>`, and error objects live in `types.ts`. Keep
them in sync.

## Payment security (non-negotiable)

`POST /payment-methods` MUST accept only a **provider token** (Stripe
SetupIntent → `payment_method`, Conekta `token_id`, Openpay `token.id`,
etc.) plus `holderName`. Never accept the raw PAN, CVV, or full expiration
from the mobile client — the app has no PCI-DSS scope and does not want to
gain it. The backend exchanges the token with the provider and persists
only `{brand, last4, expMonth, expYear}`.

The mock adapter accepts `brand/last4/exp` directly for development only,
so screens can exercise the create flow before the tokenization SDK is
wired. That path MUST NOT exist in production.

## Authorization (non-negotiable)

Every authenticated endpoint MUST verify that the requested resource
belongs to the user carrying the bearer token — not just that the token
is valid. Do NOT trust IDs coming from the client: a malicious client
can send another user's payment-method id, purchase id, etc. Reject with
`404 NOT_FOUND` (not `403`) to avoid leaking existence.

## Error contract

Errors respond with `{ code: string, message: string }` and the standard
HTTP status. Codes the client branches on today:

- `CARD_LINKED_TO_SUB` (409) — `DELETE /payment-methods/:id` when the card
  is the current payment method of one or more active subscriptions. The
  message body should carry the list of subscription IDs so the UI can
  deep-link the user to fix it.
- `SUB_NOT_ACTIVE` (409) — `PATCH /purchases/:id/subscription/payment-method`
  when the target subscription is `canceled`, `paused`, or `expired`.
- `NOT_FOUND` (404) — used for both "does not exist" and "not yours"
  (see Authorization above).

## Notes for the backend team

- **Auth** — tokens should be opaque strings; refresh strategy is TBD. The
  app currently stores the token client-side; when the real API exists we
  will migrate it into `expo-secure-store` instead of the current
  AsyncStorage-backed `useAuth` persistence.
- **Localization** — for `/faq` the client requests `?lang=es|en`; the server
  either returns already-localized `q`/`a` strings or i18n keys the client
  resolves. In mock mode we return keys, so the app can keep both languages
  bundled during development.
- **Coverage** — for postal codes outside the coverage list, return
  `{ covered: false }` without `recommendedPlanId`. The app collects a
  "notify me" email inline; that flow will hit a separate endpoint later.
- **Signup** — response should behave like a login: return a token + the
  freshly created user so the client can put them straight into the main
  flow.
