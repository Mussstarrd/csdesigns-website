import { useState, useEffect, useCallback, useMemo } from "react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Slideshow({ slides: raw, interval = 5000, randomize = false }) {
  const slides = useMemo(() => (randomize ? shuffle(raw) : raw), [raw, randomize]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [paused, next, interval]);

  return (
    <div
      className="relative border border-cs-line bg-cs-panel overflow-hidden aspect-[4/5] hover:border-cs-blue/60 hover:shadow-blue transition-all group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
            i === index ? "opacity-95" : "opacity-0"
          }`}
        >
          <img
            src={s.src}
            alt=""
            className={s.contain ? "max-h-[85%] max-w-[70%] object-contain" : "max-w-full max-h-full object-contain"}
            style={s.contain ? { filter: "drop-shadow(0 0 24px rgba(125, 211, 252, 0.5))" } : undefined}
          />
        </div>
      ))}

      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 border border-cs-blue/50 bg-cs-bg/70 backdrop-blur-sm text-cs-blue font-mono text-lg opacity-0 group-hover:opacity-100 hover:bg-cs-blue hover:text-cs-bg transition-all"
      >‹</button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 border border-cs-blue/50 bg-cs-bg/70 backdrop-blur-sm text-cs-blue font-mono text-lg opacity-0 group-hover:opacity-100 hover:bg-cs-blue hover:text-cs-bg transition-all"
      >›</button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all ${
              i === index ? "bg-cs-blue shadow-blue" : "bg-cs-line hover:bg-cs-blue/60"
            }`}
          />
        ))}
      </div>

      <div className="absolute top-3 right-3 w-2 h-2 bg-cs-blue" style={{ boxShadow: "0 0 8px #7dd3fc" }} />
    </div>
  );
}
