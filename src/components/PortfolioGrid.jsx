import { useState, useMemo } from "react";
import { categories, projects } from "../data/portfolio.js";
import Lightbox from "./Lightbox.jsx";

export default function PortfolioGrid() {
  const [filter, setFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);

  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  const activeProject = activeIndex != null ? filtered[activeIndex] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-4 py-2 font-mono text-xs tracking-widest uppercase border transition-all ${
              filter === c.id
                ? "border-cs-cyan text-cs-cyan shadow-cyan"
                : "border-cs-line text-cs-muted hover:border-cs-cyan/50 hover:text-cs-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIndex(i)}
            className="group relative aspect-square overflow-hidden border border-cs-line bg-cs-panel hover:border-cs-cyan transition-all hover:shadow-cyan text-left"
          >
            <img
              src={p.image}
              alt={p.title}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cs-bg via-cs-bg/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-cs-cyan mb-1">
                {categories.find((c) => c.id === p.category)?.label}
              </div>
              <div className="font-display font-bold text-lg tracking-wide text-cs-ink">
                {p.title}
              </div>
            </div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-cs-cyan opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: "0 0 8px #00f0ff" }} />
          </button>
        ))}
      </div>

      <Lightbox
        project={activeProject}
        onClose={() => setActiveIndex(null)}
        onPrev={() => setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length)}
        onNext={() => setActiveIndex((i) => (i + 1) % filtered.length)}
      />
    </div>
  );
}
