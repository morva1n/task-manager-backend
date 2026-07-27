import {z} from "zod";

export const taskSchema = z.object({
    name: z.string().min(3, 'Task title must be at least 3 characters long.').max(50, 'Task title must not exceed 50 characters.'),
    description: z.string().max(500, 'Description must not exceed 1000 characters.')
})