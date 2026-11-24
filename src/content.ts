export type Photo = { base: string; w: number; h: number; alt: string; pos?: string };

const photo = (base: string, w: number, h: number, alt: string, pos?: string): Photo => ({ base, w, h, alt, pos });

// Builders and makers at work across East and West Africa (Wikimedia Commons, credited in the footer),
// plus eleven photographs supplied by the owner (cottage, treehouse, home, stairs, balcony, two kitchens and four
// from one coastal property for the home gallery; originals in photos-src/, the property's as stack1-4).
// The large file is at most 1920 wide; w is its true width, so smaller originals are never enlarged.
export const photos = {
  cottage: photo('cottage', 1511, 1000, 'A whitewashed cottage under a deep makuti thatch, its veranda carried on timber posts among coastal trees', '50% 45%'),
  treehouse: photo('treehouse', 1920, 1080, 'A timber treehouse on stilts in an acacia with a timber ladder up to its deck', '45% 50%'),
  home: photo('home', 1024, 474, 'A white single-storey home with a tiled roof and a veranda on timber posts', '45% 50%'),
  site: photo('site', 1920, 1440, 'A block-built site ringed with scaffold poles, builders in hard hats crossing the red earth', '50% 45%'),
  render: photo('render', 1920, 1280, 'A plasterer on timber scaffolding rendering the block wall of a two-storey building', '45% 40%'),
  workshop: photo('workshop', 1920, 1280, 'A carpenter cutting a timber board with a circular saw, sawdust across the workshop floor', '55% 50%'),
  homeVeranda: photo('home-veranda', 1024, 683, 'A white single-storey home with a dark tiled roof and a veranda on timber posts, set behind aloes and trees', '45% 50%'),
  beamedKitchen: photo('beamed-kitchen', 512, 768, 'A grey fitted kitchen under a ceiling of exposed timber poles, with a woven pendant light', '50% 45%'),
  gardenPool: photo('garden-pool', 513, 768, 'A curved pool set in a natural stone terrace, with palms and a garden wall behind', '50% 60%'),
  makutiTerrace: photo('makuti-terrace', 1024, 683, 'An open shelter under a makuti thatch on a stone floor, looking out to a garden and a white house', '50% 50%'),
  boardwalk: photo('boardwalk', 1138, 759, 'A timber boardwalk with pole handrails winding through mangroves', '50% 60%'),
  gardenPond: photo('garden-pond', 1536, 1024, 'A garden pond under construction: a stepped liner edged with stone, a fountain pipe, and pump and filter boxes in the foreground', '50% 55%'),
  pergola: photo('pergola', 365, 547, 'A timber pergola over a raised deck with cushioned seating, among palms and planting', '50% 55%'),
  pumpRoom: photo('pump-room', 1920, 2560, 'A plastered pump room with two pressure tanks and new pipework', '50% 55%'),
  kitchen: photo('kitchen', 447, 447, 'A light kitchen with a white worktop, louvred timber cupboard doors and an open timber shelf', '50% 55%'),
  door: photo('door', 1920, 1280, 'Hand-carved floral panels and brass bosses on a hardwood door in Zanzibar', '50% 50%'),
  stairs: photo('stairs', 495, 619, 'An outside timber staircase with a carved balustrade climbing a whitewashed house to a covered timber balcony', '60% 55%'),
  balcony: photo('balcony', 1200, 630, 'A covered timber balcony with louvred shutters, a fretwork balustrade and timber posts, looking out over town rooftops', '55% 50%'),
  kitchenHardwood: photo('kitchen-hardwood', 1024, 768, 'A tiled kitchen fitted with hardwood louvred cupboards, drawers and a carved timber shelf', '40% 50%'),
};

export const slides = [
  { photo: photos.cottage, caption: 'Timber posts under a makuti roof' },
  { photo: photos.site, caption: 'A block-built site taking shape' },
  { photo: photos.workshop, caption: 'Where the joinery is cut' },
  { photo: photos.door, caption: 'Carved by hand, made to last' },
];

export const services = [
  {
    slug: 'new-build',
    title: 'New builds',
    body: 'A fresh start on a solid foundation, shaped around how you live.',
    href: '/new-builds',
    more: 'Explore new builds',
    photo: photos.home,
  },
  {
    slug: 'renovation',
    title: 'Renovations and extensions',
    body: 'More from the home you have, built to sit well beside it.',
    href: '/renovations',
    more: 'Explore renovations and extensions',
    photo: photos.render,
  },
  {
    slug: 'joinery',
    title: 'Bespoke joinery',
    body: 'Stairs, doors and fitted timber, made to measure in real wood.',
    href: '/joinery',
    more: 'Explore bespoke joinery',
    photo: photos.door,
  },
] as const;

export const steps = [
  { title: 'Let’s talk', body: 'Tell us your ideas, your priorities and how you will use the space.' },
  { title: 'Make a plan', body: 'We agree the scope and the details before work starts on site.' },
  { title: 'Build with care', body: 'A considered build, with open conversation at every stage.' },
  { title: 'Make it yours', body: 'Finishing touches, a careful handover and a space ready to live in.' },
] as const;

export const gallery = [
  { photo: photos.homeVeranda, title: 'Made for the veranda', line: 'A white home with a timber-post veranda' },
  { photo: photos.door, title: 'Craft you can feel', line: 'A hand-carved Zanzibar door' },
  { photo: photos.beamedKitchen, title: 'Timber overhead', line: 'A kitchen under exposed timber poles' },
  { photo: photos.treehouse, title: 'Built into the trees', line: 'A timber treehouse on stilts' },
  { photo: photos.gardenPool, title: 'Room outside', line: 'A pool on a natural stone terrace' },
  { photo: photos.render, title: 'New life for old walls', line: 'Rendering a two-storey building' },
  { photo: photos.kitchen, title: 'Fitted to the room', line: 'Louvred timber kitchen doors' },
  { photo: photos.makutiTerrace, title: 'Shade under makuti', line: 'An open thatched shelter on a stone floor' },
  { photo: photos.workshop, title: 'Made in the workshop', line: 'Cutting a door frame' },
  { photo: photos.kitchenHardwood, title: 'Hardwood, made to fit', line: 'A kitchen in carved hardwood' },
];

export const faqs = [
  {
    q: 'What kind of projects can I enquire about?',
    a: 'New builds, renovations, extensions and bespoke joinery. Share a little about your idea and we will tell you plainly whether we are the right fit.',
  },
  {
    q: 'Do I need drawings before getting in touch?',
    a: 'No. Start with an idea, early sketches or a developed set of plans. Tell us where you are in the process and we start from there.',
  },
  {
    q: 'How do I get a project estimate?',
    a: 'Send the enquiry form below. The scope, location, timeframe and any plans you have help us shape a useful first conversation.',
  },
] as const;

export const projectTypes = [
  { value: 'new-build', label: 'New build' },
  { value: 'renovation', label: 'Renovation or extension' },
  { value: 'joinery', label: 'Bespoke joinery' },
  { value: 'other', label: 'Something else' },
] as const;

export const timeframes = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '3-6m', label: 'In 3 to 6 months' },
  { value: '6-12m', label: 'In 6 to 12 months' },
  { value: 'unsure', label: 'Not sure yet' },
] as const;

// ---------- Service pages (/new-builds, /renovations, /joinery), one template: views/pages/service.pug
// Each page shows only its own photographs: houses and sites for new builds, rendering and
// extension work for renovations, the workshop and finished pieces for joinery.

type Item = { title: string; body: string };
type Faq = { q: string; a: string };
export type ServicePage = {
  slug: 'new-build' | 'renovation' | 'joinery';
  path: string;
  name: string;
  hero: Photo;
  heroLead: string;
  heroAction: string;
  intro: { title: string; lead: string };
  facts: { label: string; body: string }[];
  photos: { photo: Photo; caption: string }[];
  photosLead: string;
  kinds: { title: string; lead: string; items: (Item & { photo?: Photo })[] };
  included: { lead: string; items: Item[] };
  stages: { title: string; lead: string; items: (Item & { outcome: string })[] };
  materials: { title: string; lead: string; photo: Photo; items: Item[] };
  faqs: { title: string; items: Faq[] };
  cta: { title: string; lead: string; action: string };
};

const newBuildPage: ServicePage = {
  slug: 'new-build',
  path: '/new-builds',
  name: 'New builds',
  hero: photos.home,
  heroLead: 'A fresh start on a solid foundation, shaped around how you live.',
  heroAction: 'Start a new build',
  intro: {
    title: 'A home built from the ground up.',
    lead: 'From an empty plot to the day you move in, we take a new build through every stage: the first site visit, the drawings, the foundations, the walls and roof, the joinery and the finish.',
  },
  facts: [
    { label: 'One team', body: 'The same people plan it, build it and hand it over, so nothing is lost between stages.' },
    { label: 'Built for the place', body: 'Walls, roofs and openings chosen for the climate, the ground and how you use the house.' },
    { label: 'Clear at every step', body: 'An agreed scope and programme before work starts, and regular updates on site.' },
  ],
  photos: [
    { photo: photos.home, caption: 'A single-storey home with a tiled roof and timber veranda' },
    { photo: photos.cottage, caption: 'A whitewashed cottage under a makuti thatch' },
    { photo: photos.treehouse, caption: 'A timber treehouse raised on stilts' },
    { photo: photos.site, caption: 'Block walls rising, ringed with scaffold poles' },
  ],
  photosLead: 'Homes, cottages and a building site.',
  kinds: {
    title: 'What we build.',
    lead: 'Houses of every size, and the timber structures around them.',
    items: [
      { title: 'Family homes', body: 'Single and two-storey houses in block and render, planned around bedrooms, living space, kitchen and storage that suit the household.', photo: photos.home },
      { title: 'Cottages and holiday homes', body: 'Smaller houses with deep verandas and shaded rooms, under tile or a traditional makuti thatch.', photo: photos.cottage },
      { title: 'Timber structures', body: 'Treehouses, studios, garden rooms and outbuildings framed in timber and raised where the ground asks for it.', photo: photos.treehouse },
    ],
  },
  included: {
    lead: 'Everything a new build needs, from the first visit to the keys. We agree with you which parts are ours before work starts.',
    items: [
      { title: 'Site visit and feasibility', body: 'We walk the plot with you, look at access, levels, soil and services, and talk through what can be built there.' },
      { title: 'Design and drawings', body: 'We work from your architect’s plans, or help shape a layout and arrange the drawings if you are starting from an idea.' },
      { title: 'Estimate and programme', body: 'A written scope, an itemised estimate and a build programme, agreed with you before anything starts.' },
      { title: 'Approvals', body: 'We help prepare and follow up the paperwork the local authority needs before building can begin.' },
      { title: 'Groundworks and foundations', body: 'Clearing and setting out the site, excavation, footings and the floor slab.' },
      { title: 'Walls and structure', body: 'Block or stone walls, columns, beams and lintels, or a timber frame, built level, plumb and square.' },
      { title: 'Roofing', body: 'Timber roof structure with tile, sheet or makuti thatch, gutters and fascia.' },
      { title: 'Services', body: 'Plumbing, drainage, water storage and electrical work, coordinated with qualified trades.' },
      { title: 'Joinery', body: 'Doors, frames, windows, stairs, wardrobes and kitchen fittings, made to measure in our workshop.' },
      { title: 'Finishes', body: 'Plaster and render, floors and tiling, ceilings, paint and the final fit.' },
      { title: 'Outside works', body: 'Verandas, paths, drainage around the house and boundary walls, if they are part of the plan.' },
      { title: 'Handover', body: 'A walk-through together, a list of anything to put right, and the keys.' },
    ],
  },
  stages: {
    title: 'From plot to handover.',
    lead: 'stages, each one agreed and checked before the next begins.',
    items: [
      { title: 'First conversation', body: 'You tell us about the plot, the house you have in mind, your timeframe and your budget. We visit the site and say plainly what we think is possible.', outcome: 'A clear sense of whether we are the right builder for it.' },
      { title: 'Design and drawings', body: 'We develop the layout with you, or with your architect, until the rooms, sizes and materials are settled.', outcome: 'A set of drawings that everyone builds from.' },
      { title: 'Estimate and agreement', body: 'We price the work item by item and set out a programme. You see what is included and what is not before you sign.', outcome: 'A written scope, estimate and programme.' },
      { title: 'Approvals and site set-up', body: 'Approvals are followed up, the site is cleared and set out, and materials are ordered for the first stages.', outcome: 'A site ready to build on.' },
      { title: 'Foundations to roof', body: 'Footings and slab, walls, structure and roof. We keep you updated as each stage is completed and checked.', outcome: 'A weathertight shell.' },
      { title: 'Services, joinery and finishes', body: 'Plumbing and electrics go in, the joinery is fitted, and the walls, floors and ceilings are finished.', outcome: 'A house ready to live in.' },
      { title: 'Handover', body: 'We walk the house with you, put right anything on the snagging list and hand over the keys.', outcome: 'Your new home.' },
    ],
  },
  materials: {
    title: 'Honest materials.',
    lead: 'Chosen for the climate and for how long the house should last, never to cut a corner.',
    photo: photos.treehouse,
    items: [
      { title: 'Walls', body: 'Block or stone, properly bonded and rendered, for a house that stays cool and solid.' },
      { title: 'Roofs', body: 'Well-made timber roof structures under tile, sheet or makuti, with generous overhangs for shade and rain.' },
      { title: 'Timber', body: 'Seasoned hardwood and softwood, chosen for where it goes and finished to last.' },
      { title: 'Detail', body: 'Doors, windows and stairs made in our own workshop, so they fit the house exactly.' },
    ],
  },
  faqs: {
    title: 'New build questions.',
    items: [
      { q: 'Can you build on my plot?', a: 'Usually, yes. We visit the site first to look at access, ground, levels and services, and tell you what that means for the design and the cost.' },
      { q: 'Do I need an architect?', a: 'Not to get in touch. If you already have one, we work from their drawings. If you are starting from an idea, we can help shape the layout and arrange the drawings.' },
      { q: 'How long does a new build take?', a: 'It depends on the size of the house, the site and the approvals. You get a programme with the estimate, and we keep you updated against it as the work goes on.' },
      { q: 'How is the work priced?', a: 'From the drawings and an agreed scope, item by item, so you can see what is included. Any change you ask for is priced and agreed before it is built.' },
      { q: 'Can I visit the site while it is being built?', a: 'Yes. We arrange visits at the key stages so you can see the work, ask questions and make decisions on finishes.' },
    ],
  },
  cta: {
    title: 'Let’s build your home.',
    lead: 'Tell us about the plot and the house you have in mind. We’ll reply by email to arrange a first conversation.',
    action: 'Tell us about your new build',
  },
};

const renovationPage: ServicePage = {
  slug: 'renovation',
  path: '/renovations',
  name: 'Renovations and extensions',
  hero: photos.render,
  heroLead: 'More from the home you have, built to sit well beside it.',
  heroAction: 'Start a renovation',
  intro: {
    title: 'More room. Better rooms.',
    lead: 'An extension, a new upper floor, rooms re-planned or a tired house put right. We build onto and into the home you already have, so the new work matches the old and the house still works while we are there.',
  },
  facts: [
    { label: 'Made to match', body: 'New walls, roofs and finishes tied in to the existing house, so old and new read as one.' },
    { label: 'Your home kept safe', body: 'Work areas screened, the rest of the house protected and the site left tidy each day.' },
    { label: 'No surprises left hidden', body: 'If opening up a wall shows something unexpected, we show you and agree the fix before going on.' },
  ],
  photos: [
    { photo: photos.render, caption: 'Rendering the walls of a two-storey building' },
    { photo: photos.site, caption: 'New block walls going up beside scaffold poles' },
    { photo: photos.boardwalk, caption: 'A timber boardwalk through mangroves' },
    { photo: photos.pergola, caption: 'A timber pergola over a raised deck' },
    { photo: photos.gardenPond, caption: 'A garden pond taking shape, with its pump and filters' },
    { photo: photos.pumpRoom, caption: 'A pump room with two pressure tanks and new pipework' },
  ],
  photosLead: 'Walls, a boardwalk, a pergola, a pond and a pump room.',
  kinds: {
    title: 'What we do.',
    lead: 'From one room to the whole house.',
    items: [
      { title: 'Extensions', body: 'Side, rear and upper-floor extensions: an extra bedroom, a bigger kitchen, a new living room, built onto the house you have.', photo: photos.site },
      { title: 'Renovations', body: 'Rooms re-planned, walls opened up, new kitchens and bathrooms, and older houses brought up to date.', photo: photos.render },
      { title: 'Repairs and services', body: 'Roofs re-covered, walls re-rendered, damp and cracks put right, and water pumps, tanks and pipework renewed.', photo: photos.pumpRoom },
      { title: 'Outdoor works', body: 'Verandas, terraces, pergolas, timber boardwalks and garden ponds that add living space outside.', photo: photos.boardwalk },
    ],
  },
  included: {
    lead: 'What a renovation or extension can include, from the first survey to making good. We agree with you which parts are ours before work starts.',
    items: [
      { title: 'Survey of the house', body: 'We look at the structure, roof, walls, services and foundations of what is there now, and how the new work will join it.' },
      { title: 'Design and drawings', body: 'We work from your architect’s plans, or help shape the layout and arrange drawings for the new rooms.' },
      { title: 'Estimate and programme', body: 'A written scope, an itemised estimate and a programme that plans around how you live in the house.' },
      { title: 'Approvals', body: 'We help prepare and follow up the paperwork an extension or structural change needs before work begins.' },
      { title: 'Protecting the house', body: 'Dust screens, floor and furniture protection, and safe, separate access to the work area.' },
      { title: 'Strip-out and demolition', body: 'Careful removal of the walls, roofs, fittings and finishes that are making way for the new work.' },
      { title: 'Foundations and structure', body: 'Footings for the extension, new openings, beams and lintels, checked before the walls go up.' },
      { title: 'Tying in', body: 'New walls bonded to old, roofs joined and floor levels matched, so the join does not show or leak.' },
      { title: 'Roofing', body: 'New roof structure, or repairs to the old, with tiles, sheet or thatch matched to the existing roof.' },
      { title: 'Services', body: 'Plumbing, drainage and electrical work moved, extended or renewed, coordinated with qualified trades.' },
      { title: 'Joinery', body: 'Doors, windows, stairs and fitted furniture made to measure in our workshop.' },
      { title: 'Finishes and making good', body: 'Plaster, render, floors, tiling and paint, with the old surfaces made good where they meet the new.' },
    ],
  },
  stages: {
    title: 'From first look to finished rooms.',
    lead: 'stages, planned around the household living in the house.',
    items: [
      { title: 'First conversation and survey', body: 'You tell us what you want from the house. We visit, look at what is there and say plainly what is possible.', outcome: 'A clear sense of the work and whether we are the right builder for it.' },
      { title: 'Design and drawings', body: 'We develop the layout with you, or with your architect, and settle how the new work meets the old.', outcome: 'Drawings that everyone builds from.' },
      { title: 'Estimate and agreement', body: 'We price the work item by item and set a programme, including how the house will be used while we work.', outcome: 'A written scope, estimate and programme.' },
      { title: 'Approvals and preparation', body: 'Approvals are followed up, the work area is screened off and the rest of the house is protected.', outcome: 'A house ready for the work to start.' },
      { title: 'Strip-out and structure', body: 'Walls opened, foundations laid, new walls and roof built and tied in. Anything unexpected is shown to you before we go on.', outcome: 'The new structure, joined to the old.' },
      { title: 'Services, joinery and finishes', body: 'Services extended, joinery fitted, and new and old surfaces finished together.', outcome: 'Rooms ready to use.' },
      { title: 'Handover', body: 'We walk through the work with you, put right anything on the snagging list and clear the site.', outcome: 'More from the home you have.' },
    ],
  },
  materials: {
    title: 'Old and new as one.',
    lead: 'We match what the house is built from, so the new work looks as though it was always there.',
    photo: photos.boardwalk,
    items: [
      { title: 'Walls', body: 'Block or stone matched to the existing walls, bonded in and rendered to the same finish.' },
      { title: 'Roofs', body: 'Roof structures joined to the old, under tiles, sheet or thatch that match the existing roof.' },
      { title: 'Timber', body: 'Seasoned timber for frames, roofs and joinery, chosen for where it goes.' },
      { title: 'Making good', body: 'Where the new meets the old, surfaces are repaired and finished so the join disappears.' },
    ],
  },
  faqs: {
    title: 'Renovation questions.',
    items: [
      { q: 'Can we stay in the house during the work?', a: 'Often, yes. We plan the programme around how you use the house, screen off the work area and keep the rest of it safe and usable. For some stages, such as work on the only kitchen or bathroom, we agree the timing with you in advance.' },
      { q: 'Do I need approval for an extension?', a: 'Most extensions and structural changes do. We tell you what your project needs and help prepare and follow up the paperwork.' },
      { q: 'Can you match my existing house?', a: 'That is the aim of every extension we build: walls, roof, openings and finishes matched to what is there, so old and new read as one.' },
      { q: 'What if you find a problem once work starts?', a: 'Older houses can hide surprises behind plaster and under floors. If we find one, we stop, show you, explain the options and price the fix before going on.' },
      { q: 'How is the work priced?', a: 'From the drawings and an agreed scope, item by item, so you can see what is included. Any change you ask for is priced and agreed before it is built.' },
    ],
  },
  cta: {
    title: 'Let’s make more of your home.',
    lead: 'Tell us about the house and what you would like to change. We’ll reply by email to arrange a visit.',
    action: 'Tell us about your renovation',
  },
};

const joineryPage: ServicePage = {
  slug: 'joinery',
  path: '/joinery',
  name: 'Bespoke joinery',
  hero: photos.door,
  heroLead: 'Stairs, doors and fitted timber, made to measure in real wood.',
  heroAction: 'Start a joinery project',
  intro: {
    title: 'Made to measure, in real wood.',
    lead: 'Doors and frames, windows, stairs, kitchens, wardrobes and carved detail, measured in your home, made in our workshop and fitted by the people who made them.',
  },
  facts: [
    { label: 'Measured on site', body: 'Every piece is made to the room it goes in, not to a standard size.' },
    { label: 'Made in our workshop', body: 'Cut, jointed, carved and finished by hand and machine at the bench.' },
    { label: 'Fitted by the makers', body: 'The same hands that made it hang it, fit it and adjust it.' },
  ],
  photos: [
    { photo: photos.door, caption: 'A carved hardwood front door with brass bosses' },
    { photo: photos.stairs, caption: 'An outside staircase with a carved timber balustrade' },
    { photo: photos.balcony, caption: 'A timber balcony with louvred shutters and a fretwork balustrade' },
    { photo: photos.workshop, caption: 'Cutting door frames in the workshop' },
    { photo: photos.kitchenHardwood, caption: 'Hardwood louvred cupboards and a carved shelf' },
    { photo: photos.kitchen, caption: 'A kitchen with louvred timber doors' },
  ],
  photosLead: 'Doors, stairs, a balcony, kitchens and the workshop.',
  kinds: {
    title: 'What we make.',
    lead: 'One piece or a whole house of joinery.',
    items: [
      { title: 'Doors and frames', body: 'Front doors, internal doors and their frames, plain or panelled, with carved detail where you want it.', photo: photos.door },
      { title: 'Stairs and balustrades', body: 'Timber staircases, handrails and balustrades, inside or out, made to fit the opening and the floor heights exactly.', photo: photos.stairs },
      { title: 'Kitchens and fitted furniture', body: 'Kitchen units, wardrobes, shelving and cabinets built into the room.', photo: photos.kitchen },
      { title: 'Windows and shutters', body: 'Timber balconies and balustrades, windows, frames and louvred shutters, made to match the house or replace what has worn out.', photo: photos.balcony },
    ],
  },
  included: {
    lead: 'What goes into a piece of joinery, from the first measure to the last adjustment.',
    items: [
      { title: 'Site visit and measure', body: 'We measure the opening, the room and the floor and wall levels the piece has to meet.' },
      { title: 'Design and drawings', body: 'Sketches or drawings of the piece, its sizes, joints and detail, agreed with you before anything is cut.' },
      { title: 'Timber and finish samples', body: 'Samples so you can see and choose the timber and the finish.' },
      { title: 'Estimate and programme', body: 'An itemised price and a date for making and fitting.' },
      { title: 'Timber selection', body: 'Seasoned boards chosen for the job: hardwood where it must last outdoors or underfoot, softwood where it suits.' },
      { title: 'Cutting and jointing', body: 'Machined to size and jointed, with traditional joints where strength matters.' },
      { title: 'Carving and detail', body: 'Panels, mouldings and carved work, made by hand.' },
      { title: 'Finishing', body: 'Sanded and finished in oil, stain, varnish or paint, inside and out.' },
      { title: 'Ironmongery', body: 'Hinges, locks, handles and fittings chosen to suit the piece.' },
      { title: 'Delivery and fitting', body: 'Brought to site and fitted by the people who made it.' },
      { title: 'Adjustment', body: 'A return visit to ease and adjust once the timber has settled in the house.' },
      { title: 'Care', body: 'Advice on looking after the timber and its finish so it lasts.' },
    ],
  },
  stages: {
    title: 'From measure to fitting.',
    lead: 'stages, from the first conversation to a piece in place.',
    items: [
      { title: 'First conversation', body: 'You tell us what you need, where it goes and what you like. Photos and sketches help.', outcome: 'A clear idea of the piece and whether we are right for it.' },
      { title: 'Measure', body: 'We visit and measure the room, the opening and the levels the piece has to meet.', outcome: 'Exact sizes to work to.' },
      { title: 'Design and samples', body: 'We draw the piece and show you timber and finish samples.', outcome: 'An agreed design, timber and finish.' },
      { title: 'Estimate and agreement', body: 'We price the work item by item and set dates for making and fitting.', outcome: 'A written price and programme.' },
      { title: 'Making', body: 'The timber is selected, cut, jointed and carved in the workshop.', outcome: 'The piece, made.' },
      { title: 'Finishing', body: 'Sanded and finished, with the ironmongery fitted or ready to fit.', outcome: 'The piece, ready to go in.' },
      { title: 'Fitting and handover', body: 'We fit it, adjust it, clear up and show you how to look after it.', outcome: 'Joinery made for your home.' },
    ],
  },
  materials: {
    title: 'The right timber.',
    lead: 'Each piece is made from timber chosen for where it goes and how hard it has to work.',
    photo: photos.balcony,
    items: [
      { title: 'Hardwoods', body: 'Dense, durable timber for front doors, stairs, frames and anything outdoors or underfoot.' },
      { title: 'Softwoods', body: 'Lighter timber for internal joinery, shelving and painted work.' },
      { title: 'Joints', body: 'Traditional joints where strength matters, so the piece stays square for years.' },
      { title: 'Finishes', body: 'Oil, stain, varnish or paint, chosen for the room and the weather.' },
    ],
  },
  faqs: {
    title: 'Joinery questions.',
    items: [
      { q: 'Can you make a single piece?', a: 'Yes. One door, one staircase or a whole house of joinery: every piece is made to measure, whatever the size of the job.' },
      { q: 'Can you match existing joinery?', a: 'Usually, yes. We look at the profiles, joints and finish of what is there and make the new piece to match.' },
      { q: 'Which timber should I choose?', a: 'It depends on where the piece goes. We show you samples and explain the difference, so you can choose with the look, the use and the budget in mind.' },
      { q: 'Do you fit what you make?', a: 'Yes. The people who make the piece fit it, and come back to adjust it once the timber has settled.' },
      { q: 'How long does joinery take?', a: 'It depends on the piece and the timber. You get a date for making and fitting with the estimate.' },
    ],
  },
  cta: {
    title: 'Let’s make it in wood.',
    lead: 'Tell us what you need and where it goes. We’ll reply by email to arrange a visit to measure.',
    action: 'Tell us about your joinery',
  },
};

export const servicePages = [newBuildPage, renovationPage, joineryPage];

export const credits = [
  { href: 'https://commons.wikimedia.org/wiki/File:Bricklayers_on_site,_Kwara_State,_Nigeria.jpg', who: 'Eyibeauty Oyelowo', licence: 'CC BY-SA 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Macon_au_travail_de_cr%C3%A9pissage_de_mur.jpg', who: 'Minette Lontsie', licence: 'CC BY-SA 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Door_frame_making.jpg', who: 'Rwebogora', licence: 'CC BY-SA 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Ornate_Carved_Door_in_Zanzibar.jpg', who: 'Eric Kilby', licence: 'CC BY-SA 2.0' },
] as const;
