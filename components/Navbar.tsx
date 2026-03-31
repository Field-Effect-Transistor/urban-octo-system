'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Droplet, LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Функція виходу
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Повертаємо на форму логіну
  };

  return (
    <nav className="w-full bg-card border-b border-border py-4 px-6 flex items-center justify-between">
      {/* Логотип */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
          AI
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">Interviewer</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Перемикач тем */}
        <div className="flex items-center bg-background border border-border rounded-full p-1">
          <button
            onClick={() => setTheme('light')}
            className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-border text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
            title="Світла тема"
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-border text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
            title="Темна тема"
          >
            <Moon size={16} />
          </button>
          <button
            onClick={() => setTheme('blue')}
            className={`p-2 rounded-full transition-colors ${theme === 'blue' ? 'bg-border text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
            title="Блакитна тема"
          >
            <Droplet size={16} />
          </button>
        </div>

        {/* Кнопка виходу */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Вийти</span>
        </button>
      </div>
    </nav>
  );
}
