import { useEffect, useRef, useState } from "react";

export default function MusicToggle({ src = "/subbedup.mp3", volume = 0.4 }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        await a.play();
        setPlaying(true);
      } catch {
        // browser blocked autoplay; user just needs to click again
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        className="fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full bg-cs-bg border border-cs-blue text-cs-blue font-mono flex items-center justify-center hover:bg-cs-blue hover:text-cs-bg transition-all shadow-blue hover:shadow-blue-strong"
        style={playing ? { animation: "pulse-blue 2s ease-in-out infinite" } : undefined}
      >
        {playing ? (
          <span className="flex gap-[3px]">
            <span className="w-[3px] h-4 bg-current" />
            <span className="w-[3px] h-4 bg-current" />
          </span>
        ) : (
          <span className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[10px] border-l-current ml-1" />
        )}
      </button>
      <style>{`@keyframes pulse-blue {
        0%, 100% { box-shadow: 0 0 0 1px rgba(125, 211, 252, 0.4), 0 0 16px rgba(125, 211, 252, 0.3); }
        50% { box-shadow: 0 0 0 1px rgba(125, 211, 252, 0.8), 0 0 32px rgba(125, 211, 252, 0.6); }
      }`}</style>
    </>
  );
}
