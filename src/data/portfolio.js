export const categories = [
  { id: "all", label: "ALL" },
  { id: "uiux", label: "UI/UX" },
  { id: "branding", label: "BRANDING" },
  { id: "flyers", label: "FLYERS" },
];

const img = (file) => encodeURI(`/portfolio/${file}`);

export const projects = [
  // FLYERS — from EventFlyers/ + related
  { id: "sneaker-ball",       title: "Sneaker Ball",             category: "flyers",   blurb: "Semi-formal event flyer — Elizabethtown, KY",   image: img("EventFlyers/SNKRBALL copy.png") },
  { id: "sundress-party",     title: "Sundress Party",           category: "flyers",   blurb: "Summer event flyer — MoTee'z Sports Pub",       image: img("EventFlyers/sundressparty.png") },
  { id: "james-franklin",     title: "James Franklin Tribute",   category: "flyers",   blurb: "Memorial / community event flyer",              image: img("EventFlyers/JamesFranklinFlyer.png") },
  { id: "demi-ryan-classic",  title: "Demi Ryan Classic",        category: "flyers",   blurb: "Basketball tournament — Radcliff, KY",          image: img("EventFlyers/DemiRyanClassicTournament (1).jpg") },
  { id: "jaida-baby-shower",  title: "Jaida's Baby Shower",      category: "flyers",   blurb: "Custom baby shower invitation",                 image: img("EventFlyers/Jaida's_BabyShowerFinish.jpg") },
  { id: "plol-holiday",       title: "PLOL Holiday Ad",          category: "flyers",   blurb: "Holiday promotional ad",                        image: img("EventFlyers/PLOLHolidayAd.png") },
  { id: "shock-tryouts",      title: "Shock Baseball Tryouts",   category: "flyers",   blurb: "Tryouts recruitment flyer",                     image: img("brand design/shock_baseball/ShockBaseballTryouts.png") },
  { id: "arc-dog-poster",     title: "ARC Dog Poster",           category: "flyers",   blurb: "Event poster design",                           image: img("ARC Dog Poster.png") },

  // BRANDING — from brand design/ + related
  { id: "shock-logo-2",       title: "Shock Baseball Mark",      category: "branding", blurb: "Primary team logo",                             image: img("brand design/shock_baseball/ShockBaseballLogo2.png") },
  { id: "shock-logo-1",       title: "Shock Wordmark",           category: "branding", blurb: "Alternate team wordmark",                       image: img("brand design/shock_baseball/ShockLogo1.png") },
  { id: "jsmith-logo",        title: "Janet Smith Realty Mark",  category: "branding", blurb: "Realtor logo identity",                         image: img("brand design/JanetSmith_realty/JSRealtyLogo.png") },
  { id: "arc-dog-social",     title: "ARC Dog Social Kit",       category: "branding", blurb: "Social media graphics",                         image: img("ARC Dog Social Media.png") },
  { id: "pins-brochure",      title: "PINS Brochure",            category: "branding", blurb: "Print brochure design",                         image: img("PINS Brochure.png") },
  { id: "patriot-bundle",     title: "Patriot Liner — Bundle",   category: "branding", blurb: "Bundle offer creative",                         image: img("brand design/PatriotLiner/BundleAd (1).png") },
  { id: "patriot-ad-11",      title: "Patriot Liner — Ad 11",    category: "branding", blurb: "Campaign ad variant",                           image: img("brand design/PatriotLiner/PatriotLinerAd11.png") },
  { id: "patriot-ad-22",      title: "Patriot Liner — Ad 22",    category: "branding", blurb: "Campaign ad variant",                           image: img("brand design/PatriotLiner/PatriotLinerAd22.png") },
  { id: "patriot-ad-23",      title: "Patriot Liner — Ad 23",    category: "branding", blurb: "Campaign ad variant",                           image: img("brand design/PatriotLiner/PatriotLinerAd23.png") },
  { id: "patriot-ad-24",      title: "Patriot Liner — Ad 24",    category: "branding", blurb: "Campaign ad variant",                           image: img("brand design/PatriotLiner/PatriotLinerAd24.jpg") },
  { id: "patriot-ad-6",       title: "Patriot Liner — Ad 6",     category: "branding", blurb: "Campaign ad variant",                           image: img("brand design/PatriotLiner/PatriotLinerAd6.jpg") },
  { id: "patriot-ad-3",       title: "Patriot Liner — Ad 3",     category: "branding", blurb: "Campaign ad variant",                           image: img("brand design/PatriotLiner/PatriotLiner_Ad3.jpg") },

  // UI / UX
  { id: "jsmith-realty-ui",   title: "Janet Smith Realty Site",  category: "uiux",     blurb: "Realtor site mockup",                           image: img("brand design/JanetSmith_realty/JSmithRealtyMock.png") },
  { id: "jsmith-realty-2",    title: "Janet Smith Realty View",  category: "uiux",     blurb: "Alternate site view",                           image: img("brand design/JanetSmith_realty/Screenshot 2025-12-26 at 11.34.27 AM.png") },
];
