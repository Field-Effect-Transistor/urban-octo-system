'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function NewInterviewModal({ isOpen, onClose, userId }: ModalProps) {
  const [position, setPosition] = useState('');
  const [level, setLevel] = useState('Junior');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim()) return;
    
    setLoading(true);

    try {
      // 1. Зберігаємо нову співбесіду в таблицю 'interviews'
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          user_id: userId,
          position: position.trim(),
          level: level,
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Якщо успішно - перекидаємо в кімнату чату
      if (data) {
        router.push(`/chat/${data.id}`);
      }
    } catch (error) {
      console.error('Помилка створення співбесіди:', error);
      alert('Не вдалося створити співбесіду. Перевірте консоль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden">
        
        {/* Шапка модалки */}
        <div className="flex justify-between items-center p-6 border-b border-border bg-background">
          <h2 className="text-xl font-bold text-foreground">Нова співбесіда</h2>
          <button 
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">
              Посада (Vacancy)
            </label>
            <input
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Напр. Frontend Developer"
              className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">
              Рівень складності
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Junior', 'Middle', 'Senior'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-1 text-sm font-medium rounded-md border transition-all ${
                    level === lvl 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-background text-foreground/70 border-border hover:border-primary/50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-foreground/50">
              Це вплине на складність питань від ШІ.
            </p>
          </div>

          {/* Кнопка дії */}
          <button
            type="submit"
            disabled={loading || !position.trim()}
            className="w-full mt-4 flex items-center justify-center py-3 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {loading ? 'Створення...' : 'Почати співбесіду'}
          </button>
        </form>
      </div>
    </div>
  );
}
