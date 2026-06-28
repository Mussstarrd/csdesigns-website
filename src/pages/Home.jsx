import { Link } from "react-router-dom";

const showcase = [
  {
    n: "01",
    label: "Digital Art & Illustrations",
    desc: "Explore our collection of digital art and illustrations, each crafted with meticulous attention to detail to enhance visual storytelling and captivate the audience.",
    image: "/portfolio/Screenshot 2026-06-28 154053.png",
  },
  {
    n: "02",
    label: "Brand Design & UI/UX",
    desc: "Dive into the world of brand design and UI/UX creations, where every design captures the essence of the brand story and elevates the user experience.",
    image: "/portfolio/Screenshot (10).png",
  },
  {
    n: "03",
    label: "Photography",
    desc: "Discover our photography portfolio, showcasing intricately designed visual compositions that add depth and authenticity to every project.",
    image: "/portfolio/Screenshot (11).png",
  },
];

const tickerImages = [
  "/portfolio/sneaker-ball.jpg",
  "/portfolio/Screenshot (6).png",
  "/portfolio/Screenshot (7).png",
  "/portfolio/Screenshot (8).png",
  "/portfolio/Screenshot (11).png",
  "/portfolio/Screenshot (12).png",
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative cs-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cs-bg pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-28 md:py-36 text-center relative">
          <div className="font-mono text-xs tracking-[0.4em] text-cs-cyan mb-6 glow-cyan">
            // CRE8TIVE SOUL DESIGNS
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            <span className="block text-cs-ink glow-cyan">DESIGNED</span>
            <span className="block text-cs-cyan glow-cyan">WITH SOUL.</span>
          </h1>
          <p className="mt-10 text-cs-muted max-w-2xl mx-auto leading-relaxed">
            Welcome to Cre8tive Soul — digital art, illustrations, brand design, UI/UX, flyer design, and photography.
            Crafted to captivate your audience and tell compelling visual stories.
          </p>
          <div className="mt-4 font-mono text-xs tracking-[0.3em] text-cs-cyan/70">
            "DESIGNED WITH HEART // CREATED WITH SOUL"
          </div>
          <div className="mt-12 flex items-center justify-center gap-4">
            <Link to="/portfolio" className="px-8 py-3 border border-cs-cyan text-cs-cyan font-mono text-xs uppercase tracking-[0.25em] hover:bg-cs-cyan hover:text-cs-bg transition-all shadow-cyan hover:shadow-cyan-strong">
              View Portfolio
            </Link>
            <Link to="/contact" className="px-8 py-3 border border-cs-line text-cs-muted font-mono text-xs uppercase tracking-[0.25em] hover:border-cs-cyan hover:text-cs-cyan transition-all">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* CHARACTER TICKER BAND */}
      <section className="relative border-y border-cs-line bg-cs-panel py-6 overflow-hidden">
        <div className="flex gap-4 animate-[scroll_30s_linear_infinite]" style={{ width: "max-content" }}>
          {[...tickerImages, ...tickerImages, ...tickerImages, ...tickerImages].map((src, i) => (
            <div
              key={i}
              className="w-32 h-32 rounded-full border-2 border-cs-cyan/60 overflow-hidden flex-shrink-0"
              style={{ boxShadow: "0 0 16px rgba(0, 240, 255, 0.3)" }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>

      {/* ABOUT */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="font-mono text-xs tracking-[0.4em] text-cs-cyan mb-3">// 01 / ABOUT</div>
            <h2 className="font-display text-5xl md:text-6xl font-black tracking-wider glow-cyan">ABOUT</h2>
            <div className="w-20 h-px bg-cs-cyan mt-6 shadow-cyan" />
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
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-16">
          <div className="font-mono text-xs tracking-[0.4em] text-cs-cyan mb-3">// 02 / SHOWCASE</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-wider">PORTFOLIO SHOWCASE</h2>
          <div className="w-20 h-px bg-cs-cyan mt-6 shadow-cyan" />
        </div>

        <div className="space-y-16">
          {showcase.map((s, i) => (
            <div key={s.n} className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="md:col-span-5">
                <div className="font-mono text-xs text-cs-cyan tracking-widest mb-3">{s.n}</div>
                <h3 className="font-display font-bold text-2xl md:text-3xl tracking-wide mb-4 leading-tight">
                  {s.label}
                </h3>
                <p className="text-cs-muted text-sm leading-relaxed">{s.desc}</p>
                <Link
                  to="/portfolio"
                  className="inline-block mt-6 font-mono text-xs uppercase tracking-[0.25em] text-cs-cyan hover:glow-cyan transition-all border-b border-cs-cyan/40 hover:border-cs-cyan pb-1"
                >
                  Explore ▸
                </Link>
              </div>
              <div className="md:col-span-7">
                <div className="relative border border-cs-line bg-cs-panel overflow-hidden aspect-video hover:border-cs-cyan/60 hover:shadow-cyan transition-all group">
                  <img src={s.image} alt={s.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 right-3 w-2 h-2 bg-cs-cyan" style={{ boxShadow: "0 0 8px #00f0ff" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GET IN TOUCH (inline contact) */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="font-mono text-xs tracking-[0.4em] text-cs-cyan mb-3">// 03 / CONNECT</div>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-wider mb-6 glow-cyan">
              GET IN TOUCH
            </h2>
            <div className="w-20 h-px bg-cs-cyan mb-8 shadow-cyan" />
            <p className="text-cs-muted leading-relaxed max-w-md">
              Ready to bring your creative visions to life? Reach out for collaborations,
              inquiries, or to discuss how we can help you achieve your design goals.
            </p>
            <div className="mt-10 space-y-3 font-mono text-sm">
              <div className="flex gap-4"><span className="text-cs-cyan">▸</span><span className="text-cs-muted">hello@csdesigns.example</span></div>
              <div className="flex gap-4"><span className="text-cs-cyan">▸</span><span className="text-cs-muted">LinkedIn / Behance</span></div>
            </div>
          </div>

          <form
            className="space-y-5 p-8 border border-cs-line bg-cs-panel"
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
            <button type="submit" className="w-full py-3 border border-cs-cyan text-cs-cyan font-mono text-xs uppercase tracking-[0.25em] hover:bg-cs-cyan hover:text-cs-bg transition-all shadow-cyan hover:shadow-cyan-strong">
              Transmit ▸
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ name, label, type = "text", required, textarea }) {
  const cls = "w-full bg-cs-bg border border-cs-line px-4 py-3 text-cs-ink font-mono text-sm focus:outline-none focus:border-cs-cyan focus:shadow-cyan transition-all";
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-[0.25em] text-cs-muted block mb-2">
        {label} {required && <span className="text-cs-cyan">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} className={`${cls} resize-none`} />
      ) : (
        <input name={name} required={required} type={type} className={cls} />
      )}
    </label>
  );
}
