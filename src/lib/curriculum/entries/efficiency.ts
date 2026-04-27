// SCRIBE — Entry 006 · Efficiency
// Renderer-only contract: prose is verbatim from the Sub-Tier 1A handoff.
// Synthesis entry — references concepts from all five prior entries
// (First Law, Second Law, exergy, Carnot, capacity factor, heat rate,
// joule, kilowatt-hour, MMBtu).

import type { CurriculumEntry } from '@/lib/types/curriculum';

export const efficiency: CurriculumEntry = {
  id: 'efficiency',
  number: 6,
  title: 'Efficiency',
  tier: 1,
  phase: 1,
  subTier: '1A',
  thresholdConcept:
    'Efficiency is not a single number — it is a ratio defined by a chosen system boundary and a chosen reference quantity. The same physical device can be characterized by multiple efficiencies, each answering a different question, and choosing the wrong one produces wrong economic and policy conclusions.',
  misconceptionDefeated:
    'Efficiency means percentage of energy that comes out divided by energy that goes in.',
  prerequisites: [
    'what-is-energy',
    'power-vs-energy',
    'forms-of-energy',
    'units-and-orders-of-magnitude',
    'entropy-and-second-law',
  ],
  transformationChain: null,
  diagramSpec: {
    title: 'Efficiency Boundary Diagram (EV vs Gas Car)',
    description:
      'A single illustration showing two parallel energy supply chains: gasoline (well → refinery → distribution → tank → engine → wheels) and electric (power plant → transmission → charger → battery → motor → wheels). Each step labelled with First Law efficiency.',
    layerProgression: {
      L1: 'Just the chains and the efficiencies.',
      L2: 'Adds boundary boxes around different regions (tank-to-wheel, well-to-wheel).',
      L3: 'Adds Second Law / exergy destruction quantification.',
    },
    designNotes:
      'This is the single most useful efficiency teaching diagram in the field; warrants extra investment.',
    componentName: 'EfficiencyBoundary',
  },
  estimatedReadingTime: { L1: 12, L2: 14, L3: 18 },
  layers: {
    L1: {
      body: `**What Efficiency Actually Asks**

Every time you read about an energy technology, you'll encounter an efficiency number. A solar panel is 22% efficient. A gas plant is 60% efficient. An electric motor is 95% efficient. A heat pump is 300% efficient.

That last one looks like a typo. It isn't. To make sense of efficiency in the energy world, you need to understand something most popular explanations skip: **efficiency is not a single thing.** It is a question about a chosen boundary, and different boundaries produce different answers.

The simplest definition is the one most people learn: efficiency is the percentage of energy that comes out of a process divided by the percentage that went in. By this measure, a perfectly efficient device would convert 100% of its input into useful output, and any losses would push the efficiency below 100%. This is true for many situations, but it leads to confusion when applied to others — like heat pumps, which appear to violate it.

The deeper truth is that efficiency is a tool for asking a specific question: *given what we put in, how much of what we wanted came out?* The answer depends on what you count as "in" and what you count as "wanted."

**The Two Most Important Questions**

When someone says "this technology is efficient," they are answering one of two questions:

*Question 1: How much of the input energy ended up as useful output?*

This is First Law efficiency. It measures how cleanly an energy transformation happens. A 95% efficient gas furnace converts almost all the chemical energy in the gas into heat in your room — the other 5% goes up the chimney. A 22% efficient solar panel converts about a fifth of the sunlight hitting it into electricity — the rest becomes heat in the panel and reflected light. A 60% efficient power plant converts 60% of the chemical energy in the fuel into electricity and the other 40% into waste heat.

This metric is intuitive and useful. It tells you how much of what you paid for actually shows up as the thing you wanted.

*Question 2: How much **useful** output did you get for your input?*

This is Second Law efficiency, and it captures something the first question misses: not all energy is equally useful. A 95% efficient gas furnace burns methane at 2,000°C to heat your room to 20°C. The First Law says: 95% of the chemical energy ended up as room heat. The Second Law says: you destroyed almost all the useful work potential of that methane to produce a small amount of low-grade heat. A more careful analysis would have recognized that the high-temperature combustion could have done much more — could have run a generator, or driven an industrial process — before being degraded down to room-temperature heat.

Both answers are correct. They answer different questions. Once you can hold both questions in your head, you can read efficiency claims accurately.

**The Heat Pump Mystery**

This is where it gets weird. A heat pump can have an "efficiency" greater than 100%.

A modern air-source heat pump has a coefficient of performance (COP) of about 3.0, meaning for every 1 unit of electricity it consumes, it delivers about 3 units of heat to your room. By the simple First Law calculation, that's 300% efficiency.

This sounds like it violates the laws of physics. It doesn't. Here's what's happening: the heat pump is not *creating* heat from electricity. It is *moving* heat from somewhere cooler (the outdoor air) to somewhere warmer (your room), using electricity as the work that drives the movement. The thermal energy delivered to your room is mostly thermal energy that was already in the outdoor air — the heat pump just relocated it.

This is exactly what your refrigerator does, in reverse. A refrigerator uses electricity to move heat from inside the cold compartment to the warmer room. The total heat dumped into your kitchen is *more* than the electricity consumed, because most of the dumped heat was extracted from the inside of the fridge, not created from the electricity.

The right metric for heat pumps is COP (coefficient of performance), not "efficiency." A COP of 3.0 means the heat pump moves 3 units of heat per unit of electrical work. There's no thermodynamic problem here; in fact, the Second Law actually *predicts* this. Moving thermal energy across a small temperature gradient (0°C outdoors to 20°C indoors) requires only a small fraction of the energy that would be required to *create* that heat from scratch.

This is the most important practical insight in residential energy: a heat pump uses about 3× less energy to heat a home than a gas furnace, because the heat pump is moving free environmental heat rather than burning fuel.

**Capacity Factor: A Different Question Entirely**

There's another number that gets called "efficiency" in casual energy conversation, but isn't really efficiency at all: capacity factor.

Capacity factor is the fraction of the time a power plant runs at full output, on average. A 100 MW solar farm doesn't generate 100 MW for 24 hours a day — the sun rises and sets, clouds pass over, the panels degrade with temperature on hot afternoons. Over a year, that solar farm might deliver 28% of what it would have produced if it had run at full nameplate power for every hour. So we say it has a capacity factor of 28%.

Different technologies have characteristic capacity factors:
- Solar (utility scale): 20-28%
- Wind (onshore): 35-45%
- Wind (offshore): 45-55%
- Combined-cycle gas: 50-70% (depending on dispatch)
- Coal: declining, 40-60% currently
- Nuclear: 92-94% (the highest of any source)
- Peaker plants: 5-15% (designed only to run at peak hours)

Notice that capacity factor doesn't tell you anything about how efficient the plant is *when running*. A solar panel at 28% CF might be 22% efficient at converting sunlight to electricity — those two numbers compound, not substitute. To know the actual annual energy production you need both: nameplate × hours × CF.

Confusing capacity factor with efficiency is the most common mistake in energy journalism. Articles that compare "100 GW of solar" to "100 GW of nuclear" without disclosing capacity factor are missing a 3-4× difference in actual annual energy output. The two technologies have similar nameplate ratings but vastly different real-world delivery, because their capacity factors are different — *not* because their efficiencies are different.

**What You Should Take Away**

If you remember nothing else from this entry: **"efficiency" is not a single number. It is a ratio that depends on what you count as input, what you count as output, and where you draw the system boundary.**

When you see an efficiency claim, ask:
1. **What is the boundary?** Tank-to-wheel or well-to-wheel? Component or system? Operational or theoretical?
2. **What is the metric?** First Law (useful output / total input)? Second Law (useful exergy / total exergy)? Coefficient of performance (heat moved / work input)?
3. **Is this an efficiency or a utilization?** Capacity factor measures how often a plant runs, not how cleanly it converts energy when running.
4. **Compared to what?** A 22% solar efficiency sounds low until you compare it to plants without a Carnot ceiling. A 95% gas furnace sounds high until you compare it to a heat pump.

These four questions, asked of every efficiency claim, are the core analytical move of an energy professional. You will read efficiency numbers in newspapers, industry reports, marketing materials, and policy documents for the rest of your career. The discipline of asking "efficient at what, measured how, against what baseline" is the difference between reading those numbers passively and reading them critically.

Once you have this framework, every later concept in Alexandria — heat rates, capacity factors, COPs, LCOEs, primary energy ratios, well-to-wheel comparisons — falls into place. They are all variations on the same core question: *given what we put in, how much of what we wanted came out, and at what boundary?*`,
      examples: [
        {
          id: 'ex-6-gas-vs-ev',
          title: 'Comparing a gas car to an electric car.',
          audienceTags: ['Newcomer', 'Industrial', 'Trader'],
          body: `A gasoline car is about 25% efficient at converting the chemical energy in gasoline into kinetic energy at the wheels. A modern electric car is about 85% efficient at converting electrical energy from the battery into kinetic energy at the wheels.

Looks like the EV is over 3× more efficient. But where does the electricity come from?

If the electricity comes from a 60%-efficient natural gas power plant, then to deliver 1 unit of useful kinetic energy to the EV's wheels, you need: 1 / 0.85 / 0.95 (transmission) / 0.92 (charging) / 0.60 (generation) = about 2.2 units of natural gas energy at the power plant.

For the gas car to deliver 1 unit of kinetic energy: 1 / 0.25 / 0.85 (refining + distribution) = about 4.7 units of crude oil energy at the wellhead.

So the EV uses 2.2 units of fuel; the gas car uses 4.7 units. The EV is roughly 2× more efficient on a "fuel at source to wheels" basis — substantial, but less dramatic than the 3× implied by component efficiencies alone.

If the EV charges from solar, wind, or nuclear, the "fuel at source" efficiency calculation changes because there's no chemical fuel to count. The EV becomes essentially infinitely cleaner per joule of fossil fuel consumed.

The point: the same two technologies look very different depending on which boundary you draw. There's no single number called "efficiency" that captures the comparison.`,
        },
        {
          id: 'ex-6-fireplace-vs-stove',
          title: 'Why a wood fireplace warms you less than a wood stove.',
          audienceTags: ['Newcomer'],
          body: `An open wood-burning fireplace burns wood at ~800°C in the fireplace, but only ~10-15% of the heat ends up warming the room. The other 85-90% goes up the chimney as hot exhaust. This is a First Law efficiency of ~10-15%.

A modern enclosed wood stove burns the same wood at the same temperature, but is ~70-80% efficient at warming the room. The wood stove has a sealed combustion chamber that extracts heat from the exhaust before it leaves the building.

Same fuel, same combustion, dramatically different efficiency. Because the boundary — what counts as "useful" — is different. The fireplace counts hot air leaving up the chimney as a "loss." The wood stove captures more of that loss before it escapes.

If you sit close to the open fireplace, you do get warmth. But that warmth comes from radiant heat — visible-frequency thermal radiation — not from heat captured by the structure. The fireplace is great at making you feel warm directly; it's bad at heating the room.`,
        },
        {
          id: 'ex-6-charger-warm',
          title: 'Why your phone charger gets warm.',
          audienceTags: ['Newcomer', 'Engineer'],
          body: `You charge your phone overnight. In the morning, both the charger and the back of the phone are slightly warm. Where did that heat come from?

It came from inefficiency in two stages: the wall charger converts AC electricity from the outlet to DC electricity for the phone (about 85-90% efficient), and the phone's battery converts electrical energy into chemical energy stored in its lithium cells (about 95% efficient).

The 10-15% loss in the wall charger and the 5% loss in the battery both end up as heat. Total heat generated during a full charge of a 15 Wh battery: about (15/0.85 - 15) ≈ 2.6 Wh in the charger, plus about 0.75 Wh in the battery — about 12% of the charger's total throughput leaving as heat.

You can feel the inefficiency of energy systems with your hand. Every transformation that produces useful output also produces some waste, and the waste — in nearly every consumer device — ends up as heat. The First Law guarantees the energy is conserved; the Second Law guarantees some fraction shows up as heat we can't easily use.`,
        },
      ],
      retrievalPrompt:
        'Find an electric appliance you use regularly — a kettle, a microwave, a phone charger, a dishwasher. Look up its energy efficiency rating (or estimate it). For that same appliance, identify (a) what the input is, (b) what the useful output is, (c) where the wasted energy goes, and (d) whether the rating is at the device boundary or includes upstream losses (generation, transmission). For most consumer appliances, the rated efficiency hides the largest source of system loss.',
      closingAnchor: `Efficiency improvements are perhaps the most underappreciated force in human history. The 19th-century steam engine ran at ~3% First Law efficiency. The modern combined-cycle gas turbine runs at ~60% — a 20× improvement, achieved over 150 years through thousands of incremental innovations. The 19th-century incandescent bulb converted ~2% of electrical energy into visible light. The modern LED converts ~50% — a 25× improvement in 130 years. These improvements compound: doubling efficiency at each of three sequential stages multiplies the improvement 8×. Every transition in human energy use — from wood to coal, from coal to oil, from oil to gas, from gas to electricity — has been driven not by abundance but by efficiency. The energy transition we are now navigating, from fossil to non-fossil sources, is fundamentally another chapter in that story.`,
    },
    L2: {
      body: `**Efficiency Is Not One Number**

If you ask "how efficient is a power plant?" or "how efficient is a heat pump?" or "how efficient is an electric car?" — there is no single answer. There are several answers, and they depend on which question you are actually asking.

The mistake most people make is treating efficiency as a single, well-defined quantity. It isn't. Efficiency is a *ratio* — useful output divided by total input — and the ratio depends entirely on what you count as "useful," what you count as "total input," and where you draw the boundary around the system.

This sounds like nitpicking. It is not. Different efficiency definitions can rank the same set of technologies in completely different orders. A regulator who uses one definition and a competitor who uses another can both be telling the truth and reach opposite conclusions. The professional discipline is to know which definition applies to which question.

**The Five Efficiencies Worth Knowing**

*1. First Law efficiency (η₁).* The most common definition: useful energy output divided by total energy input. Bounded by 100% for any process that converts energy from one form to another. This is what people usually mean when they say "efficiency."

A modern combined-cycle gas turbine has First Law efficiency of about 60%. A coal plant about 35%. A residential gas furnace about 95%. A solar panel about 22%. Each is a ratio of useful output (electricity, heat, or both) to fuel or radiation input.

*2. Second Law efficiency (η₂).* The ratio of useful *exergy* delivered to total exergy consumed. This metric corrects for the fact that not all energy is equally useful. A gas furnace converting 95% of fuel chemical energy into 20°C room heat scores only ~10% on the Second Law metric — because almost all the high-grade chemical exergy of the methane was destroyed in the temperature drop from 2,000°C flame to 20°C room.

The Second Law metric is the rigorous one. The First Law metric is the convenient one. They disagree most sharply for low-temperature processes, where the First Law is misleading.

*3. Coefficient of performance (COP).* Specific to heat pumps and refrigeration. Heat pumps move thermal energy from a cool source to a warm destination, using work as input. Because they're moving energy rather than transforming it from a higher-grade form, the ratio of heat delivered to work input can be far above 1.0.

A modern air-source heat pump has COP of 3-4, meaning it delivers 3-4 units of heat per unit of electrical work. This looks impossible (>100% First Law efficiency) but is fully consistent with the Second Law because the additional energy comes from the ambient environment, not from the electrical input.

*4. Capacity factor (CF).* Not an efficiency at all, despite often being treated as one. CF is the fraction of theoretical maximum output that a plant actually delivered over a year:

CF = actual annual energy / (nameplate power × 8,760 hours)

Wind farms run at 35-45% CF. Utility-scale solar 20-28%. Modern CCGTs 50-70%. Nuclear 92-94%. Peaker plants 5-15%. CF is a *utilization* metric — how often was the plant operating, and at what fraction of full capacity. It tells you nothing about how efficient the plant is *when running*.

*5. Heat rate.* The inverse of First Law efficiency for thermal generators, expressed in BTU per kWh:

HR = fuel BTU input / electrical kWh output

A CCGT at 6,500 BTU/kWh has First Law efficiency of 3,412/6,500 = 52% (using the conversion 1 kWh = 3,412 BTU). Heat rate is the standard metric in US wholesale power markets because it converts directly to marginal cost when multiplied by fuel price.

**The Boundary Problem**

The single most important thing to internalize about efficiency is that *the number depends on where you draw the system boundary*. The same physical device can be reported with different efficiencies depending on what you include.

Consider an EV. There are at least three plausible "efficiency" answers:

- *Battery to wheel:* about 85%. This counts the energy stored in the battery vs the kinetic energy delivered to the road. The motor and drivetrain are about 90% efficient; rolling resistance and aerodynamic losses do the rest.

- *Wall to wheel:* about 75%. This includes battery charging losses (~92%) and the battery-to-wheel efficiency.

- *Well to wheel:* depends entirely on the grid. If you charge from a 60%-efficient CCGT through 95%-efficient transmission and 92%-efficient charging into the 85%-efficient battery-to-wheel: 0.60 × 0.95 × 0.92 × 0.85 = **45%**. If you charge from solar: drop the 60% generation factor, replace with ~22% solar conversion. The "well-to-wheel" answer for a solar-charged EV is ~17%, but the "well" is the sun, which is functionally infinite.

A gasoline car: about 25-30% tank-to-wheel. About 70% well-to-tank (refining + distribution). Well-to-wheel: about 17-21%.

EVs and gas cars score very differently depending on the boundary. Tank-to-wheel comparisons make EVs look 3× better than gas. Well-to-wheel comparisons (for a coal-grid EV) tighten the gap considerably. Comparisons with a clean grid widen it again. None of these comparisons is wrong — they just answer different questions.

The professional discipline: every efficiency claim should be paired with a boundary specification. "60% efficient" without context is incomplete information.

**The Misconception to Defeat**

The most common misconception about efficiency is that "high First Law efficiency" means "good." It often does. But it doesn't always.

A 95%-efficient gas furnace is a worse end-use technology than a 300%-efficient (COP 3) heat pump. By the conventional First Law metric, the furnace looks vastly more efficient. By the Second Law metric, the heat pump wins by an enormous margin. By the primary-energy metric (with realistic grid generation), the heat pump still wins by ~2×. By the cost metric (in regions where electricity isn't more than ~3× the equivalent gas price), the heat pump wins on operating cost.

The First Law metric is intuitive — it's the one your high school physics teacher taught. But it is incomplete. The Second Law gives the more rigorous answer, and the system-level analysis gives the operationally relevant answer. Energy professionals carry all three frameworks and switch between them depending on the question.

When you read efficiency claims in news articles or industry reports:
- Check the boundary. What is being included as input and output?
- Check the convention. HHV or LHV? Gross or net? Operational or rated?
- Check the metric. First Law? Second Law? COP? Capacity factor?
- Check whether it's the right metric for the question being asked.

This habit alone separates analysts who can read the energy industry from those who can only react to it.`,
      workedExample: {
        id: 'wex-6-furnace-vs-heatpump',
        title: 'A Gas Furnace vs a Heat Pump',
        body: `Consider two ways to heat a 20°C room when it's 0°C outside.

*Option 1 — Natural gas furnace.* Burns methane in a combustion chamber at ~2,000°C. Transfers heat to the air through a heat exchanger. Modern condensing furnace: about 95% First Law efficiency.

For each kWh of useful heat delivered to the room: 1 / 0.95 = **1.05 kWh of natural gas consumed**.

*Option 2 — Air-source heat pump.* Uses electrical work to pump heat from the 0°C outside air into the 20°C indoor air. Modern unit at these conditions: COP = 3.0.

For each kWh of useful heat delivered to the room: 1 / 3.0 = **0.33 kWh of electricity consumed**.

The heat pump consumes ~3× less energy at the point of use. Looks like a clear win.

But now extend the boundary upstream. Where does the electricity come from?

If the electricity is generated from natural gas at 60% efficiency in a CCGT, with 5% transmission losses, then each kWh of electricity at the wall outlet required 1 / (0.60 × 0.95) = **1.75 kWh of natural gas at the power plant**.

The heat pump's wall-to-room efficiency is COP × T&D efficiency = 3.0 × 0.95 = 2.85. But its primary-energy efficiency (gas-at-power-plant to heat-in-room) is 0.33 × 0.60 × 0.95 = **19%**. Wait — that's lower than the gas furnace's 95%!

Not quite. The math: each unit of useful heat from the heat pump requires 0.33 kWh electricity, which required 0.33 / 0.60 / 0.95 = 0.58 kWh of gas at the power plant. The gas furnace required 1.05 kWh of gas at the meter. So the heat pump uses **45%** as much primary natural gas as the furnace, despite the apparent loss of converting the gas to electricity first.

The reason: even though converting gas to electricity destroys ~40% of the chemical exergy, the heat pump then leverages that electricity to *move* environmental thermal energy that would otherwise be inaccessible. The Second Law allows this because the heat pump is not transforming high-grade exergy into low-grade exergy — it is using electrical work to move ambient heat against the temperature gradient.

The heat pump wins. Not by 3× as the COP suggested in isolation, but by ~2.2× in primary energy terms. And if the electricity comes from anything cleaner than gas (nuclear, wind, solar, hydro), the heat pump's advantage grows further.

This is the kind of analysis that depends entirely on where the system boundary is drawn — and the right boundary depends on what question you're asking.`,
        widgetSpec: {
          type: 'comparator',
          description:
            'Heat Pump vs Furnace Comparator — set component efficiencies, fuel and electricity prices, and grid carbon intensity; compare primary energy, operating cost, and CO₂.',
          inputs: [
            { name: 'furnace efficiency', unit: '%', type: 'number', range: [70, 99], default: 95 },
            { name: 'heat pump COP', type: 'number', range: [1.5, 5], default: 3 },
            { name: 'electricity generation efficiency', unit: '%', type: 'number', range: [30, 70], default: 60 },
            { name: 'transmission losses', unit: '%', type: 'number', range: [3, 10], default: 5 },
            { name: 'gas price', unit: '$/MMBtu', type: 'number', range: [2, 15], default: 3.5 },
            { name: 'electricity price', unit: '$/kWh', type: 'number', range: [0.05, 0.4], default: 0.14 },
            { name: 'grid carbon intensity', unit: 'kgCO₂/MWh', type: 'number', range: [0, 900], default: 380 },
          ],
          outputs: [
            { name: 'primary energy ratio', computation: 'furnace primary kWh / heat-pump primary kWh' },
            { name: 'fuel cost ratio', computation: 'gas furnace cost / heat pump electricity cost per useful kWh' },
            { name: 'CO₂ emissions ratio', computation: 'furnace combustion CO₂ vs grid CO₂ per useful kWh' },
          ],
        },
      },
      retrievalPrompt:
        'A coal plant has a heat rate of 9,500 BTU/kWh and operates at 65% capacity factor. The plant has 600 MW nameplate capacity. (a) What is its First Law efficiency? (b) Approximately how much electrical energy does it generate per year, in MWh? (c) If coal costs $40/ton with a heat content of 24 GJ/ton, what is the marginal fuel cost per MWh of electricity?',
    },
    L3: {
      body: `**1. Definitions and Taxonomy of Efficiency Metrics**

Efficiency is fundamentally a ratio: useful output divided by total input. The operational complexity comes from the multiplicity of definitions for "useful output," "total input," and the system boundary at which both are measured. Energy efficiency in commercial and engineering practice is not a single quantity but a family of related metrics, each answering a different question.

*First Law efficiency (η₁):*
**η₁ = E_useful_out / E_total_in**

The ratio of useful energy output to total energy input across a defined system boundary. Bounded by 100% for any heat-to-work or work-to-work conversion (reaches ~99% for generators), but can exceed 100% for processes that pump ambient thermal energy (heat pumps, where the reported "efficiency" is more accurately the coefficient of performance, COP).

*Second Law efficiency (η₂):*
**η₂ = Exergy_useful_out / Exergy_total_in**

The ratio of useful exergy delivered to total exergy consumed. Bounded by 100% for any real process. Captures the *quality* of energy transformations, not just their *quantity*. The most rigorous metric for comparing dissimilar technologies but rarely used in commercial practice because of measurement and communication difficulty.

*Coefficient of performance (COP):*
**COP_heating = Q_delivered / W_input**
**COP_cooling = Q_removed / W_input**

Specific to heat pumps and refrigeration cycles. Q is thermal energy moved; W is work input. Modern air-source heat pumps achieve COP of 3.0-4.5 in heating mode, ground-source 4.0-5.5. Ratios above 1.0 are not violations of any thermodynamic law — the heat pump moves thermal energy from the environment using work, with the thermodynamic ceiling set by the Carnot COP between source and sink temperatures.

*Capacity factor (CF):*
**CF = E_actual / (P_nameplate × t)**

The ratio of energy actually generated over a period to the energy that would have been generated if the plant ran at full nameplate power for the entire period. A utilization metric, not an efficiency metric. Wind ~35-45%, utility solar ~20-28%, CCGT ~50-70% (dispatch-dependent), nuclear ~92-94%, peaker plants 5-15%.

*Heat rate (HR):*
**HR = E_fuel_in / E_electricity_out** (units: BTU/kWh)

The inverse of First Law efficiency for thermal generation, expressed in commercially-useful units. A CCGT at 6,500 BTU/kWh has HR = 6,500, η₁ = 3,412/6,500 ≈ 52.5% (HHV basis). Heat rate is the standard merit-order metric in US wholesale electricity markets because it converts directly into marginal cost when multiplied by fuel price.

*Round-trip efficiency (RTE):*
**RTE = E_discharged / E_charged**

For storage systems. Captures all losses across the charge-store-discharge cycle. Lithium-ion 85-95%, pumped hydro 70-85%, compressed air 50-70%, hydrogen (electrolysis-storage-fuel cell) 30-40%. Critical for arbitrage economics: a battery with 90% RTE buying at $20/MWh and selling at $30/MWh nets $30 × 0.9 - $20 = $7/MWh per cycle, not $10/MWh.

*System efficiency (well-to-wheel, fuel-to-load, etc.):*
The product of efficiencies along an entire energy chain, from primary resource to final useful work. The most operationally relevant metric for comparing dissimilar end-use pathways (e.g., gasoline ICE vehicle vs grid-charged EV). Often the metric that overturns intuitions formed by component-level efficiency comparisons.

**2. The Boundary Problem: Why Efficiency Numbers Disagree**

The single most important methodological point about efficiency is that *the number depends on where the system boundary is drawn*. Identical physical processes can be reported with widely different efficiencies depending on what is included.

*HHV vs LHV.* Higher heating value (HHV) includes the latent heat of water vapor condensation in the fuel input; lower heating value (LHV) excludes it. For natural gas, HHV is ~10% higher than LHV. A CCGT reported at "60% LHV efficiency" and "54% HHV efficiency" describes the same plant. The US convention is HHV; the European convention is LHV. Cross-region efficiency comparisons that mix these are systematically biased.

*Gross vs net.* Gross efficiency uses the generator's gross electrical output. Net efficiency subtracts the plant's auxiliary loads (fans, pumps, controls — typically 4-7% of gross output for thermal plants). The merit-order-relevant figure is net.

*Primary vs final.* The IEA's "physical content" methodology counts renewable electricity at its delivered MWh value (primary = final). The "substitution" methodology used by BNEF and others counts it at the equivalent fossil primary energy that would have produced the same MWh (primary >> final). Comparing renewable shares across reports using different conventions produces apparent disagreements that are entirely methodological.

*Lifecycle vs operational.* A solar panel's "efficiency" can mean its instantaneous conversion efficiency (~22% for monocrystalline silicon) or its lifecycle energy return on investment (EROI ~10-25 depending on assumptions). These are completely different quantities.

*Tank-to-wheel vs well-to-wheel.* A gasoline car at "30% tank-to-wheel" efficiency burns 70% of the fuel energy as waste heat in the engine. But the well-to-wheel efficiency must also include refining losses (~85% efficient), distribution losses (~99%), and gives a system efficiency of ~25%. An EV at "85% battery-to-wheel" efficiency must include power generation losses (~45% for current US grid mix), transmission losses (~95%), and charging losses (~92%) for a well-to-wheel efficiency of ~33%. The component numbers hide the system reality.

The practitioner discipline: every efficiency claim must be paired with a boundary specification. A claim that "this technology is 60% efficient" is incomplete information. A claim that "this technology achieves 60% LHV net efficiency at full load under ISO conditions" is operational.

**3. The Carnot Ceiling and Its Practical Implications**

Per the prior entry on the Second Law, any heat-engine efficiency is bounded above by the Carnot limit:

**η_max = 1 - T_cold / T_hot**

This appears in efficiency analysis as the *theoretical ceiling*. Real efficiencies are systematically below Carnot because of irreversibilities: finite-temperature heat transfer, friction in turbines, pressure drops in piping, incomplete combustion, mechanical losses in generators. The Second Law efficiency:

**η₂ (heat engine) = η₁_actual / η_Carnot**

quantifies how close a real engine comes to its theoretical ceiling. A CCGT at 60% First Law efficiency with a Carnot ceiling of 83% has η₂ = 60/83 = **72%** — meaning it captures 72% of the work theoretically extractable given its temperature ratio.

This metric is more analytically useful than First Law efficiency for comparing plants operating at different temperatures. A geothermal binary plant at 12% First Law efficiency may seem dramatically inferior to a CCGT, but its Carnot ceiling (28% for a 150°C source) means η₂ = 12/28 = **43%**. The geothermal plant is closer to its thermodynamic ceiling than a poor coal plant operating at the same percentage of Carnot. This shifts the engineering question from "why is the efficiency so low" to "where is the exergy being destroyed and can it be recovered."

**4. The Heat-Pump Special Case**

Heat pumps systematically achieve First Law efficiencies above 100% because they pump ambient thermal energy using electrical work. This violates no thermodynamic law because the energy "input" — the work — is a fraction of the heat moved.

For a heating-mode heat pump:
**COP_heating = Q_hot / W = T_hot / (T_hot - T_cold)** (Carnot ideal)

A heat pump moving heat from a 0°C outdoor environment (273 K) to a 20°C indoor environment (293 K) has Carnot COP = 293 / (293 - 273) = **14.7**. Real air-source heat pumps achieve COP of 3-4 under these conditions, well below Carnot but still 3-4× more thermal energy delivered per unit of work consumed than electric resistance heating.

The Second Law efficiency of a heat pump:
**η₂ = COP_actual / COP_Carnot**

A real heat pump at COP 4.0 against a Carnot COP of 14.7 has η₂ = 4.0/14.7 = **27%**. By the Second Law metric, this is unimpressive. But the ratio that matters for end-use economics is COP itself — and a COP of 4.0 means the heat pump delivers 4 units of thermal energy per unit of electrical input, dominating any combustion-based heating on operational cost wherever electricity is cheaper than 4× the equivalent gas price.

This is the case where First Law and Second Law efficiency metrics can rank technologies in different orders, and where the choice of metric carries policy implications. If regulators choose First Law metrics, electric resistance heating (η₁ = 100%) appears "efficient." If they choose Second Law metrics, electric resistance heating (η₂ ≈ 5-10% depending on grid mix) appears terrible. The literature in thermodynamic policy (Hammond, Rosen, Sciubba) argues that Second Law metrics produce more rational regulation, particularly for end-use technologies.

**5. Common Practitioner Errors**

*Error 1: Comparing capacity factor to efficiency.* A 28% capacity factor (utility solar) and a 33% First Law efficiency (PWR nuclear) are not comparable quantities. The first is a utilization fraction; the second is a thermodynamic conversion fraction. A solar farm at 28% CF may be operating at ~22% conversion efficiency during its sunlit hours; the two metrics multiply rather than substitute.

*Error 2: Component efficiency without system context.* A 95%-efficient transformer in a system with 35% generation efficiency contributes ~33% to system efficiency, not 95%. Optimizing component efficiency in isolation produces diminishing returns once any single stage dominates losses.

*Error 3: Steady-state efficiency reported as operational efficiency.* Many efficiency figures (especially for combustion turbines) are reported at full-load steady-state conditions. Real-world operating profiles include start-up losses, part-load operation (where efficiency drops sharply for many technologies), and ramping. A peaker plant with 35% rated efficiency may achieve only 25-30% on a fleet-average operational basis.

*Error 4: Conflation of η₁ and COP.* Heat pumps with COP > 1 are routinely described as having "200% efficiency" or "300% efficiency" in marketing materials. While dimensionally correct as a First Law ratio, this language confuses readers and obscures the underlying Second Law mechanism. Professionals use COP for heat pumps and refrigeration; "efficiency" should be reserved for processes bounded by 100%.

*Error 5: Ignoring auxiliary loads.* A "96% efficient" condensing boiler may be 96% efficient at the heat exchanger but only 90% efficient at the building level once flue losses, standby losses, and pump electricity are accounted for. The relevant boundary depends on the question being asked.

**6. Operational Relevance to PJM and Wholesale Markets**

Heat rate is the operational expression of the Second Law in wholesale power markets. Every thermal generator's bid into the day-ahead and real-time markets is fundamentally a function of its heat rate × fuel price + variable O&M:

**Marginal cost ≈ HR × fuel_price + VOM**

For the same fuel price, a unit with lower heat rate (higher efficiency) sits lower on the supply curve and dispatches first. The merit-order ranking in any RTO is, at its core, a Second Law ranking — units are ordered by how efficiently they convert chemical exergy to electrical exergy.

This produces a hierarchy in PJM:
- Nuclear (very low fuel cost): always dispatched, runs at >92% CF
- CCGT (HR ~6,500 BTU/kWh): high efficiency makes it the marginal unit at most hours when gas is moderate
- Coal (HR ~9,500-10,500 BTU/kWh): lower efficiency, higher fuel cost in deregulated markets, increasingly displaced
- Simple-cycle gas (HR ~10,000-12,000 BTU/kWh): very low efficiency, only dispatches in peak hours when LMP exceeds ~$50/MWh
- Oil (HR variable, fuel expensive): only in extreme conditions

The retirement of coal capacity and the dominance of CCGTs in PJM's 2010-2025 transformation is, mechanistically, a story about efficiency advantages compounded over operating hours. Each percentage point of First Law efficiency, multiplied by tens of thousands of operating hours per year, becomes a structural cost advantage that drives merit-order position and ultimately fleet composition.

For renewables, capacity factor plays the role heat rate plays for thermal units. Higher CF assets earn more revenue per MW of nameplate capacity; the economic premium for high-CF wind sites or sun-rich solar sites is fundamentally an efficiency-of-utilization premium.`,
      primarySources: [
        { citation: 'Çengel, Y. A., & Boles, M. A. (2019). Thermodynamics: An Engineering Approach (9th ed.). McGraw-Hill.', type: 'book' },
        { citation: 'Bejan, A. (2016). Advanced Engineering Thermodynamics (4th ed.). Wiley.', type: 'book' },
        { citation: 'IEA (2024). World Energy Outlook: Methodology Annex.', type: 'data-source' },
        { citation: 'US Energy Information Administration. Electric Power Annual.', type: 'data-source' },
        { citation: 'ASHRAE Handbook (2024). HVAC Systems and Equipment.', type: 'manual' },
        { citation: 'Hammond, G. P. (2007). "Industrial energy analysis, thermodynamics and sustainability." Applied Energy.', type: 'paper' },
      ],
    },
  },
};
