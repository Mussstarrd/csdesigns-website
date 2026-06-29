import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-cs-line mt-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Logo size={28} />
              <span className="font-display text-2xl font-bold tracking-widest">CSDESIGNS</span>
            </div>
            <p className="font-mono text-xs text-cs-muted tracking-wider">
              DESIGNED WITH HEART // CREATED WITH SOUL
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex gap-6 font-mono text-xs uppercase tracking-widest">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-cs-muted hover:text-cs-blue transition-colors">LinkedIn</a>
              <a href="https://behance.net" target="_blank" rel="noreferrer" className="text-cs-muted hover:text-cs-blue transition-colors">Behance</a>
            </div>
            <div className="text-xs text-cs-muted/60 font-mono">
              © {new Date().getFullYear()} CSDESIGNS // ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
