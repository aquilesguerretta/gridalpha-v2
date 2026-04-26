import type { Lesson } from '@/lib/types/curriculum';

export const whatIsElectricity: Lesson = {
  id: 'a-electricity',
  title: 'What is electricity?',
  difficulty: 'foundation',
  readingMinutes: 6,
  eyebrow: '01 · FOUNDATION',
  identity: 'The thing that runs everything.',
  sections: [
    {
      heading: 'The basics.',
      content: `Electricity is the movement of electrons through a conductor. That's the physics. The economics: electricity is the only commodity in the world that has to be produced and consumed at exactly the same instant. There's no warehouse for power. The grid generates it, sends it down a wire, and the moment your refrigerator pulls it, it disappears.

This single property — that supply must equal demand at every second — shapes everything about the electricity market. Storage helps a little. Demand response helps. But fundamentally, every grid operator's job is to keep a perfect balance every minute of every day.

When that balance breaks, prices spike. When generators fail, prices spike harder. When demand climbs faster than supply can respond, prices spike harder still. This is why a single hot afternoon in PSEG can produce $1,200/MWh prices when the system is normally clearing at $35.`,
    },
    {
      heading: 'How we measure it.',
      content: `Two units matter. Megawatts (MW) measure power — the rate at which electricity is being delivered or consumed at a single instant. Megawatt-hours (MWh) measure energy — power delivered over time.

A 100 MW plant running for one hour delivers 100 MWh. Over a full day, that same plant delivers 2,400 MWh. Your refrigerator uses about 0.0015 MW of power and consumes about 36 kWh (0.036 MWh) per day.

PJM at peak load draws around 165,000 MW — 165 GW. That's enough power to run roughly 110 million homes simultaneously. The largest single plant in PJM, the Bruce Mansfield coal complex (now retired), once provided 2,500 MW — about 1.5% of total system load on its own.`,
    },
    {
      heading: 'Why it matters.',
      content: `Every product GridAlpha builds — every chart, every alert, every case study — is fundamentally about the price someone is willing to pay for electricity at a specific location and time. That price is what the market calls an LMP, the locational marginal price.

But before you can understand LMPs, you need to internalize the constraint: supply equals demand, every second, everywhere. The market doesn't price electricity the way it prices gold or wheat. It prices the ability to deliver one more megawatt-hour at one specific node on the grid, right now.

If you understand that, you understand why prices are so volatile, why congestion matters, why batteries make money, and why a transmission line failure 200 miles away can spike your local price. The grid is one big balancing act, priced second by second.`,
    },
  ],
  diagram: {
    type: 'svg',
    altText:
      'A simplified diagram showing supply (generators) and demand (loads) connected through transmission lines, with a balance line in the middle indicating they must equal at every instant.',
    caption: 'Supply meets demand — at every second, everywhere on the grid.',
    svg: `<svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg">
  <style>
    .label { font-family: 'Geist Mono', monospace; font-size: 11px; fill: rgba(241,241,243,0.45); letter-spacing: 0.15em; text-transform: uppercase; }
    .heading { font-family: 'Geist Mono', monospace; font-size: 13px; fill: #F1F1F3; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
    .line { stroke: #3B82F6; stroke-width: 1.5; fill: none; opacity: 0.6; }
    .gen { fill: rgba(59,130,246,0.10); stroke: #3B82F6; }
    .load { fill: rgba(245,158,11,0.10); stroke: #F59E0B; }
  </style>

  <text x="120" y="40" class="label">SUPPLY</text>
  <rect x="60" y="60" width="180" height="60" rx="4" class="gen" stroke-width="1.5"/>
  <text x="150" y="95" text-anchor="middle" class="heading">GENERATORS</text>
  <text x="150" y="135" text-anchor="middle" class="label">MW DELIVERED</text>

  <text x="680" y="40" class="label">DEMAND</text>
  <rect x="560" y="60" width="180" height="60" rx="4" class="load" stroke-width="1.5"/>
  <text x="650" y="95" text-anchor="middle" class="heading">LOADS</text>
  <text x="650" y="135" text-anchor="middle" class="label">MW CONSUMED</text>

  <line x1="240" y1="90" x2="560" y2="90" class="line" stroke-dasharray="4 4"/>
  <text x="400" y="78" text-anchor="middle" class="label">TRANSMISSION</text>

  <text x="400" y="180" text-anchor="middle" class="heading" fill="#F59E0B">SUPPLY = DEMAND</text>
  <text x="400" y="205" text-anchor="middle" class="label">EVERY SECOND · EVERYWHERE</text>

  <line x1="200" y1="220" x2="600" y2="220" stroke="rgba(245,158,11,0.3)" stroke-width="1"/>
  <text x="400" y="270" text-anchor="middle" class="label">THE FUNDAMENTAL CONSTRAINT</text>
</svg>`,
  },
  quiz: [
    {
      id: 'q1',
      prompt: 'Why is electricity unique among commodities?',
      options: [
        {
          id: 'a',
          text: 'It has to be generated and consumed at the same instant.',
          correct: true,
          explanation:
            'Storage exists but is limited. The grid balances supply and demand every second.',
        },
        { id: 'b', text: 'It can be stored cheaply for years.', correct: false },
        { id: 'c', text: 'It travels at the speed of sound.', correct: false },
        {
          id: 'd',
          text: 'It is the only commodity priced in dollars per megawatt-hour.',
          correct: false,
        },
      ],
    },
    {
      id: 'q2',
      prompt: 'What is the difference between MW and MWh?',
      options: [
        {
          id: 'a',
          text: 'MW is power (rate); MWh is energy (over time).',
          correct: true,
          explanation:
            'A 100 MW plant running for one hour delivers 100 MWh of energy.',
        },
        { id: 'b', text: 'They are the same thing.', correct: false },
        {
          id: 'c',
          text: 'MW is for renewables; MWh is for fossil fuels.',
          correct: false,
        },
        {
          id: 'd',
          text: 'MW is for transmission; MWh is for distribution.',
          correct: false,
        },
      ],
    },
    {
      id: 'q3',
      prompt:
        'Why can prices spike so dramatically (e.g., from $35 to $1,200 per MWh) on a hot afternoon?',
      options: [
        {
          id: 'a',
          text: 'Because demand grows faster than supply can respond, and the marginal generator becomes very expensive.',
          correct: true,
          explanation:
            'When all cheap generation is dispatched and demand is still rising, the grid pays whatever the most expensive available unit charges.',
        },
        {
          id: 'b',
          text: 'Because grid operators arbitrarily set prices.',
          correct: false,
        },
        { id: 'c', text: 'Because batteries fail in heat.', correct: false },
        {
          id: 'd',
          text: 'Because solar panels overproduce in summer.',
          correct: false,
        },
      ],
    },
    {
      id: 'q4',
      prompt: 'Roughly how much power does PJM draw at peak load?',
      options: [
        { id: 'a', text: 'About 165 GW (165,000 MW).', correct: true },
        { id: 'b', text: 'About 16 GW.', correct: false },
        { id: 'c', text: 'About 1.6 TW.', correct: false },
        { id: 'd', text: 'About 1,650 MW.', correct: false },
      ],
    },
    {
      id: 'q5',
      prompt:
        'Given the supply = demand constraint, what role does battery storage play?',
      options: [
        {
          id: 'a',
          text: 'It allows energy delivered in one hour to be consumed in another, partially relaxing the supply = demand constraint at the system level.',
          correct: true,
          explanation:
            'Storage time-shifts energy: charge when prices are low, discharge when prices are high. It does not violate the instant-by-instant constraint, but it makes the constraint more flexible across hours.',
        },
        {
          id: 'b',
          text: 'It eliminates the supply = demand constraint entirely.',
          correct: false,
        },
        {
          id: 'c',
          text: 'It only matters for renewable integration.',
          correct: false,
        },
        {
          id: 'd',
          text: 'It is irrelevant to wholesale market prices.',
          correct: false,
        },
      ],
    },
  ],
  relatedConcepts: ['a-grid', 'a-supply-demand', 'a-lmp'],
  nextLessonId: 'a-grid',
};
