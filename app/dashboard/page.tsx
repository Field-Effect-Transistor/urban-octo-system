'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import NewInterviewModal from '@/components/NewInterviewModal';

interface Interview {
  id: string;
  position: string;
  level: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      // 1. Перевірка сесії
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }
      
      setUserId(session.user.id);

      // 2. Завантаження історії співбесід користувача
      const { data } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setInterviews(data);
      }
      
      setLoading(false);
    };

    initDashboard();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Завантаження...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 mt-8">
        {/* Заголовок і кнопка створення */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Мої співбесіди</h1>
            <p className="text-foreground/60 mt-1">Історія ваших тренувань та оцінки</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
          >
            + Нова співбесіда
          </button>
        </div>

        {/* Список минулих співбесід */}
        {interviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <div 
                key={interview.id}
                onClick={() => router.push(`/chat/${interview.id}`)}
                className="bg-card border border-border p-5 rounded-xl cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-background text-xs font-semibold rounded text-foreground/70 border border-border">
                    {interview.level}
                  </span>
                  <span className="text-xs text-foreground/40">
                    {new Date(interview.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {interview.position}
                </h3>
                <p className="text-sm text-foreground/50 mt-4 flex items-center">
                  Продовжити чат <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Заглушка, якщо список пустий */
          <div className="w-full p-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-card">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">У вас ще немає співбесід</h3>
            <p className="text-foreground/60 max-w-md">
                Натисніть &quot;+ Нова співбесіда&quot;, оберіть вакансію та рівень складності, щоб почати тренування з AI.
            </p>
          </div>
        )}
      </main>

      {/* Рендеримо модалку (вона прихована, поки isModalOpen === false) */}
      {userId && (
        <NewInterviewModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userId={userId} 
        />
      )}
    </div>
  );
}
