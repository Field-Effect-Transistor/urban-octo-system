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

    // 1. Не чекаємо (await) запису в базу повідомлення юзера, 
    // щоб не гаяти час перед стартом AI. Робимо це у фоні.
    supabase.from('messages').insert({
      interview_id: interviewId,
      role: 'user',
      content: messages[messages.length - 1].content,
    }).then(); // .then() запускає запит без блокування основного потоку

    // 2. Використовуємо РЕАЛЬНУ швидку модель: gemini-1.5-flash-latest
    const result = await streamText({
      // @ts-expect-error cuzz i dont give a shit
      model: google('gemini-1.5-flash-latest'), 
      messages: convertToCoreMessages(messages),
      system: `Ти рекрутер. Посада: ${position}, Рівень: ${level}. Став по 1 питанню. Спілкуйся українською.`,
      onFinish: async (event) => {
        // Зберігаємо відповідь AI в базу після завершення
        await supabase.from('messages').insert({
          interview_id: interviewId,
          role: 'assistant',
          content: event.text,
        });
      },
    });

    // 3. Повертаємо стрім. Vercel отримає перші байти миттєво.
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: "AI Connection Failed" }), { status: 500 });
  }
}
