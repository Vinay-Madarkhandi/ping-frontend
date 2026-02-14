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

// Monitor Types
export interface CreateMonitorRequest {
  name: string;
  url: string;
  intervalMilliseconds: number;
  timeoutMilliseconds: number;
  monitorMethod: "GET" | "POST" | "HEAD";
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  active: boolean;
  method: "GET" | "POST" | "HEAD";
  nextCheckAt: string;
  uptimePercentage: number;
  createdAt?: string; // Optional - only returned by create endpoint
}

export interface MonitorLog {
  statusCode: number;
  responseTimeInMilli: number;
  errorMessage: string | null;
  checkedAt: string;
  up: boolean;
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
  lastCheckedAt: string;
  up: boolean;
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
}

