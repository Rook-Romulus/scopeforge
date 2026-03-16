import { z } from "zod";

export const ScopeItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  phase: z.string(),
  effortHours: z.number(),
  cost: z.number(),
});

export const TimelinePhaseSchema = z.object({
  name: z.string(),
  durationWeeks: z.number(),
  deliverables: z.array(z.string()),
});

export const ProposalGenerationSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  problemStatement: z.string(),
  proposedSolution: z.string(),
  scopeItems: z.array(ScopeItemSchema),
  timeline: z.array(TimelinePhaseSchema),
  totalHours: z.number(),
  totalCost: z.number(),
  currency: z.string().default("USD"),
  termsAndConditions: z.string(),
  nextSteps: z.string(),
});

export type ScopeItem = z.infer<typeof ScopeItemSchema>;
export type TimelinePhase = z.infer<typeof TimelinePhaseSchema>;
export type ProposalGeneration = z.infer<typeof ProposalGenerationSchema>;
