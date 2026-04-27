// SCRIBE — Entry 004 · Units and Orders of Magnitude
// Renderer-only contract: prose is verbatim from the Sub-Tier 1A handoff.
// Per Production Rule 4.7b, L1 stays in prose. The reference tables in L2
// and L3 are preserved as Markdown tables in the body strings.

import type { CurriculumEntry } from '@/lib/types/curriculum';

export const unitsAndOrdersOfMagnitude: CurriculumEntry = {
  id: 'units-and-orders-of-magnitude',
  number: 4,
  title: 'Units and Orders of Magnitude',
  tier: 1,
  phase: 1,
  subTier: '1A',
  thresholdConcept:
    'Every energy quantity reduces to joules. Different units reflect industry conventions, not different kinds of energy. Orders-of-magnitude reasoning is as important as exact numerical reasoning, because energy phenomena span 25 orders of magnitude from atomic to civilizational scales.',
  misconceptionDefeated:
    'The units used in different industries (BTU, barrel, ton, kWh) reflect different "kinds" of energy.',
  prerequisites: ['what-is-energy', 'power-vs-energy', 'forms-of-energy'],
  transformationChain: null,
  diagramSpec: {
    title: 'Unit Conversion Ladder + Orders of Magnitude',
    description:
      'A vertical scale with energy quantities marked at logarithmic intervals: 10⁻¹⁹ J at the bottom, 10²⁴ J at the top. Each marker is annotated with a recognisable example.',
    layerProgression: {
      L1: '~10 markers.',
      L2: '~20 markers + side inset of standard conversions.',
      L3: 'Full table with denser annotations.',
    },
    designNotes: 'Logarithmic scale critical; this diagram is the entry\'s most important visual.',
    componentName: 'UnitConversionLadder',
  },
  estimatedReadingTime: { L1: 10, L2: 13, L3: 16 },
  layers: {
    L1: {
      body: `**The Tower of Babel Problem**

Open a newspaper article about energy and you will find a strange thing: every kind of energy is measured in a different unit. Oil comes in barrels. Natural gas comes in cubic meters or "MMBtu." Coal comes in tons. Electricity comes in kilowatt-hours. Food energy comes in calories. Nuclear energy comes in something called electronvolts.

This looks like a wall of jargon. It feels like the energy industry is speaking five different languages to keep outsiders confused. But here is the thing: **all of these units are measuring the same thing.** They are all measuring energy. They are just using different yardsticks.

The reason is history. Each part of the energy industry grew up separately, and each one invented its own measuring system before anyone realized they were all measuring the same underlying quantity. The oil industry started shipping crude in 42-gallon whiskey barrels in the 1860s, and "barrel" stuck. The British steam engineers in the 18th century defined a "British thermal unit" by how much heat raised water by one degree Fahrenheit. American electrical utilities in the early 20th century billed customers by the hour, so the "kilowatt-hour" became the unit of retail electricity. None of these was wrong. They just never coordinated.

The good news: you do not need to memorize every conversion. You need to learn three things — what a joule is, how to translate between the most important units, and how to think in *orders of magnitude*. With those three, you can read any energy article in any industry and know roughly what is being said.

**What a Joule Is**

A joule is the fundamental scientific unit of energy. The good news: you already know what one joule feels like.

**One joule is approximately the energy needed to lift a small apple one meter against gravity.**

That's it. That's the basic unit. A small mechanical effort — lifting something light a short distance — is one joule. Your morning coffee, a hot beverage, contains about 100,000 joules of thermal energy. A AA battery stores about 9,000 joules. A gallon of gasoline holds about 130 million joules. The atomic bomb dropped on Hiroshima released about 60 trillion joules.

Joules are great for physics class but inconvenient for everyday energy. The numbers get unwieldy fast. So in commerce we use bigger units — kilowatt-hours, megawatt-hours, MMBtu — that pack many joules into one number.

The most important translation:

**1 kilowatt-hour (kWh) = 3.6 million joules.**

When your home electric bill says you used 750 kWh last month, that is 750 × 3.6 million = 2.7 billion joules of energy delivered to your house. The kWh exists because billing in joules would mean printing bills with ten-digit numbers. Three digits of kWh is easier on everyone.

**The Conversions Worth Knowing**

You don't need to memorize a unit-conversion table. You need a small handful of mental anchors:

*For electricity:* kWh is the retail unit, MWh is the wholesale unit, GWh is the city-scale unit, TWh is the country-scale unit. Each step up is a thousand times bigger.

*For natural gas:* MMBtu (one million British thermal units) is the standard wholesale unit in the United States. One MMBtu is roughly 0.3 MWh — so when you see gas at "$3.00 per MMBtu" and electricity at "$30 per MWh," remember that converting gas to electricity requires both translation (the units differ by ~3.4×) and the efficiency loss of the power plant.

*For oil:* A "barrel" is 42 US gallons of crude oil, holding about 6 billion joules, or roughly the energy of 1,700 kWh of electricity. The barrel is a volume unit pretending to be an energy unit, which makes it slightly misleading — but the convention is too entrenched to change.

*For food:* A "Calorie" on a nutrition label (with a capital C) is actually a kilocalorie — 4,184 joules. So a 2,000-Calorie daily diet means 2,000 × 4,184 = roughly 8.4 million joules of food energy per day, or about 2.3 kWh. A human eats roughly the energy equivalent of a phone charge per day, which is one of the most striking facts in all of energy literacy.

The point is not to memorize every conversion. The point is to develop a *reflex*: when you see any energy quantity, your brain should ask, *what is this in joules, or what is this in kWh?* That mental translation is the difference between reading energy news passively and reading it critically.

**Orders of Magnitude: Why Scale Matters**

There is one more concept that is even more important than exact conversions: **orders of magnitude**.

An order of magnitude means a factor of 10. Two orders of magnitude is 100. Three is 1,000. Energy phenomena span an enormous range of scales — from the atomic energy of a single chemical bond up to the annual energy output of human civilization. The difference between these scales is roughly 25 orders of magnitude, or 10²⁵. That is unimaginably large.

When you are reading about energy, the *order of magnitude* matters as much as the exact number. Here are some anchors worth carrying around:

- A AA battery holds enough energy to lift a small car about 1 inch off the ground. Tiny.
- A gallon of gasoline holds enough energy to lift a small car about 30 *miles* into the air. Big.
- A US household uses about 30 kWh of electricity per day. This is the energy of about 1 gallon of gasoline.
- A modern Tesla battery holds about 75 kWh — about two and a half days of typical household consumption.
- A medium-sized power plant runs at about 1,000 MW, generating 24,000 MWh in a single day — enough to power 800,000 American households for one day.
- The United States consumes about 100 quadrillion BTU per year of primary energy. That is roughly the energy in 17 billion barrels of oil equivalent.
- The sun delivers more energy to Earth in one *hour* than the entire human civilization uses in one year.

If you carry these anchors in your head, you can do an instant sanity check on almost any energy claim. Someone tells you a new battery "will power a million homes for a week." Quick check: a million homes use about 30 GWh per day, or 210 GWh per week. Is the claimed battery in that order of magnitude? If not, the claim is wrong before you do any deeper analysis.

**What You Should Take Away**

If you remember nothing else from this entry: **every energy quantity in the world reduces to joules, and you need to develop the reflex of translating any unit you encounter into either joules or kilowatt-hours so you can compare it to other quantities.**

You do not need to memorize every conversion factor. You need three things in your head:
1. What a joule is (small apple, one meter, gravity).
2. The handful of conversions that translate the most common units to kWh.
3. A mental list of order-of-magnitude anchors so you can sanity-check any claim instantly.

Once you have those three, the energy industry stops looking like a Tower of Babel and starts looking like one big system speaking different dialects of the same language. And that fluency is the foundation of every later concept in Alexandria.`,
      examples: [
        {
          id: 'ex-4-gas-pipeline',
          title: 'Reading a gas pipeline news article.',
          audienceTags: ['Newcomer', 'Trader'],
          body: `You read: "The pipeline transported 500 million MMBtu of natural gas last year."

Quick translation: 500 million × 1 billion joules = 5 × 10¹⁷ joules, or 0.5 EJ.

Quick anchor: total US natural gas consumption is about 30 EJ/year. So this pipeline carried about 1.7% of US gas demand. That is a substantial pipeline but not a national-scale infrastructure asset.

If instead the article said "5 trillion MMBtu," your reflex should immediately flag it as suspicious — that would be ~150% of US gas consumption, which is impossible. The reflex catches errors that calculations would never catch because you would never have started calculating.`,
        },
        {
          id: 'ex-4-ev-vs-gas',
          title: 'Comparing an EV and a gas car.',
          audienceTags: ['Newcomer', 'Industrial', 'Engineer'],
          body: `A Tesla Model 3 has a 75 kWh battery and gets about 4 miles per kWh, so a full charge gets you about 300 miles of range.

A gallon of gasoline holds about 33 kWh of chemical energy. So a 12-gallon tank holds about 396 kWh of chemical energy. A gasoline car gets about 30 miles per gallon, so a full tank gets about 360 miles of range.

The Tesla, with 75 kWh, goes the same distance that a gas car needs 396 kWh to travel. The EV is roughly 5× more efficient at converting fuel energy into miles. This is one of the most important quantitative facts in the energy transition, and it falls out naturally once you can translate between kWh and gallons.`,
        },
        {
          id: 'ex-4-household',
          title: 'A US household energy footprint.',
          audienceTags: ['Newcomer', 'Industrial', 'Policy'],
          body: `The average American household uses about 30 kWh of electricity per day. That sounds abstract until you translate it.

Translate to joules: 30 kWh × 3.6 million J/kWh = 108 million joules. About one gallon of gasoline's worth of energy.

Translate to power: 30 kWh per day ÷ 24 hours per day = 1.25 kW continuous. Roughly the power of a microwave running all day, every day.

Translate to fuel: at 60% CCGT efficiency, that 30 kWh of electricity required ~50 kWh of natural gas to produce. That is about 170 MMBtu of gas per year, per household.

Same household, four different units, four different ways of seeing the same physical quantity. Once you can move between them, you can compare your household to an EV, to a steel mill, to a country, to the global energy system. They are all the same currency, just different denominations.`,
        },
      ],
      retrievalPrompt:
        'Find your most recent electric bill (or estimate from memory). Convert your monthly kWh consumption into joules, then into BTU. Now find a plausible gallon-of-gasoline figure for your monthly driving (miles ÷ MPG). Convert that gasoline into kWh-equivalent. Which is bigger — your monthly electricity use or your monthly gasoline use? Most Americans are surprised by the answer.',
      closingAnchor: `One last anchor worth carrying. Vaclav Smil, the energy historian, calculated that one barrel of crude oil contains roughly the energy equivalent of 25,000 hours of human manual labor. A single tank of gas in your car contains more useful energy than a strong human laborer could produce in a full year of unbroken work. The reason fossil fuels reshaped human civilization in two centuries is not abstract — it is this density. We learned how to summon, in seconds, the energy of armies of invisible workers. Every conversation about the energy transition is fundamentally a conversation about whether we can replace those invisible workers with sources that are sustainable but, joule for joule, far less concentrated.`,
    },
    L2: {
      body: `**Every Unit Reduces to Joules**

The energy industry uses dozens of different units. Coal is sold in tons. Natural gas in MMBtu or cubic meters. Oil in barrels. Electricity in kilowatt-hours. Food energy in calories. Atomic energy in electronvolts. National energy statistics in quads or exajoules.

It looks like chaos. It isn't. Every one of these units reduces to a single SI quantity: the joule (J). The variety reflects history — different industries adopted different conventions during their formative decades, and those conventions stuck. But underneath, every energy quantity is the same physical thing measured in different denominations. Becoming fluent in unit translation is the foundation of being able to think about energy professionally rather than merely react to it.

**The Core Conversions Worth Memorizing**

A practicing professional carries a small mental library of conversions. The minimum set:

- 1 kWh = 3.6 million joules (3.6 MJ)
- 1 MWh = 1,000 kWh = 3.6 GJ
- 1 BTU ≈ 1,055 joules
- 1 MMBtu (million BTU) = 1 billion joules ≈ 0.293 MWh
- 1 calorie (chemistry) ≈ 4.18 J; 1 food Calorie = 1 kcal = 4,184 J
- 1 barrel of oil (BOE) ≈ 6.1 GJ ≈ 1,700 kWh
- 1 ton of coal ≈ 24 GJ ≈ 6,700 kWh (for typical bituminous)
- 1 ton of LNG ≈ 52 GJ ≈ 14,400 kWh
- 1 quad = 1 quadrillion BTU = 1.055 × 10¹⁸ joules

The most important translation a US energy professional makes daily is between MMBtu (gas) and MWh (electricity), because this is the foundation of the spark spread and of every gas-to-power economic comparison. The shorthand: 1 MMBtu ≈ 0.293 MWh, or equivalently, 1 MWh ≈ 3.41 MMBtu. In a power plant context with a heat rate of 7,000 BTU/kWh: every MWh of electricity requires 7 MMBtu of gas input.

**Why the Units Differ Across Industries**

Each unit emerged from a specific industry's historical needs:

- **BTU** dates to 18th-century steam engineering — defined as the heat needed to raise one pound of water by one degree Fahrenheit. Locked into the US natural gas industry because gas was originally used for heating water.
- **Calorie** comes from chemistry and biology, where it tracks energy in chemical reactions and metabolism.
- **Kilowatt-hour** was adopted for electrical billing because utilities measured retail customers on hourly meter reads.
- **Barrel** of oil derives from 42-gallon American whiskey barrels used to ship petroleum in the 1860s. The volumetric measurement persists despite the underlying industry being entirely about energy content.
- **Quad** (quadrillion BTU) was introduced by US energy statisticians in the 1960s to give annual national-scale figures convenient three-digit numbers. The US uses ~100 quads of primary energy per year, which is a memorable round number in this unit.

None of these conventions is wrong. But all of them are arbitrary. The professional doesn't fight the conventions — the professional learns to read them and translate them on the fly.

**Orders of Magnitude: The Other Half of Quantitative Literacy**

Knowing the exact conversion is half of literacy. The other half is knowing the *scale* — the order of magnitude — of any quantity you encounter. Energy phenomena span a vast range, and conflating different scales produces analytical errors that no calculator can catch.

Some anchor magnitudes worth memorizing:

- A single AA battery: ~9,000 J, or about 2.5 Wh
- A smartphone full charge: ~50,000 J, or about 14 Wh
- A gallon of gasoline: ~130 million J, or about 33 kWh
- A typical US household per day: ~30 kWh of electricity (~10⁸ J)
- A Tesla Model 3 battery: ~75 kWh (~2.7 × 10⁸ J)
- A 1 GW power plant running for a day: ~24 GWh (~8.6 × 10¹³ J)
- A large nuclear reactor's annual output: ~8 TWh (~3 × 10¹⁶ J)
- US annual electricity consumption: ~4,200 TWh (~1.5 × 10¹⁹ J)
- Global annual primary energy: ~600 EJ (~6 × 10²⁰ J)
- Annual solar energy striking Earth: ~5.5 × 10²⁴ J (about 10,000× total human consumption)

The practitioner uses these anchors as plausibility checks. When you read that a new battery technology will "store a gigawatt-hour for a million people for a week," check the math: a million people consume ~30 GWh/day at typical US consumption, or ~210 GWh/week. A gigawatt-hour is 0.5% of that. The claim collapses on a single order-of-magnitude check.

**The Misconception to Defeat**

The most damaging mistake is treating the units as if they reflected different *kinds* of energy. They don't. A BTU in your gas bill is the same physical thing as a kWh on your electricity bill, just expressed in different denominations. Coal energy and electricity energy and oil energy and gas energy are not separate substances with separate accounting systems — they are all the same conserved quantity, measured in different units because of historical accident.

The professional implication: if you can't translate between units in your head, you can't read across the energy industry. You'll be locked into one sub-sector's idioms, unable to compare oil prices to gas prices to power prices on a common basis. Unit fluency is the precondition for cross-sector thinking, and cross-sector thinking is what every serious analyst does.`,
      workedExample: {
        id: 'wex-4-lng-cargo',
        title: 'Translating Across an LNG Cargo',
        body: `A standard LNG cargo (one shipload) carries about 3.5 million MMBtu of natural gas. Translate this into useful comparison terms:

*Step 1 — Convert to joules.*
3.5 × 10⁶ MMBtu × 1.055 × 10⁹ J/MMBtu = **3.69 × 10¹⁵ J = 3.69 PJ**

*Step 2 — Convert to MWh equivalent.*
3.5 × 10⁶ MMBtu × 0.293 MWh/MMBtu = **1.026 × 10⁶ MWh = 1.026 TWh**

*Step 3 — Translate to physical scale.*
At an average US household consumption of ~10 MWh/year, this single cargo could supply: 1.026 × 10⁶ MWh ÷ 10 MWh/household-year = **~100,000 households for one year**.

*Step 4 — Translate to generation.*
If burned in a CCGT at 60% efficiency: 1.026 TWh × 0.60 = **~616 GWh** of electricity. At a typical PJM peak load of ~150 GW, this is ~4 hours of total grid power. The cargo is large in absolute terms but small relative to a major grid's hourly throughput.

This kind of translation is the bread-and-butter analytical move in energy. Every claim, every news item, every contract gets unpacked into the same currency (joules or megawatt-hours), then compared to known anchors.`,
        widgetSpec: {
          type: 'unit-converter',
          description:
            'Universal Unit Converter — input quantity and unit; output unit (full dropdown), live conversion plus automatic comparison to recognisable anchors.',
          inputs: [
            { name: 'input quantity', type: 'number', default: 1 },
            { name: 'input unit', type: 'select', options: ['J', 'kJ', 'MJ', 'GJ', 'kWh', 'MWh', 'GWh', 'TWh', 'BTU', 'MMBtu', 'therm', 'cal', 'kcal', 'BOE', 'bbl', 'tonne coal', 'tonne LNG', 'eV'] },
            { name: 'output unit', type: 'select', options: ['J', 'kWh', 'MWh', 'MMBtu', 'BOE', 'tonne coal', 'tonne LNG'] },
          ],
          outputs: [
            { name: 'converted value', computation: 'input × conversion factor' },
            { name: 'household-day comparison', computation: 'value / 30 kWh' },
            { name: 'gas-gallon comparison', computation: 'value / 33 kWh' },
            { name: 'order of magnitude in joules', computation: 'log10(value in J)' },
          ],
        },
      },
      retrievalPrompt:
        'A natural gas power plant with a heat rate of 8,000 BTU/kWh runs at 80% capacity factor for a year. The plant has 500 MW of nameplate capacity. (a) How much electrical energy does it produce in MWh? (b) How much natural gas does it consume in MMBtu? (c) At a gas price of $3.00/MMBtu, what is the annual fuel cost?',
    },
    L3: {
      body: `**1. The SI Foundation and the Unit Ladder**

The SI base unit for energy is the joule (J), defined as one newton-meter or one watt-second. Every other unit in commercial, scientific, and industrial use reduces to joules through fixed conversion factors.

| Unit | Symbol | SI Equivalent | Primary Use |
|------|--------|---------------|-------------|
| Joule | J | 1 J | SI base |
| Calorie (thermochemical) | cal | 4.184 J | Chemistry, nutrition |
| Kilocalorie / "food calorie" | kcal / Cal | 4,184 J | Nutrition labels |
| British thermal unit | BTU | 1,055.06 J | US heating, gas |
| Therm | thm | 1.055 × 10⁸ J | US gas billing |
| Watt-hour | Wh | 3,600 J | Small electrical |
| Kilowatt-hour | kWh | 3.6 × 10⁶ J | Retail electricity |
| Megawatt-hour | MWh | 3.6 × 10⁹ J | Wholesale electricity |
| Million BTU | MMBtu | 1.055 × 10⁹ J | US natural gas |
| Quad | quad | 1.055 × 10¹⁸ J | National energy stats |
| Barrel of oil equivalent | BOE | ~6.12 × 10⁹ J | Oil and gas industry |
| Tonne of oil equivalent | toe | ~4.19 × 10¹⁰ J | International stats (IEA) |
| Tonne of coal equivalent | tce | ~2.93 × 10¹⁰ J | International coal trade |
| Electronvolt | eV | 1.602 × 10⁻¹⁹ J | Atomic, nuclear physics |
| Exajoule | EJ | 10¹⁸ J | Global energy stats |

The proliferation of units is historical, not physical. BTUs date to 18th-century steam engineering. The therm was defined for British gas billing. The barrel of oil equivalent was conventionalized for petroleum reporting. The kilowatt-hour was adopted for electrical billing because retail utilities operated on hourly meter reads. Each unit emerged from the practical needs of a specific industry and persists in that industry's communications, contracts, and regulatory filings.

A practitioner must therefore read three completely different statements as expressing the same underlying physical quantity:

- "The LNG cargo carried 3.5 million MMBtu" → 3.5 × 10⁶ × 1.055 × 10⁹ J = 3.69 × 10¹⁵ J = 3.69 PJ
- "The coal plant burns 6,000 tons per day" (assuming bituminous coal at ~24 GJ/ton) → 6,000 × 2.4 × 10¹⁰ J/day = 1.44 × 10¹⁴ J/day = 144 TJ/day
- "The wind farm produced 800 GWh last year" → 800 × 10⁹ × 3,600 J = 2.88 × 10¹⁵ J = 2.88 PJ

The first and third statements describe quantities of comparable magnitude. The second is roughly 18 hours of one of those quantities expressed as a daily rate. Without unit fluency, this comparison is invisible.

**2. The Density Adjustment: From Mass/Volume to Energy**

Many commercial energy units are not pure energy units but combinations of mass or volume with assumed energy density.

*Volumetric units:*
- Barrel of crude oil (bbl): 42 US gallons (~159 L). Energy content varies by grade: WTI ~5.8 GJ/bbl, Brent ~5.7 GJ/bbl, heavier grades lower. The "barrel of oil equivalent" (BOE) is a standardized 6.12 GJ/bbl benchmark used for cross-fuel comparison.
- Cubic foot of natural gas (cf): typical heat content ~1,030 BTU/cf, varies by composition. 1,000 cf (Mcf) ≈ 1 MMBtu in industry shorthand.
- Cubic meter of natural gas (m³): ~38 MJ/m³ at typical pipeline composition.

*Mass units:*
- Tonne of coal (metric): bituminous ~24 GJ/t, lignite ~14 GJ/t, anthracite ~30 GJ/t. The "tonne of coal equivalent" (tce) standardizes to 29.3 GJ.
- Tonne of oil equivalent (toe): standardized to 41.87 GJ.
- Tonne of LNG: ~52 GJ/t (methane plus minor hydrocarbons).
- Tonne of hydrogen: ~120 GJ/t LHV (much higher per kg than fossil fuels, but very low volumetric density).

*Conversion competence:* A 30 mtpa LNG facility produces 30 × 10⁶ t × 52 GJ/t = 1.56 × 10¹⁸ J/year = 1.56 EJ/year. Annual US natural gas consumption is ~30 EJ. So the facility's output represents ~5% of US gas demand — a comparison invisible without unit translation.

**3. Orders of Magnitude as Analytical Discipline**

Energy phenomena span ~25 orders of magnitude in scale. Mistaking the order of magnitude is a categorical error, not a quantitative one.

| Scale | Approximate Energy (J) | Example |
|-------|------------------------|---------|
| Atomic chemical bond | ~10⁻¹⁹ to 10⁻¹⁸ | Single C-H bond: ~6 × 10⁻¹⁹ J |
| Single fission event | ~3 × 10⁻¹¹ | U-235 fission: ~200 MeV |
| ATP hydrolysis (cellular) | ~5 × 10⁻²⁰ | Single biochemical step |
| Lifting an apple 1 m | ~1 | Everyday mechanical |
| Calorie of food | ~4 | Single dietary calorie |
| AA battery | ~9,000 | ~2.5 Wh |
| Charge a smartphone | ~50,000 | ~14 Wh |
| Gallon of gasoline | ~1.3 × 10⁸ | ~33.7 kWh equivalent |
| Daily US household electricity | ~10⁸ | ~30 kWh |
| Tonne of TNT | 4.184 × 10⁹ | Convention for explosive yield |
| Barrel of oil | ~6 × 10⁹ | Petroleum benchmark |
| Tesla Model 3 battery (full) | ~2.5 × 10⁸ | ~75 kWh |
| Hiroshima yield | ~6 × 10¹³ | 15 kt TNT equivalent |
| Daily 1 GW power plant output | ~8.6 × 10¹³ | 24 GWh |
| Annual large nuclear plant | ~3 × 10¹⁶ | ~8 TWh |
| Annual US electricity | ~1.5 × 10¹⁹ | ~4,200 TWh |
| Annual global primary energy | ~6 × 10²⁰ | ~600 EJ |
| Solar energy reaching Earth/year | ~5.5 × 10²⁴ | ~10,000× human consumption |
| Earth's gravitational binding | ~2.5 × 10³² | Theoretical scale |

The practitioner uses orders of magnitude as a sanity check on every claim. A claim that "this battery technology will store enough energy to power a city for a week" requires order-of-magnitude verification: a city of 1 million people consumes ~10¹⁵ J/week. Does the proposed technology, at the proposed scale, plausibly store that quantity? The check kills perhaps 80% of speculative energy claims before any deeper analysis is required.

**4. Common Practitioner Errors**

*Error 1: Dimensional inconsistency.* Statements like "we generated 500 megawatts last year" mix power and energy units. The correct statement is either "we have 500 MW of capacity" (power) or "we generated [some MWh figure] last year" (energy). The error appears in industry press and even in regulatory filings.

*Error 2: Higher heating value vs lower heating value confusion.* Fuel energy content is reported on either a higher heating value (HHV) basis, which includes the latent heat of water vapor condensation, or lower heating value (LHV), which excludes it. The convention varies by region (HHV dominant in US, LHV dominant in Europe) and by fuel (LHV standard for gas turbines because exhaust water leaves uncondensed). For natural gas, HHV is ~10% higher than LHV. Comparing efficiency figures across HHV and LHV bases produces apparent ~10% efficiency gaps that are purely conventional.

*Error 3: Capacity factor adjustments missing.* Energy quantities reported on a "nameplate capacity × 8,760 hours" basis without capacity factor adjustment are theoretical maxima, not actual deliverables. A 100 MW solar farm has nameplate annual energy of 876 GWh; actual annual energy at 28% CF is 245 GWh. The error is rampant in advocacy and journalism.

*Error 4: Primary vs final energy confusion.* National energy statistics distinguish primary energy (raw fuel input) from final energy (energy delivered to end users). A 35%-efficient coal plant consumes ~3 units of primary energy to deliver 1 unit of final electrical energy. Comparing renewable electricity (where primary ≈ final, by IEA convention) to fossil fuels (where primary >> final) on a primary-energy basis systematically overstates the apparent fossil share. The IEA's "physical content" methodology differs from the "substitution" methodology used by BNEF and others. Both are defensible; mixing them within a single analysis is not.

**5. Operational Relevance to Trading and Markets**

Cross-unit fluency is the foundation of multi-commodity trading. The spark spread — the margin between gas-fired electricity revenue and gas fuel cost — requires translation between $/MMBtu (fuel) and $/MWh (power) via heat rate (BTU/kWh):

For a CCGT at 6,500 BTU/kWh and gas at $3.50/MMBtu:

(6,500 BTU/kWh ÷ 10⁶ BTU/MMBtu) × $3.50/MMBtu × 1,000 kWh/MWh = **$22.75/MWh fuel cost**

This calculation appears thousands of times per day across power trading desks. It is impossible without unit fluency.

Similarly, the dark spread (coal-fired margin), the clean spark spread (gas margin including carbon cost), and the renewable PPA pricing all require movement between $/ton, $/MMBtu, $/MWh, $/tCO₂, and other denominator conventions. The practitioner who cannot move between these instantly is locked out of the basic analytical machinery of the field.`,
      primarySources: [
        { citation: 'BIPM (2019). The International System of Units (SI), 9th edition.', type: 'standard' },
        { citation: 'US Energy Information Administration. Monthly Energy Review, Appendix A: Conversion Factors.', type: 'data-source' },
        { citation: 'IEA (2024). World Energy Statistics: Methodology Notes.', type: 'data-source' },
        { citation: 'MacKay, D. J. C. (2008). Sustainable Energy — Without the Hot Air.', type: 'book' },
        { citation: 'NIST Special Publication 811: Guide for the Use of the International System of Units (SI).', type: 'standard' },
      ],
    },
  },
};
