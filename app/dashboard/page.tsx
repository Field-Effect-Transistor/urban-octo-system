'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import NewInterviewModal from '@/components/NewInterviewModal';
import { Trash2, Loader2, MessageSquare } from 'lucide-react'; // Додали іконки

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
  const [deletingId, setDeletingId] = useState<string | null>(null); // Стан для лоадера видалення

  const initDashboard = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setUserId(session.user.id);

    const { data } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setInterviews(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    initDashboard();
  }, [initDashboard]);

  // ФУНКЦІЯ ВИДАЛЕННЯ
  const deleteInterview = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Щоб не спрацював перехід у чат при кліку на кошик
    
    if (!confirm('Ви впевнені, що хочете видалити цю співбесіду та всю історію чату?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Оновлюємо локальний стан, прибираючи видалений елемент
      setInterviews(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Помилка видалення:', error);
      alert('Не вдалося видалити співбесіду.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Завантаження...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Мої співбесіди</h1>
            <p className="text-foreground/60 mt-1">Керуйте вашими тренуваннями</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-all shadow-lg active:scale-95"
          >
            + Нова співбесіда
          </button>
        </div>

        {interviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <div 
                key={interview.id}
                onClick={() => router.push(`/chat/${interview.id}`)}
                className="bg-card border border-border p-5 rounded-xl cursor-pointer hover:border-primary/50 hover:shadow-xl transition-all group relative"
              >
                {/* КНОПКА ВИДАЛЕННЯ */}
                <button
                  onClick={(e) => deleteInterview(e, interview.id)}
                  className="absolute top-4 right-4 p-2 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  disabled={deletingId === interview.id}
                >
                  {deletingId === interview.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>

                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-0.5 bg-background text-[10px] font-bold rounded border border-border text-foreground/60 uppercase">
                    {interview.level}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-1 pr-8 truncate">
                  {interview.position}
                </h3>
                
                <div className="flex items-center justify-between mt-6">
                   <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-medium">
                      <MessageSquare size={14} />
                      <span>Переглянути чат</span>
                   </div>
                   <span className="text-[10px] text-foreground/30">
                      {new Date(interview.created_at).toLocaleDateString()}
                   </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full p-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-card">
            <h3 className="text-xl font-semibold text-foreground mb-2">Список порожній</h3>
            <p className="text-foreground/40 max-w-xs text-sm">Створіть першу сесію, щоб почати практику.</p>
          </div>
        )}
      </main>

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
