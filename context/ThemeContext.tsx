'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'blue';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. Ініціалізуємо стан, безпечно читаючи з localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app-theme') as Theme;
      if (savedTheme) return savedTheme;
    }
    return 'light'; // За замовчуванням
  });

  // 2. Відстежуємо зміни теми, оновлюємо DOM та зберігаємо
  useEffect(() => {
    const body = document.body;
    
    // Очищаємо старі класи (потрібно для зміни тем)
    body.classList.remove('theme-dark', 'theme-blue');
    
    // Додаємо новий клас (якщо тема не light)
    if (theme !== 'light') {
      body.classList.add(`theme-${theme}`);
    }
    
    // Зберігаємо вибір (виконується тільки на клієнті)
    localStorage.setItem('app-theme', theme);
  }, [theme]); // Запускається тільки при зміні `theme`

  // 3. Рендеримо контекст
  // Щоб Next.js не сварився на розбіжність між сервером і клієнтом (hydration mismatch),
  // ми не використовуємо mounted-перевірку, а просто рендеримо дітей одразу.
  // CSS класи застосуються миттєво після першого рендеру завдяки useEffect.
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Хук для швидкого доступу до теми
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
