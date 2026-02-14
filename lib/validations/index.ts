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
    .min(10000, "Interval must be at least 10 seconds")
    .max(86400000, "Interval must be at most 24 hours"),
  timeoutMilliseconds: z
    .number()
    .min(1000, "Timeout must be at least 1 second")
    .max(60000, "Timeout must be at most 60 seconds"),
  monitorMethod: z.enum(["GET", "POST", "HEAD"], {
    message: "Please select a valid HTTP method",
  }),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type CreateMonitorInput = z.infer<typeof createMonitorSchema>;

