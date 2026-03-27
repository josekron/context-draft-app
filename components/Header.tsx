import { TerminalSquare } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-5 px-8 bg-white border-b border-[var(--color-surface)]">
      <div className="flex items-center gap-3 text-[var(--color-primary)] font-bold text-xl tracking-tight">
        <TerminalSquare className="text-[var(--color-accent)]" size={28} />
        Context Draft
      </div>
      <div className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
        AI Architect
      </div>
    </header>
  );
}
