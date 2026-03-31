import { google } from '@ai-sdk/google';
import { generateText, convertToCoreMessages } from 'ai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { messages, interviewId } = await req.json();

    // 1. Очищення повідомлень
    const coreMessages = convertToCoreMessages(messages);

    // 2. Генерація аналізу (Твоя стабільна модель)
    const result = await generateText({
      // @ts-expect-error cuzz i dont give a fuck
      model: google('gemini-2.5-flash-lite'), 
      system: "Ти технічний експерт. Проаналізуй історію співбесіди. Напиши сильні сторони, помилки та оцінку 0-100%. Спілкуйся українською.",
      messages: coreMessages,
    });

    // ФІКС: якщо Google повернув пустий текст, ми не падаємо, а даємо дефолтну відповідь
    const feedbackText = result.text?.trim() || "Аналіз завершено. ШІ не надав розгорнутого тексту, але сесію збережено. Спробуйте надати більше розгорнутих відповідей у наступний раз.";

    // 3. Запис у базу
    await supabase
      .from('interviews')
      .update({ feedback: feedbackText })
      .eq('id', interviewId);

    return new Response(JSON.stringify({ feedback: feedbackText }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("DETAILED EVALUATE ERROR:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal Server Error"
    }), { status: 500 });
  }
}
