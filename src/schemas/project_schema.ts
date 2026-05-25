import { z } from "zod";

export const ProjectIdSchema = z.object({
    projectId: z.uuidv4()
});

export type ProjectIdInput = z.infer<typeof ProjectIdSchema>

export const GetProjectsQuerySchema = z.object({
    pageIndex: z.coerce.number().int()
        .min(1, { error: "Page index has to be 1 or higher" })
        .max(214748363, { error: "Page index cannot be higher than 214748363" })
        .optional()
        .default(1),
    pageSize: z.coerce.number().int()
        .min(5, { error: "Page size cannot be lower than 5" })
        .max(50, { error: "Page size cannot be higher than 50" })
        .optional()
        .default(10),
    categoryId: z.string().optional().default(""),
    searchTerm: z.string().trim().max(100).optional().default(""),
    location: z.string().trim().max(256).optional().default(""),
    startDate: z.string().trim().optional().default(""),
    orderBy: z.enum(["newest", "soonest"]).optional().default("newest")
});

export type GetProjectsQueryInput = z.infer<typeof GetProjectsQuerySchema>

export const GetProjectVolunteersQuerySchema = z.object({
    pageIndex: z.coerce.number().int()
        .min(1, { error: "Page index has to be 1 or higher" })
        .max(214748363, { error: "Page index cannot be higher than 214748363" })
        .optional()
        .default(1),
    pageSize: z.coerce.number().int()
        .min(5, { error: "Page size cannot be lower than 5" })
        .max(50, { error: "Page size cannot be higher than 50" })
        .optional()
        .default(10),
    searchTerm: z.string().trim().max(100).optional().default(""),
    statusFilter: z.enum(["all", "confirmed", "cancelled"]).optional().default("all")
});

export type GetProjectVolunteersQueryInput = z.infer<typeof GetProjectVolunteersQuerySchema>