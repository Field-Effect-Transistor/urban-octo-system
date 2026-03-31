import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';
import { createClient } from '@supabase/supabase-js';

// ЦЕ ВИПРАВИТЬ ПОМИЛКУ 504:
export const runtime = 'edge'; // Використовуємо швидкий Edge Runtime
export const maxDuration = 30; // Встановлюємо ліміт у 30 секунд

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { messages, interviewId, position, level } = await req.json();

    // Зберігаємо повідомлення користувача
    await supabase.from('messages').insert({
      interview_id: interviewId,
      role: 'user',
      content: messages[messages.length - 1].content,
    });

    const result = await streamText({
      // @ts-expect-error cuzz i dont give a shit
      model: google('gemini-3-flash-preview'), 
      messages: convertToCoreMessages(messages),
      system: `Ти рекрутер. Посада: ${position}, Рівень: ${level}. Став по 1 питанню.`,
      onFinish: async (event) => {
        // Зберігаємо відповідь AI
        await supabase.from('messages').insert({
          interview_id: interviewId,
          role: 'assistant',
          content: event.text,
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Vercel Edge Error:", error);
    return new Response(JSON.stringify({ error: "Timeout or Connection Error" }), { status: 504 });
  }
}
