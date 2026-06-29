import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";

const linkClass = ({ isActive }) =>
  `font-mono text-xs tracking-[0.2em] uppercase transition-all ${
    isActive
      ? "text-cs-blue glow-blue"
      : "text-cs-muted hover:text-cs-blue"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cs-bg/80 border-b border-cs-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <Logo size={32} />
          <span className="hidden xs:inline font-display text-sm sm:text-lg font-bold tracking-widest text-cs-ink group-hover:text-cs-blue transition-colors truncate">
            CSDESIGNS
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-8 md:gap-10">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/portfolio" className={linkClass}>Portfolio</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
