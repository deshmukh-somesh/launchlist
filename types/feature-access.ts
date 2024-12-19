export interface FeatureAccessResponse {
  allowed: boolean;
  usedDaily: number;
  usedMonthly: number;
  dailyLimit: number;
  monthlyLimit: number;
  message?: string;
} 