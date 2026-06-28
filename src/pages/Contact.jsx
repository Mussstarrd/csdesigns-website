export default function Contact() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div>
          <div className="font-mono text-xs tracking-[0.4em] text-cs-cyan mb-4">// CONNECT</div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-wider mb-6 glow-cyan">
            GET IN TOUCH
          </h1>
          <div className="w-20 h-px bg-cs-cyan mb-8 shadow-cyan" />
          <p className="text-cs-muted leading-relaxed max-w-md">
            Ready to elevate your creative vision? Whether it's digital art, illustrations,
            brand design, UI/UX, or photography — let's collaborate and make something amazing.
          </p>
          <div className="mt-12 space-y-3 font-mono text-sm">
            <div className="flex gap-4">
              <span className="text-cs-cyan">▸</span>
              <span className="text-cs-muted">hello@csdesigns.example</span>
            </div>
            <div className="flex gap-4">
              <span className="text-cs-cyan">▸</span>
              <span className="text-cs-muted">Linkedin / Behance</span>
            </div>
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

          <button
            type="submit"
            className="w-full py-3 border border-cs-cyan text-cs-cyan font-mono text-xs uppercase tracking-[0.25em] hover:bg-cs-cyan hover:text-cs-bg transition-all shadow-cyan hover:shadow-cyan-strong"
          >
            Transmit ▸
          </button>
        </form>
      </div>
    </section>
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
        <textarea name={name} required={required} rows={5} className={`${cls} resize-none`} />
      ) : (
        <input name={name} required={required} type={type} className={cls} />
      )}
    </label>
  );
}
