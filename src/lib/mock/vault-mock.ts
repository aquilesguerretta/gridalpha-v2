// FOUNDRY mock — Vault destination data.
// 8 case studies (real PJM / cross-market events as source material) and
// 18 Alexandria concept nodes laid out for SVG rendering at 1080 width.

import type { CaseStudy, ConceptNode } from '@/lib/types/vault';

// ── Case studies ────────────────────────────────────────────────────────────

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'storm-elliott-2022',
    title: 'Storm Elliott',
    date: '2022-12-23',
    category: 'extreme',
    region: 'PJM-Wide',
    severity: 'critical',
    headline: 'Storm Elliott shut down 90 GW of generation across PJM and Southeast',
    metrics: [
      { label: 'Forced outages',         value: '24.0 GW' },
      { label: 'Peak LMP (DOMINION)',    value: '$4,250/MWh' },
      { label: 'DA-RT spread, peak',     value: '$2,800/MWh' },
      { label: 'Initial CP penalties',   value: '$1.8B' },
    ],
    prices24h: [38.4, 41.2, 48.6, 64.2, 88.4, 142.6, 412.8, 980.4, 1840.2, 3120.8, 4250.0, 4180.6, 3890.4, 3420.1, 2980.2, 2410.8, 1840.2, 1290.4, 880.6, 540.2, 320.4, 184.6, 96.4, 64.2],
    events: [
      { hour: 7,  label: 'PJM declares Maximum Generation Emergency.' },
      { hour: 10, label: 'Forced-outage total crosses 24 GW; LMP at cap.' },
      { hour: 18, label: 'Manual load shed avoided as imports stabilize.' },
    ],
    whatHappened:
      'Storm Elliott brought arctic temperatures across the eastern United States starting December 23, 2022. PJM\'s load forecast missed actual peak demand by roughly 10%, while generator forced outages reached 24 GW — nearly 23% of nameplate capacity. The largest contributors were natural-gas units unable to access non-firm fuel and coal units with frozen pile-handling equipment. PJM declared a Maximum Generation Emergency for two consecutive days, the longest such call in its history.',
    whyItHappened:
      'The Capacity Performance construct, which premised payments on individual-unit availability, had not stress-tested correlated cold-weather failures. Frozen instrument lines, restricted gas access, and cold-induced trips cascaded together. Residential heating load also exceeded forecasts because demand response to extreme-cold temperatures is harder to model than at typical winter conditions.',
    tradingImplication:
      'Elliott reframed how cold-weather tail risk is priced into forward curves. CP penalties consumed multi-year revenues for many generators, and the 2025/26 BRA cleared at $269.92/MW-day in part as a direct consequence. Hedging frameworks treating Elliott-class events as multi-σ outliers systematically under-compensate the seller.',
    sources: ['PJM Operations Release', 'FERC Joint Inquiry', 'S&P Platts'],
    relatedConcepts: ['a-capacity', 'a-ra-contracts', 'a-elcc'],
  },
  {
    id: 'pjm-heatwave-aug-2022',
    title: 'August 2022 PJM Heatwave',
    date: '2022-08-04',
    category: 'extreme',
    region: 'PJM Mid-Atlantic',
    severity: 'high',
    headline: 'Mid-Atlantic load hits 145.4 GW as heat dome holds for six consecutive days',
    metrics: [
      { label: 'Peak load',           value: '145.4 GW' },
      { label: 'Peak LMP (PSEG)',     value: '$612/MWh' },
      { label: 'Reserve margin low',  value: '8.4%' },
      { label: 'Consecutive 95°F+',   value: '6 days' },
    ],
    prices24h: [42.1, 38.9, 36.4, 34.8, 36.2, 41.4, 58.6, 88.2, 142.4, 198.6, 248.4, 312.8, 412.2, 528.4, 598.6, 612.0, 580.4, 498.2, 384.6, 248.4, 168.2, 112.4, 78.6, 54.2],
    events: [
      { hour: 14, label: 'Mid-Atlantic peak load passes 140 GW.' },
      { hour: 17, label: 'PSEG LMP touches $612/MWh on evening ramp.' },
      { hour: 19, label: 'MISO imports relieve PJM-WEST tightness.' },
    ],
    whatHappened:
      'An extended heat dome held over the mid-Atlantic for the first week of August 2022. PJM hit a 145.4 GW peak load — its highest since 2018. PSEG and Dominion hub LMPs touched $600/MWh during evening peaks, and reserve margins fell to 8.4%. PJM did not declare an emergency.',
    whyItHappened:
      'Cooling demand from sustained 95°F+ temperatures combined with modest wind drove the load profile. Solar performed well but offset only partial daytime load. The system held because of full coal-fleet availability, low forced-outage rates, and meaningful import availability from MISO across the western interface.',
    tradingImplication:
      'The contrast with Storm Elliott is instructive: a predictable summer heatwave was priced in well 48 hours ahead, while a sudden winter storm was not. For DA traders the run-up was tradeable from forecasts. For battery operators, the multi-day high-spread environment delivered the strongest revenue week of 2022.',
    sources: ['PJM Daily Operations', 'EIA Today in Energy', 'Bloomberg Power'],
    relatedConcepts: ['a-lmp', 'a-da-rt', 'a-battery-arb'],
  },
  {
    id: 'texas-feb-2021',
    title: 'Winter Storm Uri (ERCOT cross-reference)',
    date: '2021-02-14',
    category: 'extreme',
    region: 'ERCOT (cross-market)',
    severity: 'critical',
    headline: 'Winter Storm Uri forces ERCOT to shed 20 GW; price cap holds 85+ hours',
    metrics: [
      { label: 'Firm load shed',     value: '20 GW' },
      { label: 'Capped LMP',         value: '$9,000/MWh' },
      { label: 'Duration at cap',    value: '85+ hours' },
      { label: 'Co-op insolvencies', value: 'Multiple' },
    ],
    prices24h: [9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000],
    events: [
      { hour: 1,  label: 'ERCOT enters EEA Level 3; firm-load shed begins.' },
      { hour: 6,  label: 'Gas system pressure drops cascade to compressor stations.' },
      { hour: 23, label: 'Cap holds for 23rd consecutive hour.' },
    ],
    whatHappened:
      'Winter Storm Uri brought sub-zero temperatures to Texas February 14-19, 2021. ERCOT was forced to shed up to 20 GW of firm load to avoid uncontrolled grid collapse. The market price hit and held the $9,000/MWh cap for 85+ hours.',
    whyItHappened:
      'Multiple correlated failures stacked: gas-system pressure dropped as electricity to compressor stations failed, freezing of unwinterized generation equipment, and a load-forecast shortfall. ERCOT\'s energy-only construct gave generators no capacity-payment cushion; many monetized the cap event but counterparties to PPAs and retail providers absorbed catastrophic losses.',
    tradingImplication:
      'For PJM participants, Uri served as a warning case. If ERCOT could fail this catastrophically, PJM\'s hardened-but-correlated-risk framework warranted scrutiny — and Storm Elliott confirmed the warning 22 months later. Uri also catalyzed a national policy conversation about gas-electric coordination that continues to shape capacity-market reforms.',
    sources: ['ERCOT Press Release', 'FERC/NERC Inquiry', 'Reuters Energy'],
    relatedConcepts: ['a-isos', 'a-capacity', 'a-ra-contracts'],
  },
  {
    id: 'comed-negative-pricing',
    title: 'COMED Negative Pricing Window',
    date: '2026-04-11',
    category: 'arbitrage',
    region: 'PJM-COMED',
    severity: 'medium',
    headline: 'COMED prints LMP −$8.40/MWh during 90-minute overnight wind ramp',
    metrics: [
      { label: 'Minimum LMP',          value: '−$8.40/MWh' },
      { label: 'Duration',             value: '90 min' },
      { label: 'Wind output peak',     value: '18.4 GW' },
      { label: 'MISO export limit hit',value: '1.2 GW' },
    ],
    prices24h: [12.4, 8.2, 4.8, -2.1, -6.4, -8.4, -7.2, -3.8, 2.4, 18.6, 24.8, 28.4, 30.2, 31.8, 32.4, 33.6, 34.2, 36.8, 38.4, 36.2, 33.4, 30.1, 26.8, 22.4],
    events: [
      { hour: 3,  label: 'COMED LMP turns negative as wind output peaks.' },
      { hour: 5,  label: 'Trough holds at −$8.40/MWh; MISO export saturated.' },
      { hour: 9,  label: 'Morning ramp normalizes pricing to $18+/MWh.' },
    ],
    whatHappened:
      'An overnight wind ramp on April 11, 2026 pushed COMED zone LMPs to −$8.40/MWh between 02:30 and 04:00 local time. Wind output peaked at 18.4 GW across the COMED footprint — a YTD record at the time of the event.',
    whyItHappened:
      'Strong cold-front winds drove wind output well above forecast. With overnight load minimal, baseload nuclear unable to ramp down meaningfully, and the MISO interface saturated at 1.2 GW of export, the marginal generator was wind itself — bidding below zero given production-tax-credit motivation.',
    tradingImplication:
      'For battery operators, the event was a textbook charging opportunity: a 90-minute window of negative pricing followed by a 06:00 ramp normalized to $32/MWh. For DA virtuals, traders short DA into the trough captured the convergence. The pattern recurs in COMED on cold-front overnight wind ramps roughly six times per year.',
    sources: ['PJM eDart', 'Energy Dashboard', 'Wood Mackenzie'],
    relatedConcepts: ['a-lmp', 'a-battery-arb', 'a-virtuals'],
  },
  {
    id: 'pseg-basis-blowout-q3-2024',
    title: 'PSEG Basis Blowout — Q3 2024',
    date: '2024-08-12',
    category: 'congestion',
    region: 'PJM-PSEG',
    severity: 'high',
    headline: 'Artificial Island interface bind blows PSEG basis to $42/MWh',
    metrics: [
      { label: 'PSEG basis peak',          value: '$42.00/MWh' },
      { label: 'Constraint binding hours', value: '18' },
      { label: 'Congestion rent collected',value: '$11.4M' },
      { label: 'FTR payouts (week)',       value: 'Annual budget' },
    ],
    prices24h: [34.8, 33.2, 32.8, 33.4, 36.8, 48.4, 56.2, 62.4, 68.8, 72.4, 74.8, 76.2, 76.8, 75.4, 73.2, 71.8, 69.4, 66.2, 62.8, 58.4, 52.4, 46.8, 41.2, 37.4],
    events: [
      { hour: 5,  label: 'Artificial Island interface flagged as binding.' },
      { hour: 12, label: 'PSEG basis vs WEST_HUB exceeds $40/MWh.' },
      { hour: 22, label: 'Constraint relaxes; basis collapses below $5.' },
    ],
    whatHappened:
      'A series of unscheduled outages on the Artificial Island Interface — combined with a multi-day late-summer heatwave — pushed PSEG basis (vs. WEST_HUB) to a Q3 record $42/MWh. The constraint bound for 18 consecutive hours during the worst of the event.',
    whyItHappened:
      'PSEG zone is structurally import-dependent. With the interface degraded and load high, every additional MW had to come from internal generation at progressively higher heat rates. The marginal unit by mid-day was an old peaker running at low efficiency, with no realistic substitute given binding transmission.',
    tradingImplication:
      'FTRs against the bound interface paid out their entire annual budget in a single week. For traders without FTR coverage, PSEG-WEST_HUB DA-DA spread positions captured the move. The event reinforced that PSEG basis is one of the highest-conviction structural views in PJM.',
    sources: ['PJM Daily Operations', 'PSEG Q3 10-Q', 'RTO Insider'],
    relatedConcepts: ['a-congestion', 'a-basis', 'a-ftrs'],
  },
  {
    id: 'pjm-capacity-shortage-2024',
    title: '2024 PJM Capacity Auction Shortage',
    date: '2024-07-30',
    category: 'regulatory',
    region: 'PJM-Wide',
    severity: 'high',
    headline: 'PJM 2025/26 BRA clears at $269.92/MW-day, ~11× prior auction',
    metrics: [
      { label: 'Cleared price',           value: '$269.92/MW-day' },
      { label: 'Total auction revenue',    value: '$14.7B' },
      { label: 'Multiplier vs prior BRA',  value: '~11×' },
      { label: 'Cleared MW gap',           value: 'Reliability target' },
    ],
    prices24h: [32.4, 31.8, 31.2, 31.6, 33.2, 36.8, 39.4, 41.2, 42.4, 42.8, 42.6, 42.4, 42.2, 41.8, 41.4, 41.2, 41.6, 42.4, 42.8, 42.4, 41.2, 38.8, 35.6, 33.2],
    events: [
      { hour: 12, label: 'PJM publishes 2025/26 BRA results.' },
      { hour: 14, label: 'Forward energy curves reprice across PJM.' },
    ],
    whatHappened:
      'PJM\'s Base Residual Auction for the 2025/26 delivery year cleared at $269.92/MW-day on July 30, 2024 — roughly eleven times the prior year\'s clearing price and the highest in PJM history. Total auction revenue was approximately $14.7B.',
    whyItHappened:
      'The structural drivers were generation retirements (especially coal) outpacing new entry, capacity-accreditation reform that derated thermals to better reflect cold-weather performance, and load growth from data centers. The shortage was visible in the forward energy curve months before the auction; the BRA confirmed and quantified it.',
    tradingImplication:
      'The capacity print revalued every operating asset in PJM and pulled forward many development decisions. New batteries and gas peakers became economically viable at a different scale. For asset owners, the multi-year locked-in revenue stream is a meaningful change to the monetization stack.',
    sources: ['PJM BRA Results', 'Monitoring Analytics', 'Utility Dive'],
    relatedConcepts: ['a-capacity', 'a-elcc', 'a-bcap'],
  },
  {
    id: 'aep-nuclear-cascade-2023',
    title: 'AEP Nuclear Outage Cascade',
    date: '2023-09-08',
    category: 'forecast',
    region: 'PJM-AEP',
    severity: 'medium',
    headline: 'Cook Nuclear forced outage cascades into Don Quixote derate',
    metrics: [
      { label: 'Lost capacity',     value: '3.4 GW' },
      { label: 'AEP LMP peak',      value: '$284/MWh' },
      { label: 'DA-RT spread peak', value: '$48/MWh' },
      { label: 'Duration',          value: '14 days' },
    ],
    prices24h: [42.1, 39.8, 38.4, 39.2, 44.8, 68.2, 124.6, 184.2, 218.4, 248.6, 264.8, 278.2, 284.0, 281.4, 274.8, 264.2, 248.6, 224.8, 198.4, 168.2, 138.6, 108.4, 84.2, 62.8],
    events: [
      { hour: 4,  label: 'Cook Nuclear unscheduled trip detected.' },
      { hour: 10, label: 'Don Quixote-Babcock 765kV derate compounds shortfall.' },
      { hour: 13, label: 'AEP LMP touches $284/MWh.' },
    ],
    whatHappened:
      'A forced outage at Cook Nuclear on September 8, 2023 was followed within 96 hours by a Don Quixote-Babcock 765kV thermal derate, removing roughly 3.4 GW of usable capacity from AEP. AEP zone LMPs spiked to $284/MWh during the recovery window, and the DA-RT spread reached $48/MWh.',
    whyItHappened:
      'The Cook outage was unrelated to the transmission derate, but the combined effect tightened AEP substantially because internal coal-fleet was already in seasonal outage. The system relied heavily on PJM-EAST imports, compressing the WEST_HUB-AEP spread and driving the basis move.',
    tradingImplication:
      'A long AEP basis position was the highest-conviction trade across the recovery window. The event also exposed the correlation risk between local generation and transmission redundancy in zones with heavy coal retirements scheduled — a dynamic that continues to shape FTR auction valuations.',
    sources: ['NRC Event Notification', 'PJM Daily Operations', 'S&P Global'],
    relatedConcepts: ['a-congestion', 'a-basis', 'a-ftrs'],
  },
  {
    id: 'west-hub-peak-summer-2025',
    title: 'WEST_HUB Summer Peak Record',
    date: '2025-07-23',
    category: 'forecast',
    region: 'PJM-WEST_HUB',
    severity: 'low',
    headline: 'WEST_HUB sets new summer-peak load record at 22.8 GW',
    metrics: [
      { label: 'Peak load',             value: '22.8 GW' },
      { label: 'YoY growth',            value: '+4.2%' },
      { label: 'Data center load share',value: '2.4 GW' },
      { label: 'LMP at peak',           value: '$128/MWh' },
    ],
    prices24h: [38.4, 36.2, 34.8, 35.6, 41.2, 52.4, 64.8, 76.2, 84.8, 92.4, 98.6, 104.2, 112.6, 120.4, 124.8, 128.0, 124.6, 116.4, 102.8, 88.4, 72.6, 58.2, 48.4, 42.6],
    events: [
      { hour: 15, label: 'WEST_HUB load passes prior 2018 peak.' },
      { hour: 16, label: 'New all-time peak set at 22.8 GW; LMP $128/MWh.' },
    ],
    whatHappened:
      'The WEST_HUB load center hit 22.8 GW on July 23, 2025 — a new all-time peak, narrowly exceeding 2018\'s prior record. Data-center load contributed approximately 2.4 GW of the total.',
    whyItHappened:
      'Load growth from data-center cluster expansion in eastern Pennsylvania, combined with a heat dome week, pushed cooling demand to record levels. The system handled the peak comfortably; reserve margin held at 14% during the peak hour.',
    tradingImplication:
      'The event confirmed the structural load-growth thesis informing PJM\'s capacity-market reforms. For traders, the peak was tradeable from temperature forecasts published 36 hours ahead. For developers, it accelerated the investment case for new gas peakers and battery storage in the WEST_HUB load pocket.',
    sources: ['PJM Daily Operations', 'Penn State Energy Brief', 'Bloomberg Power'],
    relatedConcepts: ['a-supply-demand', 'a-capacity', 'a-bcap'],
  },
];

// ── Alexandria curriculum graph ────────────────────────────────────────────
// Foundation 4 nodes / Mechanics 8 nodes / Advanced 6 nodes.
// Layout: 1080px wide canvas. y bands: foundation=80, mechanics=240, advanced=400.

export const ALEXANDRIA_NODES: ConceptNode[] = [
  // ── Foundation tier (4) ──────────────────────────
  { id: 'a-electricity',   label: 'What is electricity?', tier: 'foundation', parents: [],                              description: 'Watts, joules, energy vs power, basic units.',                          unlocked: true,  x: 135, y: 80 },
  { id: 'a-grid',          label: 'The grid',             tier: 'foundation', parents: ['a-electricity'],               description: 'Generators, transmission, distribution, load — the four pillars.',     unlocked: true,  x: 405, y: 80 },
  { id: 'a-supply-demand', label: 'Supply and demand',    tier: 'foundation', parents: ['a-grid'],                      description: 'Why electricity prices change minute to minute.',                       unlocked: true,  x: 675, y: 80 },
  { id: 'a-isos',          label: 'ISOs and RTOs',        tier: 'foundation', parents: ['a-grid'],                      description: 'Independent operators that run wholesale electricity markets.',         unlocked: true,  x: 945, y: 80 },

  // ── Mechanics tier (8) ───────────────────────────
  { id: 'a-lmp',           label: 'LMP',                  tier: 'mechanics',  parents: ['a-supply-demand', 'a-isos'],   description: 'Locational Marginal Price = energy + congestion + loss.',                unlocked: true,  x:  60, y: 240 },
  { id: 'a-congestion',    label: 'Congestion',           tier: 'mechanics',  parents: ['a-lmp'],                       description: 'Price difference between zones when transmission is binding.',           unlocked: true,  x: 200, y: 240 },
  { id: 'a-basis',         label: 'Basis',                tier: 'mechanics',  parents: ['a-lmp', 'a-congestion'],       description: 'Zonal price minus hub price — the locational risk component.',           unlocked: false, x: 340, y: 240 },
  { id: 'a-spark',         label: 'Spark spread',         tier: 'mechanics',  parents: ['a-lmp'],                       description: 'LMP minus fuel-adjusted dispatch cost — gas plant gross margin.',        unlocked: false, x: 480, y: 240 },
  { id: 'a-capacity',      label: 'Capacity market',      tier: 'mechanics',  parents: ['a-grid'],                      description: 'Forward auction paying generators to be available, separate from energy.', unlocked: false, x: 620, y: 240 },
  { id: 'a-ancillary',     label: 'Ancillary services',   tier: 'mechanics',  parents: ['a-grid'],                      description: 'Frequency regulation, reserves, voltage support — the grid\'s side dishes.', unlocked: false, x: 760, y: 240 },
  { id: 'a-da-rt',         label: 'DA vs RT',             tier: 'mechanics',  parents: ['a-lmp'],                       description: 'Day-ahead hourly auction vs five-minute real-time clearing.',            unlocked: false, x: 900, y: 240 },
  { id: 'a-dr',            label: 'Demand response',      tier: 'mechanics',  parents: ['a-capacity'],                  description: 'Loads paid to curtail when the grid is tight.',                          unlocked: false, x:1040, y: 240 },

  // ── Advanced tier (6) ────────────────────────────
  { id: 'a-ftrs',          label: 'FTRs',                 tier: 'advanced',   parents: ['a-congestion', 'a-basis'],     description: 'Financial Transmission Rights — hedges against congestion charges.',     unlocked: false, x:  90, y: 400 },
  { id: 'a-virtuals',      label: 'Virtual trading',      tier: 'advanced',   parents: ['a-da-rt'],                     description: 'Buy DA / sell RT (or vice versa) without physical delivery.',            unlocked: false, x: 270, y: 400 },
  { id: 'a-battery-arb',   label: 'Battery arbitrage',    tier: 'advanced',   parents: ['a-da-rt', 'a-spark'],          description: 'Charge cheap, discharge peak — bound by efficiency and cycles.',          unlocked: false, x: 450, y: 400 },
  { id: 'a-elcc',          label: 'ELCC',                 tier: 'advanced',   parents: ['a-capacity'],                  description: 'Effective Load-Carrying Capability — how PJM derates intermittent capacity.', unlocked: false, x: 630, y: 400 },
  { id: 'a-bcap',          label: 'BCAP',                 tier: 'advanced',   parents: ['a-capacity'],                  description: 'Battery Capacity Accreditation Procedure — battery-specific derate rules.', unlocked: false, x: 810, y: 400 },
  { id: 'a-ra-contracts',  label: 'RA contracts',         tier: 'advanced',   parents: ['a-capacity'],                  description: 'Bilateral resource-adequacy deals outside the centralized auction.',     unlocked: false, x: 990, y: 400 },
];

// ── SCRIBE Sub-Tier 1A "Foundations of Energy" tier ───────────────────────
// Added by SCRIBE alongside ALEXANDRIA_NODES — does NOT modify the existing
// 18 nodes. Rendered as a separate band ABOVE the Alexandria concept map.
// Each node id matches a CurriculumEntry.id under src/lib/curriculum/entries/.
// `tier: 'foundation'` is a placeholder for ConceptNode type compliance —
// the visual distinction comes from rendering this set in its own labelled
// band in Alexandria.tsx.

export const FOUNDATIONS_OF_ENERGY_NODES: ConceptNode[] = [
  {
    id:          'what-is-energy',
    label:       'What Is Energy?',
    tier:        'foundation',
    parents:     [],
    description: 'Energy is conserved. It transforms but is never destroyed.',
    unlocked:    true,
    x:            90,
    y:            80,
  },
  {
    id:          'power-vs-energy',
    label:       'Power vs Energy',
    tier:        'foundation',
    parents:     ['what-is-energy'],
    description: 'Power is the rate; energy is the quantity.',
    unlocked:    true,
    x:            270,
    y:            80,
  },
  {
    id:          'forms-of-energy',
    label:       'Forms of Energy',
    tier:        'foundation',
    parents:     ['what-is-energy', 'power-vs-energy'],
    description: 'Different storage modes of one conserved quantity.',
    unlocked:    true,
    x:            450,
    y:            80,
  },
  {
    id:          'units-and-orders-of-magnitude',
    label:       'Units & Orders of Magnitude',
    tier:        'foundation',
    parents:     ['what-is-energy', 'power-vs-energy', 'forms-of-energy'],
    description: 'Every energy quantity reduces to joules.',
    unlocked:    true,
    x:            630,
    y:            80,
  },
  {
    id:          'entropy-and-second-law',
    label:       'Entropy & Second Law',
    tier:        'foundation',
    parents:     ['what-is-energy', 'power-vs-energy', 'forms-of-energy', 'units-and-orders-of-magnitude'],
    description: 'Energy has direction; it always tends to disperse.',
    unlocked:    true,
    x:            810,
    y:            80,
  },
  {
    id:          'efficiency',
    label:       'Efficiency',
    tier:        'foundation',
    parents:     ['what-is-energy', 'power-vs-energy', 'forms-of-energy', 'units-and-orders-of-magnitude', 'entropy-and-second-law'],
    description: 'A ratio defined by a chosen system boundary.',
    unlocked:    true,
    x:            990,
    y:            80,
  },
];
