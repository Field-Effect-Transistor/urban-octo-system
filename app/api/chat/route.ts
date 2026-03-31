import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';
import { createClient } from '@supabase/supabase-js';

// Дозволяємо тривалі запити для AI
export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { messages, interviewId, position, level } = await req.json();

    // 1. Зберігаємо повідомлення користувача в БД
    await supabase.from('messages').insert({
      interview_id: interviewId,
      role: 'user',
      content: messages[messages.length - 1].content,
    });

    // 2. Запит до AI з моделлю 'latest'
    const result = await streamText({
      // @ts-ignore
      model: google('gemini-3-flash-preview'), 
      messages: convertToCoreMessages(messages),
      system: `Ти рекрутер. Посада: ${position}, Рівень: ${level}. Став по 1 питанню.`,
      onFinish: async (event) => {
        // 3. Зберігаємо відповідь AI після завершення
        await supabase.from('messages').insert({
          interview_id: interviewId,
          role: 'assistant',
          content: event.text,
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Помилка в API:", error);
    return new Response(JSON.stringify({ error: "Помилка сервера" }), { status: 500 });
  }
}
