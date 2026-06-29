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
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Logo size={36} />
          <span className="font-display text-lg font-bold tracking-widest text-cs-ink group-hover:text-cs-blue transition-colors">
            CSDESIGNS
          </span>
        </Link>
        <nav className="flex items-center gap-10">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/portfolio" className={linkClass}>Portfolio</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
