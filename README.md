# Calendar Secretary

App móvil (Expo + React Native + TypeScript) para:
- Escanear fotos y capturas de pantalla.
- Usar cámara para escanear calendarios.
- Extraer texto con OCR por API.
- Sugerir eventos y agregarlos al calendario del dispositivo.
- Exportar eventos en `.ics` para compatibilidad con la mayoría de marcas/proveedores.
- Monetizar con suscripción mensual y prueba gratis.

## Requisitos

- Node.js 20+
- npm 10+
- Expo Go en móvil o emulador Android/iOS

## OCR (lectura de imágenes)

- La app usa OCR por API para extraer texto real de capturas/fotos.
- Crea un archivo `.env` basado en `.env.example` y define tu key:

```bash
EXPO_PUBLIC_OCR_SPACE_API_KEY=tu_api_key_aqui
EXPO_PUBLIC_SUBSCRIPTION_URL=https://tu-dominio.com/subscribe
```

- Reinicia Expo después de cambiar variables de entorno.

## Monetización (USD $1/mes + 30 días gratis)

- La app ya incluye:
	- Lógica de prueba gratis de 30 días por usuario (persistida localmente).
	- Pantalla de paywall (`Suscripción`) con precio de USD $1/mes y restauración de compras.
	- Bloqueo de escaneo cuando no hay prueba activa ni suscripción.
	- Integración con RevenueCat (`react-native-purchases`) para billing real en tiendas.

- Para publicar cobrando en tiendas (recomendado por políticas de Apple/Google):
	1. Crea producto de suscripción mensual en Google Play Console y App Store Connect.
	2. Configura el plan con prueba gratuita de 1 mes.
	3. Usa el mismo product ID en ambas tiendas (ejemplo sugerido: `calendar_secretary_monthly_1usd`).
	4. En RevenueCat, crea `entitlement` (ejemplo: `pro`) y `offering` (ejemplo: `default`) vinculando el producto mensual.
	5. Completa llaves en `.env`:

```bash
EXPO_PUBLIC_RC_ANDROID_API_KEY=goog_xxx
EXPO_PUBLIC_RC_IOS_API_KEY=appl_xxx
EXPO_PUBLIC_RC_ENTITLEMENT=pro
EXPO_PUBLIC_RC_OFFERING=default
```

	6. Genera build nativo (EAS) para probar billing. En Expo Go no funciona compra in-app nativa.

- Nota legal/política:
	- Para bienes digitales in-app, Google/Apple exigen su sistema de billing en la app publicada.
	- El flujo por URL es útil como fallback, pero para producción en tiendas debe prevalecer billing oficial.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm run start
```

Opcional:

```bash
npm run android
npm run ios
npm run web
```

## Instalar en celular Android (link de instalación)

1. Inicia sesión en Expo una sola vez:

```bash
npx eas login
```

2. Genera un APK de prueba instalable por link:

```bash
npm run build:android:preview
```

3. Al terminar, EAS mostrará una URL de descarga del `.apk`.
	 - Esa URL es el link que puedes abrir en tu celular para instalar.

## Publicación y Play Protect

- Para máxima confianza de Play Protect, distribuye desde Google Play (AAB firmado), no solo APK por enlace.
- Genera build de tienda:

```bash
npm run build:android:production
```

- Luego publica en Play Console (Internal testing → Closed/Open testing → Production).
- Requisitos clave para aprobación:
	- App firmada (EAS lo gestiona).
	- Política de privacidad publicada y declarada en Play Console.
	- Permisos mínimos y justificados (cámara/galería/calendario).
	- Ficha de seguridad de datos completa (Data safety).
	- Pruebas básicas sin crashes en Android 13+.

### URL de política de privacidad (Google Play)

- Archivo listo para publicar: `privacy-policy.html`.
- URL recomendada en GitHub Pages:

```text
https://enriquedelgado1985.github.io/calendar-secretary/privacy-policy.html
```

- Para que esa URL deje de dar 404:
	1. Sube este repo a GitHub con nombre `calendar-secretary`.
	2. En GitHub: `Settings` → `Pages`.
	3. En `Build and deployment`, selecciona `Deploy from a branch`.
	4. Branch: `main`, folder: `/ (root)`.
	5. Guarda y espera el deploy (1-3 min).
	6. Abre la URL y confirma código HTTP 200 antes de pegarla en Play Console.

## Estado del MVP

- Flujo completo de pantallas: Home, Scan, Review, EventPreview, Settings, Connections.
- OCR por API + parser de múltiples eventos por día/hora en `src/services/ocrService.ts`.
- Guardado en calendario del dispositivo con `expo-calendar`.
- Exportación `.ics` para interoperabilidad amplia.
- Paywall con prueba gratis de 30 días y suscripción mensual en `src/screens/PaywallScreen.tsx`.

## Siguientes pasos recomendados

- Integrar billing nativo de Google Play/App Store antes de producción final.
- Añadir OAuth y conectores directos a Google Calendar y Microsoft Graph.
- Mejorar parser de fecha/hora con NLP y soporte multi-idioma.