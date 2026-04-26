import type { Lesson } from '@/lib/types/curriculum';

export const theGrid: Lesson = {
  id: 'a-grid',
  title: 'The grid',
  difficulty: 'foundation',
  readingMinutes: 7,
  eyebrow: '02 · FOUNDATION',
  identity: 'A continent wired together.',
  sections: [
    {
      heading: 'Four pillars.',
      content: `The grid has four moving parts: generation, transmission, distribution, and load. Generation is the power plants — gas, nuclear, coal, wind, solar, batteries. Transmission is the high-voltage skeleton that carries power hundreds of miles. Distribution is the lower-voltage local network that drops it onto your street. Load is everything that consumes — homes, factories, data centers, EV chargers.

Each pillar runs on different physics, different economics, and different regulators. Generation is competitive in PJM; anyone with a plant can bid into the market. Transmission is a regulated monopoly run by member utilities under PJM's planning oversight. Distribution is owned by your local utility — Exelon, PSEG, Dominion. Load is whoever pays the bill.

When market participants say "the grid," they almost always mean the transmission system. That's the part PJM dispatches, prices, and plans. Distribution is critical for keeping your lights on, but it doesn't show up in wholesale prices.`,
    },
    {
      heading: 'The voltage staircase.',
      content: `Power steps down as it moves from generator to outlet. A typical 1,000 MW gas plant generates at 22 kV and immediately transformer-steps up to 500 kV or 765 kV for long-distance transmission. PJM's highest-voltage backbone — the 765 kV network in the AEP and Allegheny zones — moves bulk power from West Virginia coal country eastward toward Mid-Atlantic load centers.

From there it steps down: 500 kV and 345 kV regional transmission, 230 kV and 138 kV sub-transmission feeding into substations, 35 kV and 12 kV distribution feeders, and finally 240 V at your service panel. Each step happens in a transformer, and each transformer adds a small amount of loss.

Why bother with the staircase? Higher voltage means lower current for the same amount of power, which means thinner conductors and less resistive loss. Long-distance transmission at 765 kV loses about 1 percent per 100 miles. The same power moved at 12 kV would be unusable beyond a few miles.`,
    },
    {
      heading: 'Three grids, not one.',
      content: `North America has three separate AC grids: the Eastern Interconnection, the Western Interconnection, and ERCOT (most of Texas). They run at the same nominal frequency — 60 Hz — but they are not synchronously connected. A small number of high-voltage DC ties move power between them, but only on the order of single-digit gigawatts.

PJM lives inside the Eastern Interconnection along with MISO, SPP, NYISO, ISO-NE, the Southeast utilities, and large chunks of Canada. Within the Eastern Interconnection, PJM exchanges thousands of megawatts daily across its tie lines with MISO (to the west), NYISO (to the north), TVA and the Southeast (to the south), and Ontario.

The split into three grids is the reason Storm Uri stayed contained to ERCOT in February 2021 — the catastrophic frequency excursion did not propagate east. It is also the reason ERCOT cannot easily import from neighbors when its own generation fails. PJM, by contrast, leaned heavily on MISO imports during the August 2022 heatwave.`,
    },
    {
      heading: 'Why the geometry matters.',
      content: `Every transmission line has a thermal limit — the maximum amount of power it can carry before its conductors sag too far or its terminal equipment overheats. When demand pushes a line up against that limit, PJM is forced to dispatch more expensive generation on the importing side instead of cheaper generation on the exporting side. The price at the constrained location goes up. This is congestion.

This is why PSEG zone LMPs blow out in summer evenings even when WEST_HUB is sitting at $40/MWh — the Artificial Island Interface and the broader path into northern New Jersey can only carry so much. It is also why an outage on a 765 kV transmission line in central Ohio can move AEP zone prices by $50/MWh within minutes.

The grid is geometry. The price you see at any zone is a function of where the power is generated, where it is consumed, and which transmission lines are between them. Master the geometry and the rest of the market starts making sense.`,
    },
  ],
  diagram: {
    type: 'svg',
    altText:
      'A simplified diagram of the PJM transmission grid showing three voltage tiers: 765 kV backbone, 500 kV and 345 kV regional transmission, and 230 kV and 138 kV sub-transmission, feeding distribution and load.',
    caption: 'The voltage staircase — bulk transmission steps down to local distribution.',
    svg: `<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
  <style>
    .label { font-family: 'Geist Mono', monospace; font-size: 10px; fill: rgba(241,241,243,0.45); letter-spacing: 0.15em; text-transform: uppercase; }
    .heading { font-family: 'Geist Mono', monospace; font-size: 12px; fill: #F1F1F3; font-weight: 600; letter-spacing: 0.10em; text-transform: uppercase; }
    .voltage { font-family: 'Geist Mono', monospace; font-size: 11px; fill: #F59E0B; font-weight: 600; letter-spacing: 0.10em; }
  </style>

  <text x="400" y="30" text-anchor="middle" class="heading">THE VOLTAGE STAIRCASE</text>

  <line x1="80" y1="80" x2="720" y2="80" stroke="#3B82F6" stroke-width="3" opacity="0.85"/>
  <circle cx="80" cy="80" r="6" fill="#3B82F6"/>
  <circle cx="720" cy="80" r="6" fill="#3B82F6"/>
  <text x="80" y="105" text-anchor="middle" class="label">GENERATOR</text>
  <text x="720" y="105" text-anchor="middle" class="label">SUBSTATION</text>
  <text x="400" y="72" text-anchor="middle" class="voltage">765 kV · BULK TRANSMISSION</text>

  <line x1="180" y1="160" x2="620" y2="160" stroke="#3B82F6" stroke-width="2" opacity="0.7"/>
  <circle cx="180" cy="160" r="5" fill="#3B82F6"/>
  <circle cx="620" cy="160" r="5" fill="#3B82F6"/>
  <text x="400" y="152" text-anchor="middle" class="voltage">230 kV · REGIONAL</text>
  <line x1="400" y1="86" x2="400" y2="160" stroke="rgba(59,130,246,0.5)" stroke-width="1" stroke-dasharray="3 3"/>

  <line x1="280" y1="240" x2="520" y2="240" stroke="#3B82F6" stroke-width="1.5" opacity="0.55"/>
  <circle cx="280" cy="240" r="4" fill="#3B82F6"/>
  <circle cx="520" cy="240" r="4" fill="#3B82F6"/>
  <text x="400" y="232" text-anchor="middle" class="voltage">12 kV · DISTRIBUTION</text>
  <line x1="400" y1="166" x2="400" y2="240" stroke="rgba(59,130,246,0.5)" stroke-width="1" stroke-dasharray="3 3"/>

  <rect x="350" y="280" width="100" height="50" rx="4" fill="rgba(245,158,11,0.10)" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="400" y="302" text-anchor="middle" class="heading">LOAD</text>
  <text x="400" y="320" text-anchor="middle" class="label">240 V</text>
  <line x1="400" y1="246" x2="400" y2="280" stroke="rgba(245,158,11,0.5)" stroke-width="1" stroke-dasharray="3 3"/>

  <text x="400" y="350" text-anchor="middle" class="label">EACH STEP DOWN HAPPENS IN A TRANSFORMER</text>
</svg>`,
  },
  quiz: [
    {
      id: 'q1',
      prompt: 'When market participants say "the grid," what are they almost always referring to?',
      options: [
        {
          id: 'a',
          text: 'The transmission system that PJM dispatches and prices.',
          correct: true,
          explanation:
            'Wholesale markets price transmission flows, not local distribution. Distribution is a regulated utility function.',
        },
        { id: 'b', text: 'The distribution network in your neighborhood.', correct: false },
        { id: 'c', text: 'The collection of all power plants in the region.', correct: false },
        { id: 'd', text: 'The wires that connect generation to substations only.', correct: false },
      ],
    },
    {
      id: 'q2',
      prompt: 'Why is PJM bulk transmission run at 765 kV instead of distribution-class voltages?',
      options: [
        {
          id: 'a',
          text: 'Higher voltage means lower current for the same power, which dramatically reduces resistive losses over long distances.',
          correct: true,
          explanation:
            'A 765 kV line loses roughly 1 percent per 100 miles. Moving the same power at 12 kV would be unusable beyond a few miles.',
        },
        { id: 'b', text: 'Higher voltage is cheaper to insulate.', correct: false },
        { id: 'c', text: 'Federal regulations require 765 kV for interstate transmission.', correct: false },
        { id: 'd', text: 'Higher voltage allows for thicker conductors.', correct: false },
      ],
    },
    {
      id: 'q3',
      prompt: 'How many synchronous AC interconnections does North America have?',
      options: [
        {
          id: 'a',
          text: 'Three — Eastern, Western, and ERCOT.',
          correct: true,
          explanation:
            'They all run at 60 Hz but are not synchronously connected. A handful of HVDC ties move limited power between them.',
        },
        { id: 'b', text: 'One — the entire continent runs as a single grid.', correct: false },
        { id: 'c', text: 'Seven — one per RTO.', correct: false },
        { id: 'd', text: 'Two — Eastern and Western only.', correct: false },
      ],
    },
    {
      id: 'q4',
      prompt: 'What is the direct cause of congestion at a transmission constraint?',
      options: [
        {
          id: 'a',
          text: 'A line at its thermal limit forces PJM to dispatch more expensive generation on the importing side instead of cheaper generation on the exporting side.',
          correct: true,
          explanation:
            'The price at the constrained location rises because the next available unit on the importing side has a higher offer.',
        },
        {
          id: 'b',
          text: 'Generators raise prices because they know the line is congested.',
          correct: false,
        },
        {
          id: 'c',
          text: 'PJM imposes a congestion fee on transactions across the constraint.',
          correct: false,
        },
        {
          id: 'd',
          text: 'Power slows down as it crosses a binding line.',
          correct: false,
        },
      ],
    },
    {
      id: 'q5',
      prompt:
        'Why did Storm Uri stay contained to ERCOT in February 2021 instead of cascading into the Eastern Interconnection?',
      options: [
        {
          id: 'a',
          text: 'ERCOT is electrically islanded from the Eastern Interconnection — the limited HVDC ties cannot transmit a frequency excursion synchronously.',
          correct: true,
          explanation:
            'The same isolation that protected the East from Uri is also what prevented Texas from importing meaningful relief during the storm.',
        },
        {
          id: 'b',
          text: 'PJM operators tripped their interties to protect the Eastern grid.',
          correct: false,
        },
        {
          id: 'c',
          text: 'ERCOT generation has different frequency standards from PJM.',
          correct: false,
        },
        {
          id: 'd',
          text: 'Cold weather did not extend beyond the ERCOT footprint.',
          correct: false,
        },
      ],
    },
  ],
  relatedConcepts: ['a-electricity', 'a-supply-demand', 'a-isos', 'a-congestion'],
  nextLessonId: 'a-supply-demand',
};
