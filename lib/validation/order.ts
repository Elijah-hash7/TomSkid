import { z } from "zod"

export const orderFormSchema = z.object({
  plan_id: z.string().uuid(),
  full_name: z.string().min(2, "Enter your full name"),
  state: z.string().min(2, "State is required"),
  phone_model: z.string().min(1, "Phone model is required"),
  zip_code: z.string().min(3, "ZIP code is required"),
  imei: z.string().min(14, "IMEI looks too short"),
  email: z.string().email("Valid email required"),
})

export const paymentReferenceSchema = z.string().regex(
  /^TSK-\d{8}-[A-Z0-9]{4}$/,
  "Invalid payment reference"
)

export type OrderFormValues = z.infer<typeof orderFormSchema>
