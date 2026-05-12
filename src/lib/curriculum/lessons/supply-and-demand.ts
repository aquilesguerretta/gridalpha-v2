import type { Lesson } from '@/lib/types/curriculum';

export const supplyAndDemand: Lesson = {
  id: 'a-supply-demand',
  title: 'Supply and demand',
  difficulty: 'foundation',
  readingMinutes: 7,
  eyebrow: '03 · FOUNDATION',
  identity: 'Why prices change minute to minute.',
  sections: [
    {
      heading: 'Merit order.',
      content: `Every five minutes, PJM dispatches the cheapest available generators first and works its way up the cost stack until supply meets demand. This ordering is the merit order. Nuclear and the lowest-heat-rate combined-cycle gas units sit at the bottom of the stack — they run almost continuously because they are almost always cheaper than the alternatives. Coal sits in the middle, peaker gas turbines at the top, and during scarcity, the most expensive demand-response and emergency resources sit above that.

A unit's offer reflects fuel cost divided by efficiency, plus variable operations and maintenance, plus opportunity cost. A modern combined-cycle plant with a 6.8 MMBtu/MWh heat rate burning $3 gas offers around $24/MWh. An aging single-cycle peaker with a 12 MMBtu/MWh heat rate burning the same gas offers $42/MWh. When demand is low, only the cheap units run. When demand is high, PJM has to climb the stack into expensive territory.`,
    },
    {
      heading: 'The marginal unit sets the price.',
      content: `Here is the rule that surprises people the first time they hear it: every unit dispatched in a given five-minute interval gets paid the same clearing price. That price is the offer of the most expensive unit needed to meet load — the marginal unit. The cheap nuclear plant clearing $24 gets paid the same per-megawatt price as the gas peaker clearing $180 if the peaker is what closed the gap.

This single-price clearing rule is what makes electricity markets work the way they do. It is also what makes a $35 baseline price flip to $612/MWh in PSEG within an hour: the marginal unit has changed. When efficient combined-cycle units are sufficient to meet demand, prices stay calm. When PJM has to climb past coal into peakers, into oil units, or into demand response, the price moves dramatically — even though most of the dispatched fleet has not changed.

A trader who can predict when the marginal unit will switch — from gas to peaker, from peaker to demand response — is a trader who can predict price spikes hours before they happen.`,
    },
    {
      heading: 'The daily shape.',
      content: `Demand follows a daily curve. The overnight trough sits roughly 35 to 40 percent below the daytime peak. Demand begins climbing around 5 a.m. as people wake, lights and HVAC turn on, and the morning industrial shift starts. Load peaks in the afternoon between roughly 2 and 6 p.m. — air conditioning in summer, lighting and heating in winter. Then it ramps down through the evening into the next overnight trough.

Solar overlays a midday hump on the supply side. In zones with significant solar penetration, the net load — total demand minus solar output — develops a "duck curve" with a deep midday belly and a steep evening ramp as the sun sets and air conditioning is still running. The evening ramp is where prices live: PJM has to dispatch fast-ramping gas units to fill the gap left by setting solar.

Seasonality matters too. PJM is a summer-peaking system: peak load typically lands in late July or early August on a hot, humid afternoon. Winter peaks happen too, usually during a multi-day cold snap, but they are normally smaller. Storm Elliott in December 2022 was the exception that reshaped how the market thinks about winter risk.`,
    },
    {
      heading: 'Renewables shift the stack.',
      content: `Wind and solar enter the merit order at zero or even negative offer prices because their fuel is free and they receive production tax credits. When wind output is high — typically during cold-front overnight conditions in COMED and AEP — wind displaces gas at the bottom of the stack and pushes the marginal unit lower. The clearing price falls accordingly.

Push hard enough and the price goes negative, as COMED demonstrated on April 11, 2026 when 18.4 GW of overnight wind output drove the zone LMP to negative $8.40/MWh for 90 minutes. Wind operators were willing to bid below zero because their PTC compensation is paid per MWh produced regardless of market price.

For traders, the lesson is that the stack is dynamic. Wind output, solar output, fuel prices, and unit availability all reshape the merit order continuously. The best models combine real-time fuel curves, day-ahead weather forecasts, and the published outage schedule to estimate where the marginal unit will sit hour by hour.`,
    },
  ],
  diagram: {
    type: 'svg',
    altText:
      'A merit order supply stack chart showing nuclear, combined-cycle gas, coal, single-cycle peakers, and demand response in ascending offer-price order, with a horizontal demand line crossing into the peaker tier and the marginal unit highlighted.',
    caption: 'Merit order — the marginal unit sets the price for every unit dispatched.',
    svg: `<svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg">
  <style>
    .label { font-family: 'Geist Mono', monospace; font-size: 10px; fill: rgba(241,241,243,0.45); letter-spacing: 0.12em; text-transform: uppercase; }
    .price { font-family: 'Geist Mono', monospace; font-size: 11px; fill: rgba(241,241,243,0.7); font-weight: 600; }
    .heading { font-family: 'Geist Mono', monospace; font-size: 12px; fill: #F1F1F3; font-weight: 600; letter-spacing: 0.10em; text-transform: uppercase; }
  </style>

  <text x="40" y="40" class="heading">SUPPLY STACK · MERIT ORDER</text>

  <line x1="60" y1="280" x2="760" y2="280" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <line x1="60" y1="60" x2="60" y2="280" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

  <rect x="60"  y="240" width="120" height="40" fill="rgba(251,191,36,0.20)" stroke="#FBBF24" stroke-width="1"/>
  <text x="120" y="265" text-anchor="middle" class="label">NUCLEAR</text>
  <text x="120" y="295" text-anchor="middle" class="price">$8</text>

  <rect x="180" y="220" width="160" height="60" fill="rgba(249,115,22,0.20)" stroke="#F97316" stroke-width="1"/>
  <text x="260" y="255" text-anchor="middle" class="label">CC GAS</text>
  <text x="260" y="295" text-anchor="middle" class="price">$24</text>

  <rect x="340" y="190" width="140" height="90" fill="rgba(107,114,128,0.20)" stroke="#6B7280" stroke-width="1"/>
  <text x="410" y="240" text-anchor="middle" class="label">COAL</text>
  <text x="410" y="295" text-anchor="middle" class="price">$38</text>

  <rect x="480" y="120" width="140" height="160" fill="rgba(59,130,246,0.30)" stroke="#3B82F6" stroke-width="2"/>
  <text x="550" y="195" text-anchor="middle" class="label">PEAKER GAS</text>
  <text x="550" y="295" text-anchor="middle" class="price">$92</text>

  <rect x="620" y="80"  width="140" height="200" fill="rgba(239,68,68,0.20)" stroke="#EF4444" stroke-width="1"/>
  <text x="690" y="180" text-anchor="middle" class="label">DR / EMERGENCY</text>
  <text x="690" y="295" text-anchor="middle" class="price">$300+</text>

  <line x1="60" y1="160" x2="760" y2="160" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="745" y="155" text-anchor="end" class="label" fill="#F59E0B">DEMAND</text>

  <line x1="550" y1="120" x2="550" y2="60" stroke="#F59E0B" stroke-width="1" stroke-dasharray="2 2"/>
  <text x="550" y="55" text-anchor="middle" class="label" fill="#F59E0B">MARGINAL UNIT · CLEARS AT $92</text>
</svg>`,
  },
  quiz: [
    {
      id: 'q1',
      prompt: 'What is the merit order?',
      options: [
        {
          id: 'a',
          text: 'The ordering of generators from cheapest to most expensive offer, used by PJM to dispatch supply against demand.',
          correct: true,
          explanation:
            'PJM works up the stack from the bottom until total supply equals total demand.',
        },
        { id: 'b', text: 'A ranking of generators by reliability score.', correct: false },
        { id: 'c', text: 'The order in which generators were built.', correct: false },
        { id: 'd', text: 'A merit-based award given to top-performing plants each year.', correct: false },
      ],
    },
    {
      id: 'q2',
      prompt: 'In a single five-minute clearing interval, how does PJM pay dispatched generators?',
      options: [
        {
          id: 'a',
          text: 'Every dispatched unit gets paid the same clearing price — the offer of the marginal unit.',
          correct: true,
          explanation:
            'The cheap nuclear plant gets the same per-MWh clearing price as the expensive peaker that closed the gap. This is the single-price clearing rule.',
        },
        { id: 'b', text: 'Each unit is paid its own offer price.', correct: false },
        { id: 'c', text: 'PJM pays the average of all dispatched offers.', correct: false },
        {
          id: 'd',
          text: 'PJM pays each unit a fixed regulated rate, plus a bonus for the peakers.',
          correct: false,
        },
      ],
    },
    {
      id: 'q3',
      prompt:
        'Why does a baseline price of $35/MWh sometimes spike to $600+/MWh during a hot afternoon?',
      options: [
        {
          id: 'a',
          text: 'The marginal unit has shifted from cheap combined-cycle gas into expensive peaker units or demand response, dragging the clearing price up with it.',
          correct: true,
          explanation:
            'Most of the dispatched fleet has not changed. What changed is the offer of the most expensive unit needed to close the supply-demand gap.',
        },
        {
          id: 'b',
          text: 'PJM operators manually raise the price to discourage demand.',
          correct: false,
        },
        { id: 'c', text: 'Generators collude to drive up prices.', correct: false },
        {
          id: 'd',
          text: 'Spot prices follow the published forward curve regardless of dispatch.',
          correct: false,
        },
      ],
    },
    {
      id: 'q4',
      prompt: 'What is the "duck curve" in zones with significant solar penetration?',
      options: [
        {
          id: 'a',
          text: 'A net-load shape with a deep midday belly from solar output and a steep evening ramp as the sun sets while demand stays high.',
          correct: true,
          explanation:
            'The evening ramp is where PJM has to dispatch fast gas units to fill the gap. Prices typically peak during the evening ramp.',
        },
        { id: 'b', text: 'The annual peak load during duck-hunting season.', correct: false },
        { id: 'c', text: 'A regulatory curve mandating renewable-energy procurement.', correct: false },
        { id: 'd', text: 'The trajectory of LMP during a winter cold snap.', correct: false },
      ],
    },
    {
      id: 'q5',
      prompt: 'Why do wind operators sometimes bid below zero into the day-ahead market?',
      options: [
        {
          id: 'a',
          text: 'Production tax credits pay them per MWh generated regardless of market price, so they can profitably accept negative LMPs up to the value of the credit.',
          correct: true,
          explanation:
            'COMED printed -$8.40/MWh on April 11, 2026 in a 90-minute overnight wind ramp because wind was the marginal resource bidding below zero.',
        },
        { id: 'b', text: 'Wind operators pay PJM to take their power as a public-relations gesture.', correct: false },
        {
          id: 'c',
          text: 'Negative bids are required by FERC during overnight hours.',
          correct: false,
        },
        {
          id: 'd',
          text: 'Wind costs are negative because the wind itself does work on the turbine.',
          correct: false,
        },
      ],
    },
  ],
  relatedConcepts: ['a-grid', 'a-isos', 'a-lmp', 'a-da-rt'],
  nextLessonId: 'a-isos',
};
