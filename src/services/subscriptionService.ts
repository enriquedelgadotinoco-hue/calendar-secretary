import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const TRIAL_STARTED_AT_KEY = 'subscription.trialStartedAt';
const SUBSCRIPTION_ACTIVE_UNTIL_KEY = 'subscription.activeUntil';

const TRIAL_DAYS = 30;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

let purchasesConfigured = false;

export type SubscriptionAccess = {
  hasActiveSubscription: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  canUsePremium: boolean;
  trialStartedAt: string;
  trialEndsAt: string;
  provider: 'revenuecat' | 'trial';
};

function getPlatformApiKey(): string | undefined {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY;
  }

  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_RC_IOS_API_KEY;
  }

  return undefined;
}

function getEntitlementId(): string {
  return process.env.EXPO_PUBLIC_RC_ENTITLEMENT ?? 'pro';
}

function getOfferingId(): string {
  return process.env.EXPO_PUBLIC_RC_OFFERING ?? 'default';
}

async function configurePurchasesIfAvailable(): Promise<boolean> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return false;
  }

  const apiKey = getPlatformApiKey();
  if (!apiKey) {
    return false;
  }

  if (purchasesConfigured) {
    return true;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });
    purchasesConfigured = true;
    return true;
  } catch {
    return false;
  }
}

function nowMs(): number {
  return Date.now();
}

export async function ensureTrialInitialized(): Promise<void> {
  const current = await AsyncStorage.getItem(TRIAL_STARTED_AT_KEY);
  if (current) {
    return;
  }

  await AsyncStorage.setItem(TRIAL_STARTED_AT_KEY, new Date().toISOString());
}

function calculateRemainingDays(fromMs: number, toMs: number): number {
  if (toMs <= fromMs) {
    return 0;
  }
  return Math.ceil((toMs - fromMs) / (24 * 60 * 60 * 1000));
}

export async function getSubscriptionAccess(): Promise<SubscriptionAccess> {
  await ensureTrialInitialized();

  const trialStartIso = (await AsyncStorage.getItem(TRIAL_STARTED_AT_KEY)) ?? new Date().toISOString();
  const trialStartMs = new Date(trialStartIso).getTime();
  const trialEndMs = trialStartMs + TRIAL_MS;

  const activeUntilIso = await AsyncStorage.getItem(SUBSCRIPTION_ACTIVE_UNTIL_KEY);
  const activeUntilMs = activeUntilIso ? new Date(activeUntilIso).getTime() : 0;

  let hasActiveSubscription = activeUntilMs > nowMs();
  let provider: 'revenuecat' | 'trial' = 'trial';

  const purchasesReady = await configurePurchasesIfAvailable();
  if (purchasesReady) {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlementId = getEntitlementId();
      hasActiveSubscription = hasActiveSubscription || Boolean(customerInfo.entitlements.active[entitlementId]);
      if (hasActiveSubscription) {
        provider = 'revenuecat';
      }
    } catch {
      // fallback to local trial/subscription state if native billing isn't available (e.g., Expo Go)
    }
  }

  const isTrialActive = trialEndMs > nowMs();

  return {
    hasActiveSubscription,
    isTrialActive,
    trialDaysRemaining: calculateRemainingDays(nowMs(), trialEndMs),
    canUsePremium: hasActiveSubscription || isTrialActive,
    trialStartedAt: new Date(trialStartMs).toISOString(),
    trialEndsAt: new Date(trialEndMs).toISOString(),
    provider
  };
}

export async function startOneDollarSubscription(): Promise<void> {
  const purchasesReady = await configurePurchasesIfAvailable();
  if (purchasesReady) {
    const offerings = await Purchases.getOfferings();
    const requestedOffering = offerings.all[getOfferingId()];
    const selectedOffering = requestedOffering ?? offerings.current;

    if (!selectedOffering) {
      throw new Error('No hay ofertas configuradas en RevenueCat.');
    }

    const monthlyPackage =
      selectedOffering.availablePackages.find((item) => item.packageType === 'MONTHLY') ??
      selectedOffering.availablePackages[0];

    if (!monthlyPackage) {
      throw new Error('No hay paquete mensual disponible para compra.');
    }

    await Purchases.purchasePackage(monthlyPackage);
    return;
  }

  const subscriptionLanding = process.env.EXPO_PUBLIC_SUBSCRIPTION_URL;
  if (subscriptionLanding) {
    await Linking.openURL(subscriptionLanding);
    return;
  }

  throw new Error('Configura EXPO_PUBLIC_SUBSCRIPTION_URL para iniciar la suscripción en producción.');
}

export async function debugActivateSubscriptionFor30Days(): Promise<void> {
  const activeUntil = new Date(nowMs() + TRIAL_MS).toISOString();
  await AsyncStorage.setItem(SUBSCRIPTION_ACTIVE_UNTIL_KEY, activeUntil);
}

export async function restorePurchases(): Promise<boolean> {
  const purchasesReady = await configurePurchasesIfAvailable();
  if (!purchasesReady) {
    return false;
  }

  const customerInfo = await Purchases.restorePurchases();
  const entitlementId = getEntitlementId();
  return Boolean(customerInfo.entitlements.active[entitlementId]);
}