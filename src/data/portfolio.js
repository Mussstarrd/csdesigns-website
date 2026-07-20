export const categories = [
  { id: "all", label: "ALL" },
  { id: "uiux", label: "UI/UX" },
  { id: "branding", label: "BRANDING" },
  { id: "flyers", label: "FLYERS" },
  { id: "photography", label: "PHOTOGRAPHY" },
  { id: "digital", label: "DIGITAL ART" },
];

const img = (file) => encodeURI(`/portfolio/${file}`);

export const projects = [
  // FLYERS
  { id: "sneaker-ball",       title: "Sneaker Ball",             category: "flyers",     blurb: "Semi-formal event flyer — Elizabethtown, KY",   image: img("EventFlyers/SNKRBALL copy.png") },
  { id: "sundress-party",     title: "Sundress Party",           category: "flyers",     blurb: "Summer event flyer — MoTee'z Sports Pub",       image: img("EventFlyers/sundressparty.png") },
  { id: "james-franklin",     title: "James Franklin Tribute",   category: "flyers",     blurb: "Memorial / community event flyer",              image: img("EventFlyers/JamesFranklinFlyer.png") },
  { id: "demi-ryan-classic",  title: "Demi Ryan Classic",        category: "flyers",     blurb: "Basketball tournament — Radcliff, KY",          image: img("EventFlyers/DemiRyanClassicTournament (1).jpg") },
  { id: "jaida-baby-shower",  title: "Jaida's Baby Shower",      category: "flyers",     blurb: "Custom baby shower invitation",                 image: img("EventFlyers/Jaida's_BabyShowerFinish.jpg") },
  { id: "plol-holiday",       title: "PLOL Holiday Ad",          category: "flyers",     blurb: "Holiday promotional ad",                        image: img("EventFlyers/PLOLHolidayAd.png") },
  { id: "shock-tryouts",      title: "Shock Baseball Tryouts",   category: "flyers",     blurb: "Tryouts recruitment flyer",                     image: img("shock_baseball/ShockBaseballTryouts.png") },
  { id: "arc-dog-poster",     title: "ARC Dog Poster",           category: "flyers",     blurb: "Event poster design",                           image: img("ARC Dog Poster.png") },

  // BRANDING
  { id: "shock-logo-2",       title: "Shock Baseball Mark",      category: "branding",   blurb: "Primary team logo",                             image: img("shock_baseball/ShockBaseballLogo2.png") },
  { id: "shock-logo-1",       title: "Shock Wordmark",           category: "branding",   blurb: "Alternate team wordmark",                       image: img("shock_baseball/ShockLogo1.png") },
  { id: "jsmith-logo",        title: "Janet Smith Realty Mark",  category: "branding",   blurb: "Realtor logo identity",                         image: img("JanetSmith_realty/JSRealtyLogo.png") },
  { id: "arc-dog-social",     title: "ARC Dog Social Kit",       category: "branding",   blurb: "Social media graphics",                         image: img("ARC Dog Social Media.png") },
  { id: "pins-brochure",      title: "PINS Brochure",            category: "branding",   blurb: "Print brochure design",                         image: img("PINS Brochure.png") },
  { id: "patriot-ad-11",      title: "Patriot Liner — Campaign", category: "branding",   blurb: "Ad campaign for Patriot Liner",                 image: img("PatriotLiner/PatriotLinerAd11.png") },
  { id: "patriot-bundle",     title: "Patriot Liner — Bundle Ad", category: "branding",  blurb: "Bundle offer creative",                         image: img("PatriotLiner/BundleAd (1).png") },
  { id: "patriot-ad-22",      title: "Patriot Liner — Ad 22",    category: "branding",   blurb: "Ad campaign variant",                           image: img("PatriotLiner/PatriotLinerAd22.png") },

  // UI / UX
  { id: "jsmith-realty-ui",   title: "Janet Smith Realty Site",  category: "uiux",       blurb: "Realtor site mockup",                           image: img("JanetSmith_realty/JSmithRealtyMock.png") },

  // PHOTOGRAPHY
  { id: "portrait",           title: "Portrait",                 category: "photography", blurb: "Studio portrait piece",                        image: "/assets/headshot.png" },

  // DIGITAL ART
  { id: "haters-gonna",       title: "Haters Gonna",             category: "digital",    blurb: "Character art piece",                           image: img("Screenshot 2026-06-28 153855.png") },
];
