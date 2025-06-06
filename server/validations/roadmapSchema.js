import { z } from 'zod';

export const roadmapGenerateSchema = z.object({
  skills: z.array(z.string()).nonempty('At least one skill is required'),
  goal: z.string().min(3),
});

export const roadmapUpdateSchema = z.object({
  title: z.string().min(5),
});

