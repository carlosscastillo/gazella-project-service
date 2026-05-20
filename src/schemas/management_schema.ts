import { z } from "zod";

const isoDateString = z.string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be in YYYY-MM-DD format" });

export const CreateProjectSchema = z.object({
    title: z.string()
        .trim().min(1).max(128, { error: "Title cannot be longer than 128 characters" }),
    description: z.string()
        .trim().min(1).max(2000, { error: "Description cannot be longer than 2000 characters" }),
    coverUri: z.url().trim().optional(),
    location: z.string()
        .trim().min(1).max(256, { error: "Location cannot be longer than 256 characters" }),
    categoryId: z.uuidv4(),
    organizerId: z.uuidv4(),
    organizerName: z.string()
        .trim().max(64, { error: "Organizer name cannot be longer than 64 characters" }),
    organizerPfpUri: z.url().trim().optional(),
    startDate: isoDateString,
    endDate: isoDateString,
    maxVolunteers: z.int()
        .min(1, { error: "Max volunteers must be at least 1" })
        .max(10000, { error: "Max volunteers cannot exceed 10000" })
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export const UpdateProjectSchema = z.object({
    title: z.string()
        .trim().min(1).max(128, { error: "Title cannot be longer than 128 characters" }),
    description: z.string()
        .trim().min(1).max(2000, { error: "Description cannot be longer than 2000 characters" }),
    coverUri: z.url().trim().optional(),
    location: z.string()
        .trim().min(1).max(256, { error: "Location cannot be longer than 256 characters" }),
    categoryId: z.uuidv4(),
    startDate: isoDateString,
    endDate: isoDateString,
    maxVolunteers: z.int()
        .min(1, { error: "Max volunteers must be at least 1" })
        .max(10000, { error: "Max volunteers cannot exceed 10000" })
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>