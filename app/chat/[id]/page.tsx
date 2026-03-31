'use client';

import { useEffect, useState, use } from 'react';
import { useChat } from 'ai/react';
import { Message } from 'ai';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Bot, Send, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [position, setPosition] = useState('');
  const [level, setLevel] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/');

      // Отримуємо дані співбесіди
      const { data: interview } = await supabase
        .from('interviews').select('position, level').eq('id', id).single();
      
      if (interview) {
        setPosition(interview.position);
        setLevel(interview.level);
      }

      // Отримуємо історію
      const { data: msgs } = await supabase
        .from('messages').select('role, content, id').eq('interview_id', id).order('created_at', { ascending: true });

      if (msgs) {
        setInitialMessages(msgs.map(m => ({
          id: m.id,
          role: m.role as Message['role'],
          content: m.content
        })));
      }
      setInitialLoading(false);
    };
    loadData();
  }, [id, router]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: { interviewId: id, position, level },
    initialMessages,
  });

  if (initialLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Завантаження...</div>;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Navbar />
      <div className="bg-card border-b border-border px-6 py-2 flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-xs text-foreground/50 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Назад
        </button>
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase">{position}</h2>
          <p className="text-[9px] text-foreground/40 font-bold uppercase">Рівень: {level}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pl-4 py-4 space-y-6 max-w-4xl w-full mx-auto custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary text-white' : 'bg-card border border-border'}`}>
                {m.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-xl shadow-sm text-sm ${m.role === 'user' ? 'bg-primary text-white' : 'bg-card border border-border'}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-foreground/30 animate-pulse">AI друкує...</div>}
      </div>

      <footer className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <input className="flex-1 bg-card border border-border p-3 rounded-lg outline-none text-sm" value={input} onChange={handleInputChange} placeholder="Ваша відповідь..." />
          <button type="submit" disabled={isLoading || !input} className="bg-primary text-white p-3 rounded-lg disabled:opacity-30">
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </footer>
    </div>
  );
}
