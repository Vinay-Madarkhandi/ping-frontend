// Authentication Types
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  id: string;
  username: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse {
  success: boolean;
}

// Plan and usage types
export type PlanName = "FREE" | "PRO";

export interface PlanLimits {
  name: PlanName;
  maxMonitors: number;
  minIntervalMs: number;
  maxTimeoutMs: number;
  monthlyCheckQuota: number;
  retentionDays: number;
  alertCooldownSeconds: number;
  maxAlertsPerDay: number;
  priceAmount?: number;
  currency?: string;
  durationDays?: number;
}

export interface CurrentUserResponse {
  userId: string;
  email: string;
  userName: string;
  subscriptionStatus?: "FREE" | "ACTIVE" | "EXPIRED";
  subscriptionStartAt?: string | null;
  subscriptionEndAt?: string | null;
  plan: PlanLimits;
}

export interface UsageResponse {
  monitorCount: number;
  checksThisMonth: number;
  alertsToday: number;
  overQuota: boolean;
}

export interface AdminUsageResponse extends UsageResponse {
  userId: string;
  email: string;
  plan: PlanName;
}

export interface PlanContext {
  plan: PlanLimits;
  usage?: UsageResponse;
  monitorCount: number;
  usingFallbackPlan: boolean;
}

// Billing types
export interface BillingOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface BillingVerifyRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface BillingVerifyResponse {
  success: boolean;
  plan: PlanName;
}

// Monitor Types
export interface CreateMonitorRequest {
  name: string;
  url: string;
  intervalMilliseconds: number;
  timeoutMilliseconds: number;
  monitorMethod: "GET" | "POST";
  expectedStatusCode?: number;
  keyword?: string;
  followRedirects?: boolean;
  customHeaders?: Record<string, string>;
}

export interface CreateMonitorResponse {
  id: string;
  name: string;
  url: string;
  active: boolean;
  createdAt: string;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  active: boolean;
  method: "GET" | "POST";
  nextCheckAt: string;
  uptimePercentage: number;
  paused?: boolean;
  quotaBlocked?: boolean;
  currentState?: MonitorHealthState;
  displayState?: MonitorDisplayState;
  createdAt?: string;
}

export type MonitorHealthState = "UNKNOWN" | "UP" | "SUSPECT" | "DOWN";
export type MonitorDisplayState = MonitorHealthState | "PAUSED" | "QUOTA_EXCEEDED";
export type MonitorLogOutcome = "UP" | "DOWN" | "INCONCLUSIVE";

export interface MonitorLog {
  statusCode: number;
  responseTimeInMilli: number;
  errorMessage: string | null;
  checkedAt: string;
  up: boolean;
  outcome?: MonitorLogOutcome;
}

export interface PaginatedResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface MonitorStatus {
  uptimePercentage: number;
  totalChecks: number;
  totalUp: number;
  totalDown: number;
  lastDowntimeAt: string | null;
  lastCheckedAt: string | null;
  up: boolean;
  currentState: MonitorHealthState;
  displayState: MonitorDisplayState;
  quotaBlocked?: boolean;
}

export interface Incident {
  id: string;
  startedAt: string;
  resolvedAt: string | null;
  durationSeconds: number | null;
  failureReason: string | null;
  status: "OPEN" | "RESOLVED";
}

export interface Uptime {
  monitorId: string;
  windowStart: string;
  windowEnd: string;
  uptimePercentage: number | null;
  windowSeconds: number;
  monitoredSeconds: number;
  downSeconds: number;
  pausedSeconds: number;
  gapSeconds: number;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
}

// Action Result Types
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
