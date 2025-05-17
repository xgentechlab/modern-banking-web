export const FEATURES = {
  ANALYTICS: {
    enabled: true,
    chartAnimations: true,
    realTimeUpdates: true,
  },
  TRANSACTIONS: {
    enabled: true,
    categories: true,
    search: true,
    filters: true,
  },
  CARDS: {
    enabled: true,
    virtualCards: true,
    cardFreeze: true,
    spendingLimits: true,
  },
  SECURITY: {
    biometricAuth: true,
    twoFactorAuth: true,
    deviceManagement: true,
  },
  NOTIFICATIONS: {
    push: true,
    email: true,
    sms: true,
  }
};

export const isFeatureEnabled = (featureKey, subFeatureKey = null) => {
  const feature = FEATURES[featureKey];
  if (!feature) return false;
  
  if (subFeatureKey) {
    return feature.enabled && feature[subFeatureKey];
  }
  
  return feature.enabled;
}; 