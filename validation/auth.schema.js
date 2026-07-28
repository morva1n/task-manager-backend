import {email, z} from "zod";

export const authSchema = z.object({
    email: z.string().trim().email(email),
    password: z.string().trim().min(6, 'Password must be at least 6 characters.').max(20, 'Password must not exceed 20 characters.')
})