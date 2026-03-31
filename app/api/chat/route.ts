import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge'; 
export const maxDuration = 30; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { messages, interviewId, position, level } = await req.json();

    // 1. Зберігаємо останнє повідомлення користувача в базу (у фоні)
    const lastUserMsg = messages[messages.length - 1];
    supabase.from('messages').insert({
      interview_id: interviewId,
      role: 'user',
      content: lastUserMsg.content,
    }).then();

    // 2. Очищення історії: ШІ вимагає чергування User -> Assistant.
    // Якщо юзер надіслав кілька повідомлень підряд, ми об'єднуємо їх, щоб не було помилки.
    const coreMessages = convertToCoreMessages(messages);

    // 3. Запит до ШІ (використовуємо твою модель зі списку)
    const result = await streamText({
      // @ts-expect-error cuzz i dont give a fuck
      model: google('gemini-3-flash-preview'), 
      messages: coreMessages,
      system: `Ти професійний рекрутер. Посада: ${position}. Рівень: ${level}. 
               Став рівно ОДНЕ питання за раз. Чекай на відповідь. Спілкуйся українською.`,
      onFinish: async (event) => {
        // Зберігаємо відповідь AI в базу
        await supabase.from('messages').insert({
          interview_id: interviewId,
          role: 'assistant',
          content: event.text,
        }).then();
      },
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("CRITICAL AI ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
