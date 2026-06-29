import PortfolioGrid from "../components/PortfolioGrid.jsx";

export default function Portfolio() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      <div className="text-center mb-10 md:mb-16">
        <div className="font-mono text-xs tracking-[0.4em] text-cs-blue mb-4">// PROJECT INDEX</div>
        <h1 className="font-display text-5xl md:text-7xl font-black tracking-wider glow-blue">
          PORTFOLIO
        </h1>
        <div className="w-24 h-px bg-cs-blue mx-auto mt-8 shadow-blue" />
      </div>
      <PortfolioGrid />
    </section>
  );
}
