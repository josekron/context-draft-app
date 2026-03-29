export default function Footer() {
  return (
    <footer className="shrink-0 py-4 px-8 border-t border-border bg-surface shadow-sm transition-colors duration-300">
      <p className="text-center text-xs text-muted-foreground/60">
        Built by{' '}
        <a
          href="https://www.linkedin.com/in/joseantonioherrera/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent/80 font-medium underline underline-offset-2 transition-colors duration-200"
        >
          Jose Antonio Herrera
        </a>
      </p>
    </footer>
  );
}
