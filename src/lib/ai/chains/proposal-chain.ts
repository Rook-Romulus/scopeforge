import { anthropic, AI_MODEL } from "@/lib/ai/client";
import { ProposalGenerationSchema, type ProposalGeneration } from "@/lib/ai/schemas/scope";

const SYSTEM_PROMPT = `You are an expert digital agency consultant who specializes in creating detailed project proposals and scope documents. Your proposals are known for being accurate, thorough, and winning clients.

When given a client brief, you will:
1. Analyze the requirements carefully
2. Break down the work into clear, billable scope items
3. Estimate realistic effort hours for each item
4. Create a logical project timeline
5. Write professional proposal copy that clearly communicates value

You always respond with valid JSON matching the requested schema exactly. Do not include markdown, code blocks, or any text outside the JSON object.`;

export async function generateProposal(
  brief: string,
  brandContext?: { companyName?: string; defaultTerms?: string; hourlyRate?: number }
): Promise<ProposalGeneration> {
  const hourlyRate = brandContext?.hourlyRate ?? 150;
  const companyName = brandContext?.companyName ?? "our agency";

  const userPrompt = `Generate a complete project proposal for the following client brief. Calculate costs at $${hourlyRate}/hour.

CLIENT BRIEF:
${brief}

AGENCY: ${companyName}

Respond with a JSON object matching this exact structure:
{
  "title": "Project title (concise, professional)",
  "executiveSummary": "2-3 paragraph overview of the project and our approach",
  "problemStatement": "Clear articulation of the client's problem or opportunity",
  "proposedSolution": "Our solution approach, methodology, and why we're the right fit",
  "scopeItems": [
    {
      "name": "Deliverable name",
      "description": "What's included",
      "phase": "Phase name (e.g., Discovery, Design, Development, QA, Launch)",
      "effortHours": 40,
      "cost": 6000
    }
  ],
  "timeline": [
    {
      "name": "Phase name",
      "durationWeeks": 2,
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  ],
  "totalHours": 200,
  "totalCost": 30000,
  "currency": "USD",
  "termsAndConditions": "Standard payment terms, revision policy, etc.",
  "nextSteps": "What happens after client approval"
}

Be realistic with estimates. Include 10-15 scope items. Create 3-5 timeline phases.`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  // Extract JSON from response (handle cases where model wraps in code blocks)
  let jsonText = content.text.trim();
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonText = jsonMatch[1].trim();
  // Find first { and last }
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start !== -1 && end !== -1) jsonText = jsonText.slice(start, end + 1);

  const parsed = JSON.parse(jsonText);
  return ProposalGenerationSchema.parse(parsed);
}

export async function* streamProposalGeneration(
  brief: string,
  brandContext?: { companyName?: string; defaultTerms?: string; hourlyRate?: number }
): AsyncGenerator<{ type: "progress" | "complete" | "error"; data: string | ProposalGeneration }> {
  yield { type: "progress", data: "Analyzing client brief..." };

  try {
    yield { type: "progress", data: "Generating scope breakdown..." };
    const result = await generateProposal(brief, brandContext);
    yield { type: "progress", data: "Calculating costs and timeline..." };
    yield { type: "progress", data: "Writing proposal sections..." };
    yield { type: "complete", data: result };
  } catch (error) {
    yield { type: "error", data: error instanceof Error ? error.message : "Generation failed" };
  }
}
