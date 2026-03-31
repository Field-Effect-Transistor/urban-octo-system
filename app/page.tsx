'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';

export default function LandingPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  // Перевірка, чи ми вже залогінені
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Якщо токен є в пам'яті - кидаємо на Дашборд
        router.push('/dashboard');
      } else {
        // Якщо токена немає - показуємо форму логіну
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  // Показуємо пустий екран на долю секунди, поки йде перевірка сесії (щоб форма не блимала)
  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Завантаження...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      
      {/* Текстовий блок Лендінгу */}
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground tracking-tight">
          AI Interviewer
        </h1>
        <p className="text-lg text-foreground/70">
          Прокачай свої навички проходження технічних співбесід за допомогою штучного інтелекту.
        </p>
      </div>

      {/* Наш новий компонент форми */}
      <AuthForm />

    </main>
  );
}
