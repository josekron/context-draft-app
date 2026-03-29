import { TerminalSquare } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-5 px-8 bg-surface border-b border-border shadow-sm transition-colors">
      <div className="flex items-center gap-3 text-primary font-bold text-xl tracking-tight transition-colors">
        <TerminalSquare className="text-accent transition-colors" size={28} />
        Context Draft
      </div>
      <ThemeToggle />
    </header>
  );
}


