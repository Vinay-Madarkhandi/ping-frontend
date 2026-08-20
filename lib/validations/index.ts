import { z } from "zod";

// Auth Schemas
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "New password must be at most 100 characters"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});

// Monitor Schemas
export const createMonitorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  intervalMilliseconds: z
    .number()
    .positive("Interval must be greater than 0")
    .max(86400000, "Interval must be at most 24 hours"),
  timeoutMilliseconds: z
    .number()
    .positive("Timeout must be greater than 0")
    .max(60000, "Timeout must be at most 60 seconds"),
  monitorMethod: z.enum(["GET", "POST"], {
    message: "Please select a valid HTTP method",
  }),
  expectedStatusCode: z
    .number()
    .int("Expected status code must be a whole number")
    .min(100, "Expected status code must be at least 100")
    .max(599, "Expected status code must be at most 599")
    .optional(),
  keyword: z.string().max(500, "Keyword must be at most 500 characters").optional(),
  followRedirects: z.boolean().optional(),
  customHeaders: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string().max(30, "Tags must be at most 30 characters")).max(10, "At most 10 tags").optional(),
});

export const editMonitorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  intervalMilliseconds: z
    .number()
    .positive("Interval must be greater than 0")
    .max(86400000, "Interval must be at most 24 hours"),
  timeoutMilliseconds: z
    .number()
    .positive("Timeout must be greater than 0")
    .max(60000, "Timeout must be at most 60 seconds"),
  monitorMethod: z.enum(["GET", "POST"], {
    message: "Please select a valid HTTP method",
  }),
  expectedStatusCode: z
    .number()
    .int("Expected status code must be a whole number")
    .min(100, "Expected status code must be at least 100")
    .max(599, "Expected status code must be at most 599")
    .optional(),
  keyword: z.string().max(500, "Keyword must be at most 500 characters").optional(),
  followRedirects: z.boolean().optional(),
  customHeaders: z.record(z.string(), z.string()).optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string().max(30, "Tags must be at most 30 characters")).max(10, "At most 10 tags").optional(),
});

// Heartbeat (cron/job) monitor schemas — no URL to probe; an external job pings Ping instead.
export const createHeartbeatMonitorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  intervalMilliseconds: z
    .number()
    .positive("Expected interval must be greater than 0")
    .max(86400000, "Expected interval must be at most 24 hours"),
  timeoutMilliseconds: z
    .number()
    .positive("Timeout must be greater than 0")
    .max(60000, "Timeout must be at most 60 seconds"),
  gracePeriodMilliseconds: z
    .number()
    .min(0, "Grace period cannot be negative")
    .max(86400000, "Grace period must be at most 24 hours")
    .optional(),
  tags: z.array(z.string().max(30, "Tags must be at most 30 characters")).max(10, "At most 10 tags").optional(),
});

export const editHeartbeatMonitorSchema = createHeartbeatMonitorSchema.extend({
  active: z.boolean().optional(),
});

// Maintenance window schema — start/end come from <input type="datetime-local"> fields (local time,
// no timezone), converted to full ISO instants by the server action before hitting the backend.
export const maintenanceWindowSchema = z
  .object({
    title: z.string().max(200, "Title must be at most 200 characters").optional(),
    startsAt: z.string().min(1, "Start time is required"),
    endsAt: z.string().min(1, "End time is required"),
  })
  .refine((data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(), {
    message: "End time must be after start time",
    path: ["endsAt"],
  });

// Status page schema
export const statusPageSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
  slug: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .max(64, "URL must be at most 64 characters")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "URL can only contain lowercase letters, numbers, and hyphens"),
  monitorIds: z.array(z.string()).min(1, "Select at least one monitor"),
});

// Alert channel schema
export const alertChannelSchema = z.object({
  type: z.enum(["WEBHOOK", "SLACK", "DISCORD"], {
    message: "Please select a channel type",
  }),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  targetUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => url.startsWith("https://") || url.startsWith("http://"),
      "URL must start with http:// or https://"
    ),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateMonitorInput = z.infer<typeof createMonitorSchema>;
export type EditMonitorInput = z.infer<typeof editMonitorSchema>;
export type CreateHeartbeatMonitorInput = z.infer<typeof createHeartbeatMonitorSchema>;
export type EditHeartbeatMonitorInput = z.infer<typeof editHeartbeatMonitorSchema>;
export type StatusPageInput = z.infer<typeof statusPageSchema>;
export type AlertChannelInput = z.infer<typeof alertChannelSchema>;
export type MaintenanceWindowInput = z.infer<typeof maintenanceWindowSchema>;
