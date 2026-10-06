# Purifácil — App móvil (Expo/React Native)

App del producto Purifácil (purifacil.mx) para gestionar la suscripción de purificadores de agua.

## Stack

- Expo SDK 54, expo-router (typed routes), React 19, React Native 0.81, TypeScript
- Zustand + AsyncStorage (`persist` middleware) para estado
- Inter font vía `@expo-google-fonts/inter` (400/500/600/700), cargado en `app/_layout.tsx`
- `react-native-safe-area-context` + `react-native-edge-to-edge` para insets
- Alias `@/*` → raíz del proyecto

## Comandos

- `npx expo start` — dev server con QR para Expo Go (usar terminal real, no pipe)
- `npx expo start --web` — target web (necesita el babel fix, ver abajo)
- `npx tsc --noEmit` — typecheck limpio antes de builds
- `$env:EAS_NO_VCS = '1'; eas build --profile preview --platform android --non-interactive --no-wait` — build APK
- `eas update --branch preview` — OTA JS-only (solo builds ≥ v0.1.1)

Git está roto en esta máquina Windows (`git --help` falla). Cada `eas` necesita `EAS_NO_VCS=1` hasta reparar git.

## Arquitectura

**`lib/api/`** — capa única para todos los datos. Client, types, mockAdapter, index, README.
Todas las pantallas consumen `api.*` con el hook `useAsync` de `lib/useAsync.ts`.
Flag `EXPO_PUBLIC_USE_MOCK_API` (default `"true"`) cambia entre mock y `apiFetch` real.
Mock usa latencia 250-600 ms y datos deterministas (`hashFractional`, sin `Math.random`/`Date.now`).

**`app/(main)/`** — cuatro tabs: Inicio, Facturación, Soporte, Perfil.
`profile/` es un directorio con Stack anidado (index + payment-methods/{index,new,[id]/edit} + purchases/{index,[id]}).

**`components/`** — Card, Button (variants primary/secondary/ghost/danger), StatusPill, FilterHealth, Skeleton, BrandLogo, PaymentMethodCard (modes full/radio/compact), PurchaseCard, Pagination, ConfirmModal.

## Convenciones (no negociables)

- **Fuente**: siempre `fontFamily` de `lib/theme.ts` (`regular`/`medium`/`semibold`/`bold`) más `fontWeight` tokens. Nunca hardcodear `'Inter_...'` en pantallas.
- **Color primario**: turquesa `#0EA5B7` (no morado — el morado es del sitio web, no de la app).
- **Padding-bottom de scrolls**: `useBottomTabBarHeight()` de `@react-navigation/bottom-tabs`, nunca dp fijo.
- **Insets**: `useSafeAreaInsets().bottom` como padding (no margin) en tab bar, con piso de 6 px.
- **Headers flotantes**: patrón `position: 'absolute'` + `onLayout` midiendo alto → `paddingTop` dinámico en el ScrollView. Ver `app/(main)/home.tsx`. Nunca reintroducir `marginTop` negativo en las cards.
- **Pagos**: la app **nunca** recibe PAN. Solo tokens del proveedor (Stripe/Conekta/Openpay) + `holderName`. El mock acepta campos planos solo para demo; producción requiere tokenización.
- **Autorización de recursos**: cada endpoint autenticado del backend debe verificar ownership server-side y rechazar con 404 (no 403) para no filtrar existencia.

## Web target

`babel.config.js` pasa `unstable_transformImportMeta: true` a `babel-preset-expo`. Sin eso, el bundle web falla con `Cannot use 'import.meta' outside a module` (viene del `devtools` middleware de zustand que Metro no puede tree-shakear del barrel CJS). Si la página web queda en blanco: revisar la consola por `import.meta`, confirmar el flag, y limpiar `%TEMP%\metro-cache` + `--clear`.

## Edge-to-edge Android

`app.json` tiene `android.edgeToEdgeEnabled: true` **y** el plugin `react-native-edge-to-edge` declarado. Ambos son necesarios en SDK 54 — el flag sin el paquete mete Expo Go en un loop de reload.

## EAS

- Cuenta `emmanuelcruz94`, project id `a9d89b13-de55-497e-bea7-f8beaadd5556`
- Profiles en `eas.json`: `development` / `preview` (APK, channel `preview`) / `production` (AAB, autoIncrement)
- Keystore en servidores de Expo (nunca exportado local) — administrar con `eas credentials`
- `expo-updates` con `runtimeVersion.policy: "appVersion"` — OTA solo funciona en builds ≥ v0.1.1

## Nunca hacer

- Cambiar la red Wi-Fi de la máquina (fuera de scope; el usuario alguna vez lo pidió por confusión).
- Introducir librerías nuevas sin acordarlo primero. La app se sostiene con las que ya están.
- Escribir comentarios que expliquen qué hace el código. Solo el porqué no obvio.
- Guardar PAN, CVV, o datos completos de tarjeta en storage o logs.

## Pendientes vivos

Ver `~/.claude/projects/C--Users-emmac/memory/pending_purifacil_app.md`.
