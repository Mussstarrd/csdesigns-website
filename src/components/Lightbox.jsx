import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Lightbox({ project, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  if (!project) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-cs-bg/95 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-cs-line text-cs-blue font-mono text-xl hover:border-cs-blue hover:shadow-blue-strong transition-all"
        aria-label="Previous"
      >‹</button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-cs-line text-cs-blue font-mono text-xl hover:border-cs-blue hover:shadow-blue-strong transition-all"
        aria-label="Next"
      >›</button>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 border border-cs-line text-cs-blue font-mono text-sm hover:border-cs-blue transition-all"
        aria-label="Close"
      >✕</button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl w-full max-h-[85vh] border border-cs-blue/40 shadow-blue-strong bg-cs-panel overflow-hidden flex flex-col"
      >
        <div className="bg-cs-panel-2 border-b border-cs-line px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-bold tracking-wider text-cs-blue glow-blue">{project.title}</div>
            <div className="font-mono text-xs text-cs-muted uppercase tracking-widest mt-1">{project.category}</div>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-cs-bg flex items-center justify-center">
          <img
            src={project.image}
            alt={project.title}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
        {project.blurb && (
          <div className="bg-cs-panel-2 border-t border-cs-line px-6 py-4 text-sm text-cs-muted font-mono">
            {project.blurb}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
