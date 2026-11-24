export type Photo = { base: string; w: number; h: number; alt: string; pos?: string };

const photo = (base: string, w: number, h: number, alt: string, pos?: string): Photo => ({ base, w, h, alt, pos });

export const photos = {
  frame: photo('frame', 1920, 1080, 'A two-storey timber frame standing on its slab under a blue sky', '50% 40%'),
  extension: photo('extension', 1920, 1440, 'An oak frame being lifted into place by a small crane beside a brick house', '55% 45%'),
  woodshop: photo('woodshop', 1920, 1274, 'A long daylit woodshop of workbenches and machines under timber trusses', '50% 50%'),
  staircase: photo('staircase', 1920, 1440, 'A carved oak staircase with a deep balustrade against a red wall', '70% 50%'),
  house: photo('house', 1469, 2886, 'A two-storey timber-clad house with tall black-framed windows', '50% 45%'),
  carpenter: photo('carpenter', 1920, 1280, 'A carpenter marking a dark timber board with a red pencil and a square', '60% 50%'),
};

export const slides = [
  { photo: photos.frame, caption: 'A timber frame, standing true on day one' },
  { photo: photos.extension, caption: 'An oak frame lifted into place' },
  { photo: photos.staircase, caption: 'Carved oak, made to be touched' },
  { photo: photos.woodshop, caption: 'Where the joinery is made' },
];

export const services = [
  {
    slug: 'new-build',
    title: 'New builds',
    body: 'A fresh start on a solid foundation, shaped around how you live.',
    photo: photos.house,
  },
  {
    slug: 'renovation',
    title: 'Renovations and extensions',
    body: 'More from the home you have, built to sit well beside it.',
    photo: photos.extension,
  },
  {
    slug: 'joinery',
    title: 'Bespoke joinery',
    body: 'Stairs, doors and fitted timber, made to measure in real wood.',
    photo: photos.staircase,
  },
] as const;

export const steps = [
  { title: 'Let’s talk', body: 'Tell us your ideas, your priorities and how you will use the space.' },
  { title: 'Make a plan', body: 'We agree the scope and the details before work starts on site.' },
  { title: 'Build with care', body: 'A considered build, with open conversation at every stage.' },
  { title: 'Make it yours', body: 'Finishing touches, a careful handover and a space ready to live in.' },
] as const;

export const gallery = [
  { photo: photos.staircase, title: 'Craft you can feel', line: 'A carved oak staircase' },
  { photo: photos.extension, title: 'Raised in oak', line: 'An oak-framed garden room' },
  { photo: photos.frame, title: 'Square from the slab', line: 'A timber frame going up' },
  { photo: photos.woodshop, title: 'Made by hand', line: 'Joinery at the bench' },
  { photo: photos.carpenter, title: 'Measured twice', line: 'Marking out a board' },
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

export const credits = [
  { href: 'https://commons.wikimedia.org/wiki/File:Timber_frame_house_under_construction,_New_Zealand.jpg', who: 'L Maule', licence: 'CC BY-SA 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Oak_framed_sun_lounge_extension_-_geograph.org.uk_-_2777388.jpg', who: 'Chris Whitehouse', licence: 'CC BY-SA 2.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Staircase_from_Cassiobury_Park,_Herfordshire_MET_DP-12790-001.jpg', who: 'The Metropolitan Museum of Art', licence: 'CC0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Woodshop.jpg', who: 'Dolly442', licence: 'CC BY-SA 4.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:A_beautiful,_modern_wooden_house_features_large_windows_and_fresh_landscaping.jpg', who: 'Shixart1985', licence: 'CC BY 2.0' },
  { href: 'https://commons.wikimedia.org/wiki/File:Carpenter_working_on_an_item_4.jpg', who: 'Kambai Akau', licence: 'CC BY-SA 4.0' },
] as const;
