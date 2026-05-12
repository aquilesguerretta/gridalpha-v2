// SCRIBE — Entry 002 · Power vs Energy
// Renderer-only contract: prose is verbatim from the Sub-Tier 1A handoff.

import type { CurriculumEntry } from '@/lib/types/curriculum';

export const powerVsEnergy: CurriculumEntry = {
  id: 'power-vs-energy',
  number: 2,
  title: 'Power vs Energy',
  tier: 1,
  phase: 1,
  subTier: '1A',
  thresholdConcept:
    'Power is the rate at which energy flows; energy is the total amount of power delivered over time. They are different quantities and require different units.',
  misconceptionDefeated: 'Megawatts and megawatt-hours are interchangeable.',
  prerequisites: ['what-is-energy'],
  transformationChain: null,
  diagramSpec: {
    title: 'Speedometer-Odometer (Power vs Energy)',
    description:
      'Two car dashboards side-by-side: one showing instantaneous speed (power), one showing accumulated distance (energy), with E = P × t rendered as area under a power curve over time.',
    layerProgression: {
      L1: 'Simple side-by-side dashboards.',
      L2: 'Adds the integral notation E = ∫P dt.',
      L3: 'Adds a real PJM dispatch curve as the example data.',
    },
    designNotes: 'Avoid stock photo aesthetic; rendered illustration preferred.',
    componentName: 'SpeedometerOdometer',
  },
  estimatedReadingTime: { L1: 8, L2: 11, L3: 13 },
  layers: {
    L1: {
      body: `**Two Different Questions**

Imagine someone asks you about your car. They might ask two completely different questions:

**"How fast does it go?"** — answered with miles per hour. 60 mph. 80 mph. The speedometer reading.

**"How far have you driven it?"** — answered with miles. 50,000 miles. 100,000 miles. The odometer reading.

Both are true facts about your car. Neither replaces the other. You can't answer "how fast" with "100,000 miles," and you can't answer "how far" with "60 mph." They are different questions about the same vehicle, and they require different units.

Energy is the same way. There are two different questions you can ask about energy, and they require two different answers.

**Power: The Speedometer**

**Power tells you how fast energy is flowing right now.**

The unit is the **watt** (W). One thousand watts is a kilowatt (kW). One million watts is a megawatt (MW). One billion watts is a gigawatt (GW).

When you read a label on a microwave that says "1,000 watts," that is a power rating. It tells you how fast the microwave can convert electricity into heat at any moment when it's running.

When you hear that a power plant is "rated at 500 megawatts," that is a power rating. It tells you the maximum rate at which the plant can produce electricity at any given moment.

When the grid operator looks at a real-time dashboard, every number on it is a power figure. How much is being generated right now. How much is flowing through this line right now. How much demand is being served right now. The grid is a machine that has to balance power flows continuously, second by second.

**Energy: The Odometer**

**Energy tells you the total amount of power delivered over some period of time.**

The unit is the **watt-hour** (Wh). One thousand watt-hours is a kilowatt-hour (kWh). One million watt-hours is a megawatt-hour (MWh). One billion watt-hours is a gigawatt-hour (GWh).

When your electricity bill says you used "750 kWh last month," that is an energy figure. It is the total cumulative amount that flowed into your house over the entire month, summed up.

When you hear that the United States generated "4,000 terawatt-hours of electricity last year," that is an energy figure. It is the total cumulative output of every power plant in the country over the entire year.

The simple relationship: **energy = power × time**.

A 1,000-watt microwave running for 1 hour delivers 1,000 watt-hours, or 1 kWh of energy. A 100-watt light bulb running for 10 hours also delivers 1 kWh. Same energy. Different power. The microwave is faster and shorter; the light bulb is slower and longer. Your electric bill charges you the same for both.

**What You Should Take Away**

If you remember nothing else from this entry, remember this:

**Megawatts and megawatt-hours are not the same thing.** Megawatts is a rate. Megawatt-hours is a quantity. They differ by a factor of *time*.

This is the most common error in energy journalism, and once you have learned to spot it, you will see it everywhere. You will read articles that say "this battery has 100 megawatts of storage" — wrong unit, the writer means megawatt-hours. You will read articles that compare "50 gigawatts of solar" to "50 gigawatts of nuclear" — same nameplate power, but the two fleets generate completely different quantities of energy because their capacity factors differ by a factor of three.

Once you can ask the right question — *is this a rate or a quantity? am I looking at the speedometer or the odometer?* — you have the foundation for understanding everything else in the field. The grid is a machine that balances rates. The market is a system that prices quantities. Engineers think in power. Customers think in energy. Both are right. They are answering different questions with different units.

Get the distinction wrong and every later concept in Alexandria will be subtly off. Get it right and the whole field starts to make sense.`,
      examples: [
        {
          id: 'ex-2-bathtub',
          title: 'Filling a bathtub.',
          audienceTags: ['Newcomer'],
          body: `You turn on the bathtub faucet. Water flows in at some rate — maybe 5 gallons per minute. That's like power: a rate. After 10 minutes, the tub holds 50 gallons. That's like energy: a total quantity.

You can fill the tub to 50 gallons by running the faucet at 5 gallons per minute for 10 minutes, OR by running it at 10 gallons per minute for 5 minutes, OR by running it at 1 gallon per minute for 50 minutes. Same final amount. Different rates. Different times.

If your faucet is broken and only flows at 1 gallon per minute, you can still fill the tub — it just takes longer. If your tub has a small drain leak, your fill rate has to exceed the leak rate to make progress. Rates and quantities are different things, and both matter.

Energy systems work the same way. The "rate" is power. The "quantity" is energy.`,
        },
        {
          id: 'ex-2-driving',
          title: 'Driving a car across the country.',
          audienceTags: ['Newcomer', 'Industrial'],
          body: `You drive from New York to Los Angeles, about 2,800 miles. Two questions about your trip:

- *How fast were you driving?* That changes throughout the trip. 70 mph on the highway. 0 mph at gas stations. 30 mph through small towns. The speed at any given moment is *power*.
- *How far have you gone?* That accumulates throughout the trip. After day one, 800 miles. After day three, 2,400 miles. At the end, 2,800 miles. The total distance is *energy*.

You can't describe your trip with just one number. "I drove 70 mph" doesn't tell anyone how far you went. "I drove 2,800 miles" doesn't tell anyone how fast you went or how long it took. You need both to understand the trip.

When someone says "we have 500 megawatts of solar," they are giving you the speedometer reading — the maximum rate, when the sun is shining at noon on a clear day. They are not telling you how far you've traveled — how much energy that solar fleet actually generates over a year. Both questions matter. Both have different answers. Both require different units.`,
        },
        {
          id: 'ex-2-phone',
          title: 'Charging your phone.',
          audienceTags: ['Newcomer', 'Trader', 'Engineer'],
          body: `Your phone charger is rated at, say, 20 watts. That's its *power* — how fast it can pump electricity into your battery.

Your phone battery holds about 15 watt-hours when fully charged. That's its *energy* capacity — the total amount it can store.

Plug in an empty phone with a 20-watt charger and it should fill the 15 watt-hour battery in about 45 minutes (the math gets fuzzier at the end of the cycle because charging slows down, but the principle holds). The fast charger is high power — it pumps the same total amount of energy faster.

Now imagine a power bank — a portable battery for your phone. A small one might be rated at 10,000 milliamp-hours, which translates to roughly 37 watt-hours of energy. That's about 2.5 phone charges. The power bank's *energy* capacity (37 Wh) is what determines how many times it can charge your phone. The power bank's *power* output (the rate at which it can deliver energy) determines how fast each charge happens.

Same two quantities. Same distinction. Energy is how *much* is in the bank. Power is how *fast* it can come out.`,
        },
      ],
      retrievalPrompt:
        'Look at any electric appliance in the room. Find the wattage rating on the label. Now estimate how many watt-hours of energy it would consume if you ran it for 3 hours. Then compare that to the wattage rating of a different appliance in the room — which one is "more powerful," and which one would consume more energy if both ran for 3 hours?',
    },
    L2: {
      body: `**The Distinction That Defines the Field**

Power and energy are different quantities with different units, and confusing them is the single most common error in energy discourse — committed routinely by journalists, policymakers, and even some industry analysts.

- **Power** is a rate. Watts. Kilowatts. Megawatts. Gigawatts. It tells you *how fast* energy is flowing at a given moment.
- **Energy** is a quantity. Watt-hours. Kilowatt-hours. Megawatt-hours. Gigawatt-hours. It tells you *how much* energy was delivered over some period.

The relationship is simple: **energy = power × time**.

A 100-watt light bulb running for 10 hours delivers 1,000 watt-hours, or 1 kWh. A 1,000-watt microwave running for 1 hour also delivers 1 kWh. Same energy. Different power. Same total bill on your electricity account. The light bulb sips slowly for a long time; the microwave gulps quickly for a short time.

**The Speedometer-Odometer Analogy**

The cleanest analogy is your car. Every car has two readings on the dashboard:

- The **speedometer** tells you how fast you are going *right now* — 60 mph, 30 mph, 0 mph at a stoplight. This is a rate.
- The **odometer** tells you how far you have driven in total — 50,000 miles, 80,000 miles, 120,000 miles over the lifetime of the car. This is a quantity.

Power is the speedometer. Energy is the odometer.

You can drive 50,000 miles by going 50 mph for 1,000 hours. You can also drive 50,000 miles by going 100 mph for 500 hours, or 25 mph for 2,000 hours. Same total distance. Different speeds. Different times. The speed at any single moment doesn't tell you how far you've gone, and the total distance doesn't tell you how fast you went.

The same logic applies to power and energy. The grid operator looking at a real-time dashboard sees power — how much is flowing right now. The customer looking at a monthly bill sees energy — how much was delivered over the billing period. Both are correct. Neither replaces the other.

**Why Both Quantities Matter**

Power and energy answer different questions, and physical systems have constraints on both.

*Power constraints describe instantaneous limits.* A transmission line has a thermal limit — it can carry up to some maximum number of megawatts at any given moment. Exceed that limit for even a short time and the conductor heats up beyond its design temperature. The grid's job, second by second, is to make sure no power constraint anywhere in the system is violated. This is what RTOs do every five minutes in real-time markets.

*Energy constraints describe cumulative quantities.* A battery has an energy capacity — it can store some maximum number of MWh before it is full, and discharge that amount before it is empty. A reservoir behind a hydro dam holds a finite quantity of water that represents a finite quantity of potential energy. Fuel inventories, emissions limits, and customer bills are all energy quantities.

A grid operator manages both at once. The power constraints are the railing — you can't push more current through a line than it can carry. The energy constraints are the schedule — you have to deliver the right total amount over the day, the month, the season.

**The Misconception to Defeat**

When you read in the news that "Country X added 50 gigawatts of solar last year," that is a *power* figure. It tells you about installed capacity. It does not tell you how much energy that solar fleet will produce.

To translate to energy, you need the capacity factor — the ratio of actual energy delivered to theoretical maximum if the system ran at full power 24/7. For utility-scale solar in the US, CF runs around 25-30%. So 50 GW of solar at 28% CF generates roughly:

50 GW × 8,760 hours/year × 0.28 = **122 TWh/year**

A nuclear plant running at 92% CF generates:

50 GW × 8,760 hours/year × 0.92 = **403 TWh/year**

Same nameplate power. Three times the energy. Different question, different answer. A headline that compares "50 GW of solar" to "50 GW of nuclear" without disclosing capacity factor is comparing the speedometer reading of a Ferrari with the speedometer reading of a delivery truck — one number, two completely different vehicles, two completely different stories about how many miles get covered.

This is the most common bad-faith move in energy journalism, in either direction. Solar advocates conflate GW added with energy delivered. Nuclear advocates do the same in reverse. Both are wrong. The professional response is always to translate to energy and disclose the capacity factor.`,
      workedExample: {
        id: 'wex-2-battery-asset',
        title: 'A Battery Storage Asset',
        body: `Consider a battery storage asset rated at 100 MW / 400 MWh. What does this specification mean?

- **100 MW**: the maximum rate at which the battery can charge or discharge. This is its power rating.
- **400 MWh**: the total quantity of energy it can store when fully charged. This is its energy capacity.
- **Duration**: 400 MWh ÷ 100 MW = **4 hours**. The battery can sustain its full power output for 4 hours before discharging completely.

This specification matters because the same battery can be operated for different products:

- **Energy arbitrage** (charge cheap, discharge expensive): the 4-hour duration captures most daily peak-trough price spreads. Profitable in markets like CAISO with steep daily price curves.
- **Frequency regulation** (rapidly inject or absorb power to stabilize grid frequency): only needs the 100 MW rating; the 400 MWh is overkill. A 100 MW / 30-minute battery (50 MWh) could perform the same regulation service at much lower cost.
- **Capacity service** (commitment to be available during peak hours): requires sustained discharge; the 4-hour duration matters because PJM and other ISOs require batteries to hold rated output for at least 4 hours to qualify for full capacity payment.

A 100 MW / 100 MWh battery (1-hour duration) and a 100 MW / 800 MWh battery (8-hour duration) are completely different assets despite having identical power ratings. The first is a frequency-regulation asset; the second is a long-duration arbitrage and reliability asset. Treating them as the same — as headlines about "a hundred-megawatt battery" routinely do — erases the distinction that determines what the asset does economically.`,
        widgetSpec: {
          type: 'slider-set',
          description:
            'Battery Sizing Tool — power rating and duration in; energy capacity, suggested use case, and revenue stack composition out.',
          inputs: [
            { name: 'power rating', unit: 'MW', type: 'number', range: [10, 500], default: 100 },
            { name: 'duration', unit: 'hours', type: 'number', range: [0.25, 12], default: 4 },
          ],
          outputs: [
            { name: 'energy capacity', unit: 'MWh', computation: 'power × duration' },
            { name: 'suggested use case', computation: 'frequency regulation (<1h) / arbitrage (1–4h) / capacity (4h+)' },
            { name: 'revenue stack composition', computation: 'energy / capacity / ancillary share by duration' },
            { name: 'breakeven LMP spread', unit: '$/MWh', computation: 'arbitrage profitability threshold' },
          ],
        },
      },
      retrievalPrompt:
        'A utility tells you it has installed 200 MW of new wind turbines. The local newspaper reports this as enough to power 200,000 homes. The average home in this region uses 12 MWh/year. If the wind farm has a 35% capacity factor, how many homes can it actually power on an annual energy basis? Show the calculation.',
    },
    L3: {
      body: `**1. Definition**

Power is the time derivative of energy, **P(t) = dE/dt**, with SI unit the watt (W), defined as one joule per second. Energy is the time integral of power, **E = ∫P(t)dt**, with SI unit the joule (J) or, in commercial energy contexts, the kilowatt-hour (kWh) or megawatt-hour (MWh). One MWh = 3.6 × 10⁹ J.

The two quantities are related by integration but they are not interchangeable. Power describes the instantaneous rate of energy transfer or transformation at a single moment; energy describes the cumulative quantity transferred over a defined time interval. A power rating without a time window is incomplete information about energy delivered; an energy figure without a power profile is incomplete information about how the energy was supplied.

In linear systems with constant power, **E = P × t**, but real energy systems are rarely linear — load varies on second-to-second, hour-to-hour, and seasonal time scales, and generator output varies with availability, dispatch, and weather. The general expression is the integral; the linear shortcut is a useful approximation only over intervals where P is approximately constant.

**2. Why Both Quantities Are Operationally Necessary**

Power and energy answer different questions and constrain different systems.

Power constraints describe instantaneous capacity and physical limits. The thermal limit of a transmission line is a power limit (MVA), not an energy limit — exceed it for any duration and the conductor anneals. The peak load on a system is a power figure (MW), and the generation fleet must be able to meet it instantaneously, regardless of energy reserves. Generator nameplate capacity, ramp rates, frequency response, and inverter limits are all power quantities.

Energy constraints describe cumulative quantities and economic flows. Fuel consumption, customer billing, capacity factors, storage state-of-charge, and emissions inventories are all energy quantities (or rates of energy quantities — e.g., tons of CO₂ per MWh).

A practitioner who confuses the two will misanalyze every problem in the field. The most common categories of error:

- *Sizing errors.* Sizing a battery for "100 MW of demand" without specifying duration produces nonsense — a 100 MW / 15-minute battery and a 100 MW / 8-hour battery serve completely different system needs. The first is for ancillary services; the second is for energy arbitrage and reliability.
- *Capacity-vs-energy market confusion.* PJM's capacity market clears in MW (commitment to be available); PJM's energy market clears in MWh (delivered output). A unit can clear capacity without ever generating an MWh, and a unit can sell into the energy market without holding a capacity obligation. These are economically distinct products.
- *Renewable accounting errors.* Statements like "California has 30 GW of solar" describe nameplate power. Statements like "California's solar fleet generated 50 TWh last year" describe energy. Capacity factor is the bridge: CF = annual energy generated / (nameplate power × 8,760 hours). California utility-scale solar CF runs ~28%; rooftop solar CF runs ~18-22%. Conflating the GW and TWh figures is the foundation of most bad-faith renewable critiques and most bad-faith renewable defenses.

**3. The Mathematical Relationships**

For a generator with constant output P over duration t:
**E = P × t**

For a generator with variable output:
**E = ∫₀ᵗ P(τ) dτ**

Average power over an interval:
**P_avg = E / t**

Capacity factor:
**CF = E_actual / (P_nameplate × t) = P_avg / P_nameplate**

For wholesale energy markets, the LMP at node i and time t is a price *per unit of energy* delivered ($/MWh), but settlement happens on power integrated over the settlement interval (typically 5-minute or hourly for real-time, hourly for day-ahead). Revenue for a generator at node i over interval [t₁, t₂]:

**R_i = ∫ₜ₁ᵗ² P_i(τ) × LMP_i(τ) dτ**

The LMP is a $/MWh quantity (energy price), but the settlement integrates power over time to produce energy delivered. This is why a generator that captures only peak-price hours can earn more revenue per MWh than a baseload unit producing twice as much energy at flatter prices — the integral of power × price is what matters, not energy alone.

**4. Common Practitioner Errors**

*Error 1: "MW vs MWh" sloppiness in industry communications.* Even seasoned analysts write "100 MW of storage" when they mean "100 MWh." Public-facing communications from utilities, ISOs, and trade press frequently conflate the two. The professional fix: always state both — "a 100 MW / 400 MWh battery" specifies a 4-hour duration system and is unambiguous.

*Error 2: Treating capacity factor as efficiency.* Capacity factor is a utilization metric, not an efficiency metric. A nuclear plant operating at 92% CF and a solar farm operating at 28% CF are not "92% efficient" and "28% efficient" — they are operating 92% and 28% of theoretical maximum hours respectively. Both can have very different First Law efficiencies (~33% for thermal nuclear, ~21% for monocrystalline silicon PV). Confusing CF with efficiency obscures the actual thermodynamic and economic comparison.

*Error 3: Power-energy confusion in policy language.* Renewable Portfolio Standards specify percentages of *energy* (MWh/year) from renewable sources. Capacity goals specify *power* (MW installed). A state can hit a 100% renewable energy target without 100% renewable capacity (because storage and curtailment manage the gap), and a state can hit a 100% renewable capacity target without delivering 100% renewable energy in any given hour (because availability varies). Policymakers, regulators, and journalists routinely conflate these targets, producing confused policy debates.

**5. Operational Relevance to PJM Markets**

PJM's wholesale markets cleanly separate power-denominated and energy-denominated products:

- **Energy market (real-time and day-ahead):** clears in $/MWh, settles on metered MWh
- **Capacity market (RPM):** clears in $/MW-day, settles on commitment to be available
- **Ancillary services (regulation, reserves):** clears in $/MW-h or $/MW-day depending on product
- **FTR market:** settles on MWh of congestion across path-pairs

A unit's revenue stack is the sum of these distinct products: capacity revenue (power) + energy revenue (energy) + ancillary revenue (typically power, sometimes hybrid). For a peaker plant, capacity revenue can be 60-80% of total annual revenue with energy revenue concentrated in a handful of high-LMP hours. For a CCGT, energy revenue typically dominates. For a battery, the optimal product mix depends on the frequency-vs-arbitrage tradeoff and changes hour by hour.

Understanding the difference between power markets and energy markets is the foundation of every revenue model in the wholesale electricity sector. Models that aggregate everything into "$/MWh average" miss the entire structure of the revenue stack.`,
      primarySources: [
        { citation: 'IEEE Standards Association (2018). IEEE Std 100-2018: IEEE Standard Definitions of Terms.', type: 'standard' },
        { citation: 'PJM Interconnection (2024). Manual 11: Energy & Ancillary Services Market Operations.', type: 'manual' },
        { citation: 'PJM Interconnection (2024). Manual 18: PJM Capacity Market.', type: 'manual' },
        { citation: 'Kirschen, D. S., & Strbac, G. (2018). Fundamentals of Power System Economics (2nd ed.). Wiley.', type: 'book' },
        { citation: 'US Energy Information Administration. Glossary of Terms (capacity factor, nameplate capacity, generation).', type: 'data-source' },
      ],
    },
  },
};
