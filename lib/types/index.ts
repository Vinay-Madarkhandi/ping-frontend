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
  emailVerified: boolean;
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
export type MonitorKind = "HTTP" | "HEARTBEAT";

export interface CreateMonitorRequest {
  name: string;
  /** Required for HTTP monitors; omitted for HEARTBEAT monitors (which have no URL). */
  url?: string;
  intervalMilliseconds: number;
  timeoutMilliseconds: number;
  monitorMethod?: "GET" | "POST";
  kind?: MonitorKind;
  /** HEARTBEAT only: extra time past the interval before a missed ping counts as DOWN. */
  gracePeriodMilliseconds?: number;
  expectedStatusCode?: number;
  keyword?: string;
  followRedirects?: boolean;
  customHeaders?: Record<string, string>;
  tags?: string[];
}

export interface CreateMonitorResponse {
  id: string;
  name: string;
  url: string | null;
  active: boolean;
  createdAt: string;
  kind: MonitorKind;
  /** The URL to ping. Present only for HEARTBEAT monitors. */
  heartbeatUrl: string | null;
}

export interface Monitor {
  id: string;
  name: string;
  /** Null for HEARTBEAT monitors, which have no URL to probe. */
  url: string | null;
  active: boolean;
  method: "GET" | "POST" | null;
  nextCheckAt: string;
  uptimePercentage: number;
  createdAt: string;
  paused: boolean;
  quotaBlocked: boolean;
  currentState: MonitorHealthState;
  displayState: MonitorDisplayState;
  intervalMilliseconds: number;
  timeoutMilliseconds: number;
  tags: string[];
  /** Null for HTTP monitors or before the first successful TLS handshake. */
  sslCertExpiresAt: string | null;
  kind: MonitorKind;
  /** The URL an external job pings to report itself alive. Only present for HEARTBEAT monitors. */
  heartbeatUrl: string | null;
  /** HEARTBEAT only: extra time past the interval before a missed ping counts as DOWN. */
  gracePeriodMilliseconds: number;
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
  quotaBlocked: boolean;
  /** Null for HTTP monitors or before the first successful TLS handshake. */
  sslCertExpiresAt: string | null;
  /** Convenience for the UI; null whenever sslCertExpiresAt is null. Can be negative if expired. */
  sslDaysRemaining: number | null;
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

export interface AlertDelivery {
  id: string;
  monitorId: string;
  monitorName: string;
  recipient: string;
  subject: string;
  alertType: "DOWN" | "RECOVERY";
  status: "PENDING" | "SENT" | "FAILED";
  attempts: number;
  lastError?: string;
  createdAt: string;
  sentAt?: string;
}

// Status Page Types
export interface StatusPageMonitorSummary {
  id: string;
  name: string;
}

export interface StatusPage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  monitors: StatusPageMonitorSummary[];
}

export interface StatusPageRequest {
  title: string;
  description?: string;
  slug: string;
  monitorIds: string[];
}

export type PublicMonitorState = "UP" | "SUSPECT" | "DOWN" | "PAUSED" | "UNKNOWN";

export interface PublicMonitorStatus {
  name: string;
  state: PublicMonitorState;
  uptimePercentage90d: number | null;
}

export type OverallStatus = "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE";

export interface PublicStatusPage {
  title: string;
  description: string | null;
  overallStatus: OverallStatus;
  monitors: PublicMonitorStatus[];
  updatedAt: string;
}

// Alert Channel Types
export type AlertChannelType = "WEBHOOK" | "SLACK" | "DISCORD";

export interface AlertChannel {
  id: string;
  type: AlertChannelType;
  name: string;
  targetUrl: string;
  active: boolean;
  createdAt: string;
}

export interface AlertChannelRequest {
  type: AlertChannelType;
  name: string;
  targetUrl: string;
}

export interface AlertChannelTestResult {
  success: boolean;
  message: string;
}

// Maintenance Window Types
export interface MaintenanceWindow {
  id: string;
  title: string | null;
  startsAt: string;
  endsAt: string;
  /** True once the worker has actually paused the monitor for this window (start time reached). */
  active: boolean;
  /** True once the window has ended and the monitor (if paused by it) has been resumed. */
  completed: boolean;
  createdAt: string;
}

export interface MaintenanceWindowRequest {
  title?: string;
  startsAt: string;
  endsAt: string;
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
