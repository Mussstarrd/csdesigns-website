import { Link } from "react-router-dom";
import Slideshow from "../components/Slideshow.jsx";

const showcase = [
  {
    n: "01",
    label: "Digital Art & Illustrations",
    desc: "Explore our collection of digital art and illustrations, each crafted with meticulous attention to detail to enhance visual storytelling and captivate the audience.",
    interval: 5000,
    slides: [
      { src: "/assets/cs-logo.png", contain: true },
      { src: "/portfolio/Screenshot 2026-06-28 153855.png" },
      { src: "/portfolio/Screenshot (15).png" },
    ],
  },
  {
    n: "02",
    label: "Brand Design & UI/UX",
    desc: "Dive into the world of brand design and UI/UX creations, where every design captures the essence of the brand story and elevates the user experience.",
    interval: 6500,
    slides: [
      { src: "/portfolio/Screenshot (9).png" },
      { src: "/portfolio/Screenshot (10).png" },
      { src: "/portfolio/Screenshot (15).png" },
    ],
  },
  {
    n: "03",
    label: "Event Flyers",
    desc: "From sneaker balls to sundress parties to community events — bold, scroll-stopping flyer design built around the energy of the event.",
    interval: 4500,
    slides: [
      { src: "/portfolio/sneaker-ball.png" },
      { src: "/portfolio/sundress-party.png" },
      { src: "/portfolio/james-franklin.png" },
      { src: "/portfolio/demi-ryan-classic.jpg" },
      { src: "/portfolio/jaida-baby-shower.jpg" },
    ],
  },
  {
    n: "04",
    label: "Photography",
    desc: "Discover our photography portfolio, showcasing intricately designed visual compositions that add depth and authenticity to every project.",
    interval: 5500,
    slides: [
      { src: "/portfolio/Screenshot (11).png" },
      { src: "/portfolio/Screenshot (12).png" },
      { src: "/portfolio/Screenshot (13).png" },
      { src: "/portfolio/Screenshot (14).png" },
      { src: "/assets/headshot.png", contain: true },
    ],
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative cs-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cs-bg pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24 md:py-36 text-center relative">
          <div className="font-mono text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] text-cs-blue mb-5 sm:mb-6 glow-blue">
            // CRE8TIVE SOUL DESIGNS
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            <span className="block text-cs-ink glow-blue">DESIGNED</span>
            <span className="block text-cs-blue glow-blue">WITH SOUL.</span>
          </h1>
          <p className="mt-8 sm:mt-10 text-sm sm:text-base text-cs-muted max-w-2xl mx-auto leading-relaxed">
            Welcome to Cre8tive Soul — digital art, illustrations, brand design, UI/UX, flyer design, and photography.
            Crafted to captivate your audience and tell compelling visual stories.
          </p>
          <div className="mt-4 font-mono text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] text-cs-blue/70">
            "DESIGNED WITH HEART // CREATED WITH SOUL"
          </div>
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
            <Link to="/portfolio" className="px-8 py-3 border border-cs-blue text-cs-blue font-mono text-xs uppercase tracking-[0.25em] hover:bg-cs-blue hover:text-cs-bg transition-all shadow-blue hover:shadow-blue-strong text-center">
              View Portfolio
            </Link>
            <Link to="/contact" className="px-8 py-3 border border-cs-line text-cs-muted font-mono text-xs uppercase tracking-[0.25em] hover:border-cs-blue hover:text-cs-blue transition-all text-center">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* HEADSHOT TICKER BAND */}
      <section className="relative border-y border-cs-line bg-cs-panel/70 py-4 sm:py-6 overflow-hidden">
        <div className="flex gap-3 sm:gap-4 animate-[scroll_30s_linear_infinite]" style={{ width: "max-content" }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0"
              style={{ boxShadow: "0 0 24px rgba(125, 211, 252, 0.45), inset 0 0 0 1px rgba(125, 211, 252, 0.3)" }}
            >
              <img src="/assets/headshot.png" alt="" className="w-full h-full object-cover scale-110" />
            </div>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>

      {/* ABOUT */}
      <section style={{paddingTop:"3.5rem",paddingBottom:"3.5rem",marginTop:"3rem",borderTop:"1px solid rgba(31,44,77,0.6)"}} className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <div className="font-mono text-xs tracking-[0.4em] text-cs-blue mb-3">// 01 / ABOUT</div>
            <h2 className="font-display text-5xl md:text-6xl font-black tracking-wider glow-blue">ABOUT</h2>
            <div className="w-20 h-px bg-cs-blue mt-6 shadow-blue" />
          </div>
          <div className="text-cs-muted leading-relaxed space-y-4">
            <p>
              At Cre8tive Soul, our focus is on delivering exceptional graphic design artistry.
              With expertise in digital art, illustrations, brand design, and UI/UX design,
              we bring a profound understanding of visual storytelling to every project.
            </p>
            <p>
              Our portfolio showcases visually stunning and conceptually sound creations that
              inspire and guide the creative process. We have a passion for defining and shaping
              brand identities through our artistry.
            </p>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SHOWCASE */}
      <section style={{paddingTop:"3.5rem",paddingBottom:"3.5rem",marginTop:"3rem",borderTop:"1px solid rgba(31,44,77,0.6)"}} className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="mb-10 md:mb-16">
          <div className="font-mono text-xs tracking-[0.4em] text-cs-blue mb-3">// 02 / SHOWCASE</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-wider">PORTFOLIO SHOWCASE</h2>
          <div className="w-20 h-px bg-cs-blue mt-6 shadow-blue" />
        </div>

        <div className="space-y-16 md:space-y-20">
          {showcase.map((s, i) => (
            <div key={s.n} className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="md:col-span-5">
                <div className="font-mono text-xs text-cs-blue tracking-widest mb-3">{s.n}</div>
                <h3 className="font-display font-bold text-2xl md:text-3xl tracking-wide mb-4 leading-tight">
                  {s.label}
                </h3>
                <p className="text-cs-muted text-sm leading-relaxed">{s.desc}</p>
                <Link
                  to="/portfolio"
                  className="inline-block mt-6 font-mono text-xs uppercase tracking-[0.25em] text-cs-blue hover:glow-blue transition-all border-b border-cs-blue/40 hover:border-cs-blue pb-1"
                >
                  Explore ▸
                </Link>
              </div>
              <div className="md:col-span-7">
                <Slideshow slides={s.slides} interval={s.interval} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section style={{paddingTop:"3.5rem",paddingBottom:"3.5rem",marginTop:"3rem",borderTop:"1px solid rgba(31,44,77,0.6)"}} className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <div className="font-mono text-xs tracking-[0.4em] text-cs-blue mb-3">// 03 / CONNECT</div>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-wider mb-6 glow-blue">
              GET IN TOUCH
            </h2>
            <div className="w-20 h-px bg-cs-blue mb-8 shadow-blue" />
            <p className="text-cs-muted leading-relaxed max-w-md">
              Ready to bring your creative visions to life? Reach out for collaborations,
              inquiries, or to discuss how we can help you achieve your design goals.
            </p>
            <div className="mt-10 space-y-3 font-mono text-sm">
              <div className="flex gap-4"><span className="text-cs-blue">▸</span><span className="text-cs-muted">hello@csdesigns.example</span></div>
              <div className="flex gap-4"><span className="text-cs-blue">▸</span><span className="text-cs-muted">LinkedIn / Behance</span></div>
            </div>
          </div>

          <form
            className="space-y-5 p-8 border border-cs-line bg-cs-panel/80 backdrop-blur-sm"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const subject = encodeURIComponent(`Inquiry from ${data.get("first")} ${data.get("last")}`);
              const body = encodeURIComponent(data.get("message"));
              window.location.href = `mailto:hello@csdesigns.example?subject=${subject}&body=${body}`;
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <Field name="first" label="FIRST NAME" required />
              <Field name="last" label="LAST NAME" required />
            </div>
            <Field name="email" label="EMAIL" type="email" required />
            <Field name="phone" label="PHONE" />
            <Field name="message" label="MESSAGE" textarea required />
            <button type="submit" className="w-full py-3 border border-cs-blue text-cs-blue font-mono text-xs uppercase tracking-[0.25em] hover:bg-cs-blue hover:text-cs-bg transition-all shadow-blue hover:shadow-blue-strong">
              Transmit ▸
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ name, label, type = "text", required, textarea }) {
  const cls = "w-full bg-cs-bg border border-cs-line px-4 py-3 text-cs-ink font-mono text-sm focus:outline-none focus:border-cs-blue focus:shadow-blue transition-all";
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-[0.25em] text-cs-muted block mb-2">
        {label} {required && <span className="text-cs-blue">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} className={`${cls} resize-none`} />
      ) : (
        <input name={name} required={required} type={type} className={cls} />
      )}
    </label>
  );
}
