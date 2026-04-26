import type { Lesson } from '@/lib/types/curriculum';

export const isosAndRtos: Lesson = {
  id: 'a-isos',
  title: 'ISOs and RTOs',
  difficulty: 'foundation',
  readingMinutes: 7,
  eyebrow: '04 · FOUNDATION',
  identity: 'Who actually runs the market.',
  sections: [
    {
      heading: 'What an ISO is.',
      content: `An Independent System Operator runs the wholesale electricity market and dispatches the transmission grid for a defined geographic footprint. A Regional Transmission Organization is the same idea on a larger, multi-state scale with additional federal oversight responsibilities. In practice the terms are used interchangeably; PJM is technically an RTO, ERCOT is technically an ISO, and nobody's usage stays consistent for long.

What matters is the function. The ISO is independent of any single generator, transmission owner, or load-serving entity. It clears the day-ahead and real-time markets, dispatches generation every five minutes, ensures reliability, calls emergencies when supply gets tight, and runs the long-term capacity and transmission planning processes. It does not own generation. It does not own transmission. It is a referee with a dispatch console.

Before the ISO model, vertically integrated utilities owned everything from the generator to your meter and self-dispatched their own fleet. The shift to independent operators began with FERC Order 888 in 1996 and accelerated through the early 2000s. Today, two-thirds of US electricity demand is served by competitive ISO/RTO markets.`,
    },
    {
      heading: 'The seven North American RTOs.',
      content: `North America has seven organized markets. PJM is the largest by load and serves 65 million people across thirteen states and DC, from Chicago to the Atlantic. MISO covers fifteen Midwest and South-Central states from Manitoba to the Gulf. SPP runs the central plains from North Dakota to north Texas. ERCOT covers most of Texas as a separate interconnection. NYISO runs New York. ISO-NE runs the six New England states. CAISO runs most of California.

Outside those seven, the Southeast and the Mountain West remain dominated by vertically integrated utilities that self-dispatch. SPP and CAISO have launched western "energy imbalance markets" that import some of the ISO mechanics into utility territory without full RTO membership. The map is still slowly evolving.

For a market participant the choice of footprint matters. PJM and MISO are deep, liquid markets with mature financial transmission rights, robust forward curves, and active virtual trading. ERCOT is energy-only — there is no centralized capacity market — and the price cap is the highest in the country at $5,000/MWh after 2024 reforms. CAISO has heavy renewable penetration that makes its market behavior look unlike anything in the East.`,
    },
    {
      heading: 'What PJM actually does.',
      content: `PJM runs three markets continuously. The day-ahead energy market clears around 1:30 p.m. for delivery the following operating day, with hourly prices at every node in the system. The real-time energy market clears every five minutes during the operating day, with prices that often diverge sharply from the day-ahead settle. The capacity market — the Base Residual Auction — clears once a year, three years forward, and pays generators a fixed daily rate to be available when called.

In parallel PJM runs ancillary services markets for frequency regulation, synchronized reserves, and non-synchronized reserves. It manages the financial transmission rights auctions that hedge participants against zone-to-hub congestion. It runs the interconnection queue that decides which proposed generation projects get studied and built. And it administers the formal stakeholder process that produces market-rule changes — the source of every Order 2222, every Capacity Performance reform, every ELCC update.

PJM does not own generation or transmission. Its revenue comes from per-MWh administrative charges paid by every market participant. Its job is to price and dispatch what the participants own.`,
    },
    {
      heading: 'Where deregulation matters.',
      content: `Inside PJM, generation is competitive — anyone with a plant can bid into the energy and capacity markets. Transmission is run by the member utilities (Exelon, Dominion, AEP, FirstEnergy, others) under PJM's planning oversight. Distribution is run by the same utilities under state regulation, and retail supply is competitive in some states (Pennsylvania, Maryland, New Jersey, Ohio, parts of Illinois) and bundled in others (Virginia, West Virginia, Kentucky, Indiana).

For a trader, PJM's competitive wholesale market is the surface that matters. Prices are public, the auction rules are codified, and the same single clearing price applies to every participant. For an industrial customer in a deregulated retail state, the wholesale price flows through to procurement decisions; in a bundled state, it flows through to the regulated tariff with a multi-year lag.

The deregulation question matters because it determines who actually responds to a price signal. A $400/MWh peaker hour in WEST_HUB will pull a behind-the-meter battery in Pennsylvania (deregulated) into discharge mode. The same hour in Virginia (bundled) might trigger no consumer-level response at all, because the consumer never sees the price.`,
    },
  ],
  diagram: {
    type: 'svg',
    altText:
      'A simplified map of North America showing the seven organized wholesale electricity markets — PJM, MISO, SPP, ERCOT, NYISO, ISO-NE, and CAISO — with PJM highlighted as the largest by served load.',
    caption: 'Seven RTO/ISO footprints. PJM serves 65 million people from Chicago to the Atlantic.',
    svg: `<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
  <style>
    .label { font-family: 'Geist Mono', monospace; font-size: 10px; fill: rgba(241,241,243,0.45); letter-spacing: 0.10em; text-transform: uppercase; }
    .heading { font-family: 'Geist Mono', monospace; font-size: 12px; fill: #F1F1F3; font-weight: 600; letter-spacing: 0.10em; text-transform: uppercase; }
    .pjm { font-family: 'Geist Mono', monospace; font-size: 11px; fill: #3B82F6; font-weight: 700; letter-spacing: 0.10em; }
    .other { font-family: 'Geist Mono', monospace; font-size: 10px; fill: rgba(241,241,243,0.6); font-weight: 500; letter-spacing: 0.10em; }
    .pop { font-family: 'Geist Mono', monospace; font-size: 9px; fill: rgba(241,241,243,0.45); letter-spacing: 0.06em; }
  </style>

  <text x="400" y="34" text-anchor="middle" class="heading">SEVEN ORGANIZED MARKETS</text>

  <rect x="60"  y="100" width="120" height="80" rx="4" fill="rgba(241,241,243,0.04)" stroke="rgba(241,241,243,0.2)" stroke-width="1"/>
  <text x="120" y="135" text-anchor="middle" class="other">CAISO</text>
  <text x="120" y="155" text-anchor="middle" class="pop">39M · CA</text>

  <rect x="190" y="100" width="120" height="80" rx="4" fill="rgba(241,241,243,0.04)" stroke="rgba(241,241,243,0.2)" stroke-width="1"/>
  <text x="250" y="135" text-anchor="middle" class="other">SPP</text>
  <text x="250" y="155" text-anchor="middle" class="pop">19M · CENTRAL PLAINS</text>

  <rect x="320" y="100" width="160" height="80" rx="4" fill="rgba(241,241,243,0.04)" stroke="rgba(241,241,243,0.2)" stroke-width="1"/>
  <text x="400" y="135" text-anchor="middle" class="other">MISO</text>
  <text x="400" y="155" text-anchor="middle" class="pop">45M · MIDWEST + SOUTH</text>

  <rect x="490" y="100" width="120" height="80" rx="4" fill="rgba(59,130,246,0.18)" stroke="#3B82F6" stroke-width="2"/>
  <text x="550" y="135" text-anchor="middle" class="pjm">PJM</text>
  <text x="550" y="155" text-anchor="middle" class="pop">65M · 13 STATES + DC</text>

  <rect x="620" y="100" width="120" height="80" rx="4" fill="rgba(241,241,243,0.04)" stroke="rgba(241,241,243,0.2)" stroke-width="1"/>
  <text x="680" y="135" text-anchor="middle" class="other">NYISO</text>
  <text x="680" y="155" text-anchor="middle" class="pop">19M · NEW YORK</text>

  <rect x="225" y="220" width="120" height="80" rx="4" fill="rgba(241,241,243,0.04)" stroke="rgba(241,241,243,0.2)" stroke-width="1"/>
  <text x="285" y="255" text-anchor="middle" class="other">ERCOT</text>
  <text x="285" y="275" text-anchor="middle" class="pop">26M · TEXAS · ENERGY-ONLY</text>

  <rect x="455" y="220" width="120" height="80" rx="4" fill="rgba(241,241,243,0.04)" stroke="rgba(241,241,243,0.2)" stroke-width="1"/>
  <text x="515" y="255" text-anchor="middle" class="other">ISO-NE</text>
  <text x="515" y="275" text-anchor="middle" class="pop">14M · NEW ENGLAND</text>

  <text x="400" y="335" text-anchor="middle" class="label">PJM IS THE LARGEST BY LOAD · ENERGY + CAPACITY + ANCILLARIES</text>
</svg>`,
  },
  quiz: [
    {
      id: 'q1',
      prompt: 'What is the core function of an ISO/RTO?',
      options: [
        {
          id: 'a',
          text: 'It runs the wholesale market and dispatches the transmission grid as an independent referee, without owning generation or transmission.',
          correct: true,
          explanation:
            'PJM clears markets, dispatches every five minutes, ensures reliability, and runs capacity and transmission planning. It does not own assets.',
        },
        { id: 'b', text: 'It owns and operates the high-voltage transmission lines.', correct: false },
        { id: 'c', text: 'It generates and sells electricity to retail customers.', correct: false },
        {
          id: 'd',
          text: 'It writes the electricity rates that retail customers pay each month.',
          correct: false,
        },
      ],
    },
    {
      id: 'q2',
      prompt: 'How many organized wholesale electricity markets exist in North America?',
      options: [
        {
          id: 'a',
          text: 'Seven — PJM, MISO, SPP, ERCOT, NYISO, ISO-NE, and CAISO.',
          correct: true,
          explanation:
            'Two-thirds of US electricity demand is served by these seven markets. The Southeast and Mountain West remain vertically integrated.',
        },
        { id: 'b', text: 'Three — PJM, MISO, and ERCOT.', correct: false },
        { id: 'c', text: 'One per state — fifty markets total.', correct: false },
        { id: 'd', text: 'One unified national market.', correct: false },
      ],
    },
    {
      id: 'q3',
      prompt: 'Which structural feature most distinguishes ERCOT from PJM as a market design?',
      options: [
        {
          id: 'a',
          text: 'ERCOT is energy-only — there is no centralized capacity market — so generators rely entirely on energy and ancillary revenues.',
          correct: true,
          explanation:
            'ERCOT has the highest price cap in the country ($5,000/MWh after 2024 reforms) precisely because energy revenue is the only revenue stream.',
        },
        {
          id: 'b',
          text: 'ERCOT runs only a real-time market with no day-ahead settlement.',
          correct: false,
        },
        { id: 'c', text: 'ERCOT does not have a centralized dispatch system.', correct: false },
        { id: 'd', text: 'ERCOT bans virtual trading.', correct: false },
      ],
    },
    {
      id: 'q4',
      prompt: 'How does PJM fund its operations?',
      options: [
        {
          id: 'a',
          text: 'Per-MWh administrative charges paid by every market participant.',
          correct: true,
          explanation:
            'PJM owns no assets and earns no margin from market clearing. Its revenue model is a flat administrative fee on transactions it processes.',
        },
        {
          id: 'b',
          text: 'Federal subsidies allocated through FERC.',
          correct: false,
        },
        {
          id: 'c',
          text: 'A markup on the difference between day-ahead and real-time prices.',
          correct: false,
        },
        {
          id: 'd',
          text: 'Capacity-market clearing revenue retained by PJM as operator.',
          correct: false,
        },
      ],
    },
    {
      id: 'q5',
      prompt:
        'A $400/MWh peaker hour clears in WEST_HUB. Why might a behind-the-meter battery in Pennsylvania discharge while one in Virginia might not?',
      options: [
        {
          id: 'a',
          text: 'Pennsylvania has competitive retail supply that passes wholesale price signals to consumers; Virginia is bundled, so the consumer never sees the spike.',
          correct: true,
          explanation:
            'Deregulation determines who actually responds to a price signal. Wholesale prices clear the same way in both states, but retail customers experience them differently.',
        },
        {
          id: 'b',
          text: 'Pennsylvania has more battery capacity installed.',
          correct: false,
        },
        {
          id: 'c',
          text: 'Virginia batteries are physically blocked from PJM dispatch.',
          correct: false,
        },
        {
          id: 'd',
          text: 'Pennsylvania batteries get federal tax credits that Virginia batteries do not.',
          correct: false,
        },
      ],
    },
  ],
  relatedConcepts: ['a-grid', 'a-supply-demand', 'a-lmp', 'a-capacity'],
  nextLessonId: null,
};
