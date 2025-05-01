import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages the application's theme state.
 * Features:
 * - Persists theme preference in localStorage
 * - Syncs with system theme preference
 * - Provides smooth transitions between themes
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Disable transitions on initial load to prevent flash
    document.documentElement.style.setProperty('transition', 'none');
    
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    // Re-enable transitions after initial load
    requestAnimationFrame(() => {
      document.documentElement.style.removeProperty('transition');
    });

    // Update document class and meta theme-color
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#09090b' : '#ffffff'
      );
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem("theme") as Theme;
      // Only update if user hasn't set a preference
      if (!savedTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the theme context.
 * Provides theme state and functions to modify it.
 * Used within a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 