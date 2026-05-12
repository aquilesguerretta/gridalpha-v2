// SCRIBE — Entry 001 · What Is Energy?
// Renderer-only contract: prose is verbatim from the Sub-Tier 1A handoff
// document. Do not paraphrase, summarise, omit, or "improve" any sentence.

import type { CurriculumEntry } from '@/lib/types/curriculum';

export const whatIsEnergy: CurriculumEntry = {
  id: 'what-is-energy',
  number: 1,
  title: 'What Is Energy?',
  tier: 1,
  phase: 1,
  subTier: '1A',
  thresholdConcept:
    'Energy is not a substance that flows; it is a property of systems that gets transformed.',
  misconceptionDefeated: 'Energy is consumed and used up.',
  prerequisites: [],
  transformationChain: null,
  diagramSpec: {
    title: 'Energy Transformation Chain',
    description:
      'A visual chain showing energy moving through forms: fuel → boiler → steam → turbine → generator → wire → battery → screen.',
    layerProgression: {
      L1: 'Simple labeled arrows.',
      L2: 'Adds efficiency percentages and form symbols (E_chem, E_therm, etc.) at each step.',
      L3: 'Adds exergy destruction quantification at each step.',
    },
    designNotes:
      'Clean, infographic-style, no chartjunk; label each form with its symbol at L2/L3.',
    componentName: 'EnergyTransformationChain',
  },
  estimatedReadingTime: { L1: 7, L2: 10, L3: 14 },
  layers: {
    L1: {
      body: `**What Energy Actually Is**

Energy is the most fundamental thing in physics, and also one of the hardest to define. Here is the simplest true statement we can make:

**Energy is the ability to make something happen.**

A ball rolling down a hill has energy because it can knock something over at the bottom. A piece of wood has energy because if you light it, it can warm a room. A charged battery has energy because it can power your phone. In each case, energy is the capacity for *something to happen* — a movement, a heating, a working.

The reason energy is hard to define is that you cannot point to it. You cannot hold a joule in your hand. Energy is not a substance. It is a property of things — of moving balls, of stretched springs, of charged batteries, of warm rooms. It is the thing that lets those things do something.

**Three Examples That Look Different But Are the Same**

**The Big Idea: Energy Is Not Used Up**

Here is the single most important thing in this entry, and the misconception that almost everyone gets wrong:

**Energy is never used up.**

When your phone "uses" battery, the energy is not destroyed. It is transformed — into the photons leaving your screen, into the heat warming the back of your phone, into the radio waves carrying your text messages. Every joule that was in the battery is still somewhere in the universe. It has just been spread out into less useful forms.

This is the First Law of Thermodynamics, and it is one of the most rigorously tested laws in all of physics. Energy is *conserved*. The total amount of energy in any closed system never changes. It only transforms.

So when you hear that "the United States consumes 100 quadrillion BTU of energy a year" — that's not literally what happens. The energy isn't consumed. It is *degraded*. We take energy in highly useful forms (coal, gas, oil, uranium, sunlight) and we transform it into less useful forms (mostly waste heat that escapes into the atmosphere). The joules are all still there. They are just spread out, no longer concentrated enough to drive anything.

**Why this matters:** if you carry the wrong mental model — that energy is consumed and used up — you will misunderstand efficiency, you will misunderstand "energy losses," you will misunderstand why some forms of energy cost more than others. Every later concept in Alexandria — turbines, batteries, grids, markets — sits on top of this one truth. Get this wrong, and everything you read later will be subtly off.

**What You Should Be Able to Say After Reading This**

You should be able to look at any object — a moving car, a hot coffee, a charged battery, a stretched rubber band, a piece of bread — and say: *that thing has energy because it has the capacity to make something happen.* You should be able to follow energy as it transforms through a chain of events without ever thinking it disappears. And when someone says "we used 100 megawatt-hours of electricity yesterday," you should be able to mentally translate that into: *we transformed 100 megawatt-hours' worth of high-quality energy into lower-quality forms, which are now spread out somewhere in the universe.*`,
      examples: [
        {
          id: 'ex-1-lifting-a-book',
          title: 'Lifting a book.',
          audienceTags: ['Newcomer', 'Engineer'],
          body: `You pick up a book from the floor and put it on a shelf. You did some work. The book now has the *potential* to fall back down and do something — knock something over, hurt your foot. We say the book has gained *gravitational potential energy*. Where did that energy come from? Your muscles. Where did your muscles get it? From the food you ate. Where did the food's energy come from? From the sun, which grew the plant, which fed the animal, which became the food.

You can trace any joule of energy backward through the universe like this. The energy in the book on your shelf was, hours or days or years ago, a photon leaving the sun.`,
        },
        {
          id: 'ex-2-burning-wood',
          title: 'Burning a piece of wood.',
          audienceTags: ['Newcomer', 'Industrial', 'Engineer'],
          body: `You strike a match and light a piece of wood. The wood burns. It gets hot, it gives off light, it produces ash and smoke, and eventually nothing visible remains.

But energy was conserved through all of it.

The wood was storing chemical energy — energy locked in the bonds between the carbon, hydrogen, and oxygen atoms that make up cellulose. When the wood burns, those bonds break and reform into new molecules (carbon dioxide, water vapor), and the difference in bond energy comes out as heat and light. The heat warms the air around the fire. The light streams outward. The smoke carries chemical energy (in unburned particles) up the chimney.

If you could carefully measure all of it — the heat warming the room, the light leaving the fire, the energy in the smoke, the slightly raised temperature of the ash — and add them up, the total would equal the chemical energy that was stored in the wood at the start. Nothing was lost. It was just *transformed*.`,
        },
        {
          id: 'ex-3-charging-phone',
          title: 'Charging and using your phone.',
          audienceTags: ['Newcomer', 'Trader', 'Industrial', 'Policy'],
          body: `You plug your phone into the wall to charge. Electrical energy flows from the outlet into the battery. Inside the battery, that electrical energy drives a chemical reaction — lithium ions move from one electrode to another — that stores the energy chemically. When you unplug your phone and use it, the chemical reaction runs backward, releasing energy that flows out as electricity, powering the screen and the processor.

But where did the electrical energy from the wall come from?

If you live in a region with PJM Interconnection, that energy was probably generated by burning natural gas in a power plant a hundred miles from your house. The plant burned the gas (chemical → thermal), used the heat to make high-pressure steam (thermal → kinetic), spun a turbine (kinetic), drove a generator (kinetic → electrical), and fed the electricity into the grid. The grid carried it through high-voltage transmission lines, stepped it down through a transformer, and delivered it to your wall outlet. All of those steps were energy transformations. None of them created or destroyed energy.`,
        },
      ],
    },
    L2: {
      body: `**What Energy Is, Operationally**

Energy is the property of a system that lets it do something. *Doing something*, in physics, has a precise definition: applying a force over a distance, raising a temperature, accelerating a mass, or driving a chemical reaction. Energy is the bookkeeping quantity that tracks the capacity to do these things.

The unit is the joule (J). One joule is roughly the energy required to lift a small apple (about 100 grams) one meter against gravity. From there, every other energy unit reduces to joules:

- 1 kilowatt-hour (kWh) = 3.6 million joules
- 1 BTU ≈ 1,055 joules
- 1 calorie ≈ 4.18 joules
- 1 barrel of oil equivalent ≈ 6.1 billion joules

An energy professional needs to be fluent in all of these. Coal plants are sized in megawatts (rate). Their fuel is measured in tons (mass). Their economics are in dollars per megawatt-hour (energy). Pipelines move gas in million BTUs (energy). Households are billed in kilowatt-hours (energy). Translating between these is foundational literacy.

**Power vs Energy: The Distinction That Matters**

Energy is *quantity*. Power is *rate*. Energy is to power as distance is to speed.

- A 100-watt light bulb running for 10 hours uses 1,000 watt-hours = 1 kWh of energy.
- A 1,000-watt microwave running for 1 hour uses 1 kWh of energy.
- Same energy. Different power.

This distinction is invisible to the public and central to every conversation in the energy industry. When someone says "the grid needs 500 megawatts," they mean *right now, instantaneously*. When someone says "we generated 500 megawatt-hours," they mean *over some period*. Confusing the two is the most common error in energy journalism.

**The First Law: Conservation**

The First Law of Thermodynamics says energy is conserved. It cannot be created or destroyed. Every joule that enters a system either stays inside, leaves as work, leaves as heat, or transforms into a different form of stored energy.

This is why a power plant that "produces" 500 MW of electricity from 1,500 MW of fuel input is not violating any law. The other 1,000 MW is leaving as heat — through the cooling tower, the stack, friction in the turbine bearings. The energy is fully accounted for. It just isn't electricity.

**The Second Law: Why Some Energy Is Worth More**

Here is the harder concept: not all joules are equal.

Consider two systems, each containing 1,000 joules:
- A small mass of steam at 500°C
- A swimming pool warmed by 0.001°C

Both contain the same energy. But the steam can drive a turbine and produce work. The warm pool cannot — there is no heat engine that could meaningfully extract useful work from a 0.001°C temperature gradient. The steam has high *exergy* (useful energy). The pool has near-zero exergy.

When energy "flows" through any real system, exergy is destroyed. The joules are conserved, but the capacity to do work is not. This is what people mean — incorrectly — when they say energy is "consumed" or "used up." The energy is still there. It is just no longer in a form that can drive a process.

This is the Second Law of Thermodynamics, and it is the single most important law in energy economics. Every efficiency rating, every heat rate, every spark spread, every LCOE calculation traces back to it.

**The Misconception to Defeat**

If you take one thing from this layer: **energy is not consumed.** It is transformed into less useful forms.

When you read in the news that "the US consumed 100 quadrillion BTU of energy last year" — that is loose language. What actually happened: 100 quadrillion BTU of high-exergy fuel (coal, gas, oil, uranium, sunlight, wind) entered the economy, drove useful processes, and exited as low-exergy waste heat into the atmosphere. The joules were never destroyed. They were degraded.

This sounds like a semantic distinction. It is not. It is the foundation for thinking correctly about efficiency, losses, the Second Law, and ultimately the entire energy market.`,
      workedExample: {
        id: 'wex-1-ccgt-energy-balance',
        title: 'A Combined-Cycle Gas Plant',
        body: `A modern combined-cycle gas turbine (CCGT) achieves about 60% thermal efficiency. Walk through what that means:

- Fuel input: 100 units of chemical energy (in the natural gas)
- Electrical output: 60 units
- Waste heat: 40 units (released to the atmosphere via the cooling system)

The energy balance closes. 100 = 60 + 40. The First Law is satisfied.

But why is it 60% and not 100%? Why not capture all 40 units of waste heat?

The answer is the Second Law. The exhaust heat exits at around 100°C — too low a temperature to drive another useful turbine, in most economic contexts. The exergy has been spent. Some of those 40 units could be captured for district heating (this is what combined heat-and-power plants do, and they push effective efficiency above 80%), but most plants are sited where there is no heat demand nearby, so the waste exits to the atmosphere.

Compare to a single-cycle gas turbine (peaker plant): about 35% efficient. Same fuel, far less work captured. The 25-percentage-point gap between simple-cycle and combined-cycle is the entire reason CCGTs dominate the US generation fleet — they destroy less exergy per unit of useful electricity produced.`,
        widgetSpec: {
          type: 'calculator',
          description:
            'Energy Transformation Calculator — fuel input rate and thermal efficiency in; electrical output, waste heat, fuel cost at $3.50/MMBtu and marginal cost out.',
          inputs: [
            { name: 'fuel input rate', unit: 'MW', type: 'number', range: [50, 1500], default: 500 },
            { name: 'thermal efficiency', unit: '%', type: 'number', range: [25, 65], default: 60 },
          ],
          outputs: [
            { name: 'electrical output', unit: 'MW', computation: 'fuel input × efficiency' },
            { name: 'waste heat', unit: 'MW', computation: 'fuel input × (1 − efficiency)' },
            { name: 'fuel cost', unit: '$/MWh', computation: 'fuel input × $3.50/MMBtu × heat rate conversion' },
            { name: 'marginal cost', unit: '$/MWh', computation: 'fuel cost + variable O&M (assume $3/MWh)' },
          ],
        },
      },
      retrievalPrompt:
        'In your own words, why does a CCGT with 60% efficiency not violate the First Law of Thermodynamics? What is "happening" to the other 40%?',
    },
    L3: {
      body: `**1. Definition**

Energy is the conserved scalar quantity associated with the time-translation symmetry of physical systems. Operationally, it is the capacity of a system to perform work — where *work* is defined as the action of a force through a displacement, *W = ∫F·ds*. The SI unit is the joule (J), defined as one newton-meter, equivalently one watt-second, equivalently the kinetic energy of a one-kilogram mass moving at √2 meters per second. Every other unit in common use — kilowatt-hour, BTU, calorie, electronvolt, barrel of oil equivalent — reduces to joules through fixed conversion factors.

The conservation of energy (the First Law of Thermodynamics) states that the total energy of an isolated system is invariant under all physical processes. Energy can change form — kinetic, potential, thermal, chemical, electrical, electromagnetic, nuclear, mass-energy — but the sum is preserved. Noether's theorem (1918) provides the deep mathematical basis: every continuous symmetry of a physical system corresponds to a conserved quantity, and energy is the conserved quantity associated with time-translation symmetry. The fact that the laws of physics today are the same as the laws of physics yesterday is mathematically equivalent to the conservation of energy.

**2. Formal Model**

For a closed system with no mass transfer:

**ΔU = Q − W**

Where ΔU is the change in internal energy, Q is heat added to the system, and W is work done by the system. This is the First Law in its most operationally useful form.

For a system at thermodynamic equilibrium, total energy can be decomposed:

**E_total = E_kinetic + E_potential + E_internal + E_chemical + E_nuclear + E_electromagnetic + mc²**

The last term — Einstein's mass-energy equivalence — is conventionally neglected in non-nuclear engineering contexts because rest-mass energy dwarfs all other terms by ~10⁹×, and only changes in mass-energy (not absolute values) appear in energy balances.

**3. The Critical Boundary Condition: The Second Law**

The First Law is necessary but insufficient for any real engineering or economic analysis. Energy is conserved, but its *useful* fraction is not. The Second Law of Thermodynamics introduces entropy (S):

**dS_universe ≥ 0** for any real process

Equivalently, the *exergy* of a system — the maximum useful work extractable as the system equilibrates with its environment — is destroyed in every irreversible process. This is the conceptual bridge between thermodynamics and economics: energy that is "consumed" in everyday language is energy whose exergy has been destroyed. The joules are still there. They are just no longer usable.

This distinction is the foundation of every efficiency calculation, every heat-rate curve, every LCOE, and every market price for energy. A coal plant operating at 33% thermal efficiency is not destroying energy; it is destroying exergy. The 67% of input energy that exits as low-grade heat is fully accounted for in the energy balance — it just has no commercial value because no economically viable process can extract work from it.

**4. Common Misconceptions in Practitioner Contexts**

*Misconception 1: "Energy is consumed."* Energy is never consumed. Exergy is consumed. This matters because it forces the practitioner to ask the right efficiency question: not how much energy is lost, but how much exergy is destroyed and where in the process. A combined-cycle gas turbine wins against a simple-cycle gas turbine not because it consumes less energy, but because it destroys less exergy by capturing the high-temperature exhaust heat in a bottoming Rankine cycle.

*Misconception 2: "Renewable energy is free."* Solar and wind have zero fuel cost, but exergy economics still applies. The exergy of sunlight is degraded by the Carnot limit at the cell temperature (~30% theoretical max for single-junction silicon). Wind exergy is bounded by the Betz limit (59.3%). The capital required to capture the available exergy is the actual cost.

*Misconception 3: "Efficiency means percentage of energy out divided by energy in."* First Law efficiency (η₁) is the conventional metric but is often misleading. Second Law efficiency (η₂ = exergy out / exergy in) is the metric that actually predicts economic competitiveness. A residential gas furnace has 95% First Law efficiency and ~10% Second Law efficiency — the gas is being burned at ~2000°C to heat a room to 20°C, an enormous exergy destruction.

**5. Operational Relevance to PJM and Wholesale Markets**

The First Law shows up in market operations as the energy balance constraint in security-constrained economic dispatch (SCED): generation must equal load plus losses at every node, every five minutes. The Second Law shows up as the heat rate — the joules of fuel input required per joule of electrical output — which determines marginal cost and merit-order position.

For a CCGT operating at a heat rate of 6,500 BTU/kWh:
- 6,500 BTU/kWh × ($3.50/MMBtu / 10⁶ BTU/MMBtu) × 1000 kWh/MWh = $22.75/MWh fuel cost
- Plus $3-5/MWh variable O&M ≈ $26-28/MWh marginal cost
- Below LMP of $35/MWh: dispatchable, profitable
- Above LMP of $25/MWh: out of merit

The heat rate is the Second Law made commercial. A unit with a heat rate of 7,500 BTU/kWh at the same gas price has a marginal cost of $26.25/MWh — three dollars per megawatt-hour higher, which determines whether it dispatches in real time. The thermodynamic limit propagates directly into the market clearing price.

**6. Contested Debates**

*Debate 1: Exergy as a regulatory metric.* A literature in energy policy (Hammond, Stepanov, Rosen) argues that regulators should use exergy efficiency, not energy efficiency, as the basis for standards. Industry counterargument: exergy accounting is harder to measure, harder to communicate, and produces counterintuitive rankings (electric resistance heating, nominally 100% efficient, scores ~5% on exergy). The debate is unresolved; First Law efficiency dominates in practice.

*Debate 2: Energy return on energy invested (EROI) vs LCOE.* EROI proponents (Hall, Murphy) argue that thermodynamic accounting should drive energy policy: a fuel with EROI < 5 cannot sustain industrial civilization regardless of price. LCOE proponents argue financial markets price all relevant constraints; EROI is double-counting. The debate matters for nuclear (high EROI, contested LCOE) and biofuels (low EROI, sometimes positive LCOE).`,
      primarySources: [
        { citation: 'Noether, E. (1918). Invariante Variationsprobleme. Nachr. d. König. Gesellsch. d. Wiss. zu Göttingen.', type: 'paper' },
        { citation: 'Fermi, E. (1956). Thermodynamics. Dover Publications.', type: 'book' },
        { citation: 'Çengel, Y. A., & Boles, M. A. (2019). Thermodynamics: An Engineering Approach (9th ed.). McGraw-Hill.', type: 'book' },
        { citation: 'Bejan, A. (2016). Advanced Engineering Thermodynamics (4th ed.). Wiley.', type: 'book' },
        { citation: 'PJM Interconnection (2024). Manual 11: Energy & Ancillary Services Market Operations.', type: 'manual' },
        { citation: 'Hammond, G. P., & Stapleton, A. J. (2001). "Exergy analysis of the United Kingdom energy system." Proceedings of the Institution of Mechanical Engineers, Part A.', type: 'paper' },
      ],
    },
  },
};
