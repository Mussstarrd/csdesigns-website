import PortfolioGrid from "../components/PortfolioGrid.jsx";

export default function Portfolio() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="font-mono text-xs tracking-[0.4em] text-cs-cyan mb-4">// PROJECT INDEX</div>
        <h1 className="font-display text-5xl md:text-7xl font-black tracking-wider glow-cyan">
          PORTFOLIO
        </h1>
        <div className="w-24 h-px bg-cs-cyan mx-auto mt-8 shadow-cyan" />
      </div>
      <PortfolioGrid />
    </section>
  );
}
