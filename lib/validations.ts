import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email must be under 254 characters"),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject must be under 150 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Sent alongside the form fields but never shown to people. `hp_check` is a
// hidden field bots tend to fill, and `token` is issued by the API when the
// form loads so it can tell how long the visitor took.
export const spamCheckSchema = z.object({
  hp_check: z.string().optional(),
  token: z.string().optional(),
});
