import { z } from "zod";

export const RegistrationParamsSchema = z.object({
    projectId: z.uuidv4()
});

export type RegistrationParamsInput = z.infer<typeof RegistrationParamsSchema>