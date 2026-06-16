import { google } from '@ai-sdk/google';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a romantic Nepal travel expert helping a couple plan magical date experiences. Suggest specific, heartfelt, Nepal-specific date ideas. Be warm, personal, and specific to Nepal's landscapes, culture, food, and seasons. They arrive June 28 and stay for 2 months. Locations include Kathmandu, Pokhara, Chitwan, and trekking regions.

For each request, suggest 2-3 distinct date ideas using this exact structure:

### {Idea title with emoji}
**What to do:** 1-2 short paragraphs, sensory and specific.
**Best time of day:** When most magical and why.
**What to bring:** Short bullet list.
**Why it's special:** One warm sentence.

Tone: thoughtful friend, not tour brochure. Account for monsoon season (late July–August).`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
