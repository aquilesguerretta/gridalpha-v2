// SCRIBE — Entry 003 · The Forms of Energy
// Renderer-only contract: prose is verbatim from the Sub-Tier 1A handoff.

import type { CurriculumEntry } from '@/lib/types/curriculum';

export const formsOfEnergy: CurriculumEntry = {
  id: 'forms-of-energy',
  number: 3,
  title: 'The Forms of Energy',
  tier: 1,
  phase: 1,
  subTier: '1A',
  thresholdConcept:
    'The "forms" of energy are different storage configurations of the same conserved quantity. Each form is defined by the physical mechanism that holds it, and energy moves between forms through specific transformations governed by physical law.',
  misconceptionDefeated: 'Different "types" of energy are different substances.',
  prerequisites: ['what-is-energy', 'power-vs-energy'],
  transformationChain: null,
  diagramSpec: {
    title: 'The Forms of Energy + Transformation Map',
    description:
      'A central node labelled "Energy" with seven spokes radiating to each form (kinetic, potential, thermal, chemical, electrical, electromagnetic, nuclear). Edges connecting forms represent named transformations.',
    layerProgression: {
      L1: 'Simplified to four forms.',
      L2: 'All seven forms with transformation labels.',
      L3: 'Adds typical efficiency limits to each transformation edge.',
    },
    designNotes:
      'Network diagram aesthetic; this becomes a navigation primitive in future versions where readers can click any form to drill into entries about it.',
    componentName: 'FormsOfEnergyNetwork',
  },
  estimatedReadingTime: { L1: 9, L2: 11, L3: 14 },
  layers: {
    L1: {
      body: `**Different Costumes, Same Performer**

Energy can show up in different "forms" — but here is the most important thing to understand from the start: **the forms are not different kinds of energy**. They are different ways the same thing can be stored.

Think of it like water. Water can be in a lake, in a cloud, in a glass, in your body, in a river, frozen in ice. In each case, it is still water — just held in a different place, in a different way. The form changes; the substance does not. And the total amount of water on Earth never changes — it just moves between forms.

Energy works the same way. There is one conserved quantity called energy, and it can be stored in different ways: in motion, in position, in heat, in chemical bonds, in electric and magnetic fields, in light, in atomic nuclei. Each of these "forms" is a different storage mode, but they are all the same underlying quantity. When a piece of wood burns, chemical energy doesn't disappear and heat energy doesn't appear from nowhere — the same energy, previously stored in molecular bonds, is now stored as the random motion of hot air molecules.

**The Forms You Need to Know**

Seven forms cover essentially everything in the energy world.

**1. Kinetic energy** — energy in motion. A flowing river. A spinning turbine. A speeding car. Anything moving has kinetic energy.

**2. Potential energy** — energy stored in position. Water in a reservoir held above a dam. A book held above the floor. A compressed spring. The energy is "loaded" into the position and waiting to be released.

**3. Thermal energy** — heat. Technically, this is just kinetic energy at the very small scale: the random jiggling of atoms and molecules. A hot cup of coffee has more thermal energy than a cold one because its molecules are moving faster.

**4. Chemical energy** — energy stored in the bonds between atoms in a molecule. A piece of wood, a gallon of gasoline, a candy bar, a battery. Releasing chemical energy means breaking and reforming molecular bonds in ways that release the difference.

**5. Electrical energy** — energy carried by moving electric charges and the fields they create. The electricity flowing through your wall outlet. The current in a wire.

**6. Electromagnetic radiation** — energy traveling through space as light. Sunlight is the most important example, but radio waves, microwaves, infrared, X-rays are all electromagnetic radiation at different frequencies. They all carry energy.

**7. Nuclear energy** — energy stored deep inside atomic nuclei, held by the forces that bind protons and neutrons together. Released by fission (splitting big atoms) or fusion (combining small ones). Holds vastly more energy per kilogram than any chemical fuel.

**Why This Matters**

Once you can see the forms and the transformations between them, every energy technology becomes legible. A power plant is a transformation chain. A battery is a chemical-to-electrical-and-back device. A wind turbine is a kinetic-to-electrical converter. A solar panel is an electromagnetic-to-electrical converter. A heat pump is an electrical-to-thermal pump that uses the environment as a thermal reservoir.

There are no exotic forms hiding outside this list. There are no special types of "renewable energy" that exist in different categories from "fossil energy" — both are chemical or electromagnetic energy entering the same downstream transformation chains. The categories that matter politically and economically are about *where the energy comes from* and *how it is transformed*, not about energy itself being a different substance.

If you remember nothing else from this entry: **energy has many storage forms but is one conserved quantity, and every energy technology is fundamentally a transformation between specific forms governed by specific physical laws.**

*Note: these forms differ enormously in how much energy they hold per kilogram. A kilogram of uranium fuel holds about 2 million times more energy than a kilogram of gasoline, which holds about 100 times more energy than a kilogram of lithium-ion battery. Energy density is one of the most important quantitative facts about any energy form, and it is the principal reason fossil fuels have been so hard to replace and nuclear is so efficient per unit of fuel.*`,
      examples: [
        {
          id: 'ex-3-pendulum',
          title: 'A pendulum swinging.',
          audienceTags: ['Newcomer', 'Engineer'],
          body: `Pull a pendulum back and let go. At the highest point, the pendulum is briefly motionless — it has no kinetic energy. But it has been lifted, so it has gravitational potential energy.

As it swings down, it speeds up. The potential energy becomes kinetic energy. At the bottom of the swing, when it is moving fastest, it has maximum kinetic energy and minimum potential energy.

Then it swings up the other side, slowing as it climbs. Kinetic energy converts back to potential. At the highest point on the other side, it stops momentarily — maximum potential, zero kinetic — and the cycle reverses.

Through all of this, the total energy (kinetic + potential) stays constant. Energy is just moving between two forms. In the real world, the pendulum eventually slows down because of friction with the air, which converts a tiny bit of kinetic energy into thermal energy with each swing. The pendulum eventually stops because all of its mechanical energy has been transformed into a slight warming of the surrounding air. The energy isn't lost. It is just spread out.`,
        },
        {
          id: 'ex-3-burning-wood-cabin',
          title: 'A piece of wood burning to warm a cabin.',
          audienceTags: ['Newcomer', 'Industrial'],
          body: `You light a piece of firewood. The wood is storing chemical energy in its molecular bonds — bonds between carbon atoms, hydrogen atoms, oxygen atoms that make up cellulose. When you strike the match, the heat from the match starts a chemical reaction with the oxygen in the air. The cellulose bonds break and reform into carbon dioxide and water vapor. The new bonds hold less energy than the old ones, and the difference comes out as **thermal energy** (heating the air around the fire) and **electromagnetic radiation** (the visible light and infrared heat radiating outward).

Trace the chain: chemical energy → thermal + electromagnetic. The thermal energy spreads through the room by warming air molecules, which collide with you and the cabin walls, transferring more thermal energy. Some of the electromagnetic radiation hits your skin, warming you directly.

Eventually, all of the original chemical energy has been transformed into thermal energy that has spread throughout the cabin and out into the cold night. The wood is gone. The energy is still there — just spread thinly across the air, the walls, and eventually the entire planet.`,
        },
        {
          id: 'ex-3-ev-solar',
          title: 'Charging an electric car from solar panels.',
          audienceTags: ['Newcomer', 'Trader', 'Industrial', 'Policy'],
          body: `A photon leaves the sun. It travels for eight minutes through space, carrying **electromagnetic radiation** energy. It strikes a solar panel on a parking garage roof. The photon's energy excites an electron in the silicon, knocking it loose — converting electromagnetic energy to **electrical energy**.

The electricity flows through wires to a charging station, where it enters an electric vehicle. Inside the EV battery, the electrical energy drives a chemical reaction — lithium ions move from one electrode to another — converting electrical energy to **chemical energy** stored in the battery's molecular structure.

You drive away. As you accelerate, the battery's chemical energy reverses the reaction and releases electrical energy, which flows through the motor. The motor converts electrical energy to **kinetic energy** — the rotation of the wheels, then the motion of the whole car down the road.

You brake at a stoplight. Most modern EVs have regenerative braking: the motor reverses, becoming a generator. Kinetic energy is converted back to electrical, which charges the battery (back to chemical). Some kinetic energy still becomes thermal in the brake pads.

Trace the whole chain: nuclear (in the sun) → electromagnetic (sunlight) → electrical (in the panel) → chemical (in the battery) → electrical (out of the battery) → kinetic (in the motion of the car) → thermal (in the brakes and air resistance).

Seven forms. Six transformations. Same conserved energy throughout.`,
        },
      ],
      retrievalPrompt:
        'Look around the room you are in. Identify three objects or systems that are currently storing energy in some form. For each one, name the form (kinetic, potential, thermal, chemical, electrical, electromagnetic, or nuclear) and the most likely next transformation that energy will undergo if released.',
    },
    L2: {
      body: `**Forms Are Storage Modes, Not Different Things**

When physicists and engineers talk about "the forms of energy" — kinetic, potential, thermal, chemical, electrical, electromagnetic, nuclear — they are not describing different *kinds* of energy. They are describing different *ways* energy can be stored in a system.

This distinction matters because the popular language treats the forms as separate substances. People speak as if "heat energy" and "chemical energy" were different fluids that flow into and out of containers. They are not. They are different patterns of organization of the same conserved quantity. Energy can change form, but the joules tracked across all forms always sum to the same total in any closed system.

The seven forms in the standard engineering taxonomy:

**1. Kinetic energy.** Energy in bulk motion. A spinning turbine, a moving river, a falling weight, a wind stream. Calculated as E = ½mv² for a single object; for a fluid stream, E = ½ × mass flow rate × v². Every transformation that produces useful work passes through kinetic energy at some point — turbines spin, motors rotate, pistons move.

**2. Potential energy.** Energy stored in position. A reservoir of water held above a turbine has gravitational potential energy waiting to become kinetic. A compressed spring has elastic potential energy. A charged capacitor has electrical potential energy. The unifying feature: position within a force field, with energy "loaded" into the field by past work and released when the position changes.

**3. Thermal energy.** The kinetic and potential energy of atoms and molecules at the microscopic scale, distributed randomly across many particles. The temperature of a substance measures the average kinetic energy per particle. Thermal energy is conceptually the disordered version of kinetic + potential energy at small scales — which is why heat is the "default" form energy degrades into when no organized work is being done.

**4. Chemical energy.** Energy stored in molecular bonds. The covalent bonds in a hydrocarbon hold less energy than the bonds in CO₂ + H₂O — when fuel burns, the difference is released as thermal energy. Energy density varies enormously: gasoline holds ~45 MJ/kg, lithium-ion battery chemistries hold ~0.5-1 MJ/kg, lead-acid hold ~0.1 MJ/kg. The energy density of fuels is the principal reason fossil-based transportation has been so hard to replace.

**5. Electrical energy.** Energy carried by electric and magnetic fields. In a circuit, electrical energy moves at near-light speed through conductors as electromagnetic field disturbances. Storage is in capacitors (electric field) and inductors (magnetic field), but both are tiny compared to chemical or potential storage at practical scales — which is why grid-scale electrical energy storage is dominated by chemistry (batteries) or potential energy (pumped hydro), not by capacitors or inductors directly.

**6. Electromagnetic radiation.** Energy traveling through space as photons. Sunlight at Earth's surface delivers ~1 kW/m² on a clear day. Radio waves, microwaves, infrared, visible light, ultraviolet, and X-rays are all electromagnetic radiation in different frequency bands. The total annual solar energy striking Earth's land surface is ~25,000× total human primary energy consumption — the resource is not the constraint, but the conversion is.

**7. Nuclear energy.** Energy stored in atomic nuclei. The strong nuclear force binds protons and neutrons with energies ~10⁶ × greater per particle than chemical bond energies. Fission of uranium-235 releases ~200 MeV per atom (~83 TJ/kg of fuel), about 2 million times the energy density of gasoline. Fusion of hydrogen isotopes releases ~17 MeV per reaction (~340 TJ/kg of deuterium-tritium fuel). The energy density advantage is the fundamental reason nuclear is a low-fuel-cost generation technology.

**The Mechanism of Transformation**

Energy moves between forms through specific physical processes, and every transformation has a name and a mechanism:

- **Combustion**: chemical → thermal (and a little electromagnetic, as light)
- **Heat engine**: thermal → kinetic (Carnot-limited)
- **Generator**: kinetic → electrical
- **Motor**: electrical → kinetic
- **Photovoltaic effect**: electromagnetic → electrical
- **Resistive heating**: electrical → thermal
- **Electrolysis**: electrical → chemical
- **Battery discharge**: chemical → electrical
- **Battery charge**: electrical → chemical
- **Fission**: nuclear → thermal (and various particle kinetic energies)
- **Photosynthesis**: electromagnetic → chemical

Every power plant is a chain of these. A coal plant: combustion → heat engine → generator. A solar PV plant: photovoltaic effect (one step). A natural gas combined-cycle plant: combustion → heat engine (gas turbine) → heat engine (steam turbine, using waste heat) → generator (twice). A pumped hydro storage facility on charge: motor → potential. On discharge: potential → kinetic → generator.

Understanding any energy technology is fundamentally a matter of identifying which transformation chain it implements and where exergy is destroyed along the chain.

**The Misconception to Defeat**

The intuitive picture most people carry is that "heat energy" and "chemical energy" and "electrical energy" are different things — three separate kinds of energy, each living in its own world. This is wrong, and it leads to confused thinking about efficiency and losses.

The correct picture: energy is one conserved quantity, and the "forms" are different ways of storing it. Chemical energy in natural gas is the same fundamental quantity as electrical energy in a power line, just held in a different configuration. The transformation between them — combustion plus the thermal-to-kinetic-to-electrical cascade — preserves total energy but degrades exergy.

This matters operationally because every efficiency calculation in the field is fundamentally tracking *exergy destruction* across a transformation chain, not "energy lost." When you read that a CCGT is "60% efficient," what is actually happening is that 100 units of chemical exergy enter and 60 units of electrical exergy exit — the other 40 units of energy still exist, but as low-temperature waste heat that has very little remaining capacity to do useful work.`,
      workedExample: {
        id: 'wex-3-ccgt-cascade',
        title: 'Tracing Energy Through a CCGT Plant',
        body: `A combined-cycle gas turbine plant burns natural gas to generate electricity. Trace the energy:

*Stage 1 — Chemical to thermal (combustion).* Natural gas (CH₄) reacts with oxygen: CH₄ + 2O₂ → CO₂ + 2H₂O + 891 kJ/mol. Per kg of methane, ~55 MJ of chemical energy converts to thermal energy in the combustion gases. Combustion temperature reaches ~1,500°C. Combustion efficiency: ~99%.

*Stage 2 — Thermal to kinetic (gas turbine).* Hot, high-pressure gases expand through the gas turbine, transferring thermal energy to the rotor as kinetic (rotational) energy. Modern gas turbine isentropic efficiency: ~88-92%. The exhaust still leaves at ~600°C — far above ambient — meaning significant thermal exergy remains.

*Stage 3 — Kinetic to electrical (generator).* The rotating turbine shaft drives a synchronous generator, converting rotational kinetic energy into AC electrical energy at grid frequency. Generator efficiency: ~98-99%.

*Stage 4 — Recovery (waste thermal to thermal to kinetic to electrical).* The hot exhaust enters a heat recovery steam generator (HRSG), boiling water into high-pressure steam (thermal → thermal, ~85% efficient). The steam expands through a steam turbine (thermal → kinetic, ~88% efficient) and drives a second generator (~98% efficient).

*Net result.* For every 100 units of chemical energy in the natural gas:
- ~60 units become electrical energy delivered to the grid
- ~40 units leave as low-grade waste heat through the cooling tower

Compare to a simple-cycle gas turbine (gas turbine + generator only, no steam recovery): ~35 units of electrical output per 100 units of fuel. The 25-percentage-point improvement of combined-cycle reflects the recovery of exergy from the gas turbine exhaust before it is rejected to the environment.`,
        widgetSpec: {
          type: 'calculator',
          description:
            'CCGT Efficiency Cascade — combustion temperature, gas turbine inlet pressure, condenser temperature in; theoretical Carnot limits at each stage, plant efficiency, comparison to simple-cycle out.',
          inputs: [
            { name: 'combustion temperature', unit: '°C', type: 'number', range: [1000, 1700], default: 1500 },
            { name: 'gas turbine inlet pressure', unit: 'bar', type: 'number', range: [10, 40], default: 25 },
            { name: 'condenser temperature', unit: '°C', type: 'number', range: [10, 60], default: 30 },
          ],
          outputs: [
            { name: 'gas-turbine Carnot limit', unit: '%', computation: '1 − T_exhaust / T_combustion' },
            { name: 'steam-turbine Carnot limit', unit: '%', computation: '1 − T_condenser / T_exhaust' },
            { name: 'plant First Law efficiency', unit: '%', computation: 'cascade product with realistic isentropic efficiencies' },
            { name: 'simple-cycle comparison', unit: '%', computation: 'gas turbine alone, no HRSG recovery' },
          ],
        },
      },
      retrievalPrompt:
        'A solar panel converts sunlight (electromagnetic radiation) into electrical energy at ~22% efficiency. A modern wind turbine converts the kinetic energy of moving air into electrical energy at an effective ~45% efficiency. A combined-cycle gas plant converts chemical energy in natural gas into electrical energy at ~60% efficiency. Why are these efficiencies so different — and which efficiency limits (Carnot, Betz, Shockley-Queisser, none) apply to each?',
    },
    L3: {
      body: `**1. Definition and Taxonomy**

The "forms of energy" are conceptual categories distinguishing the physical mechanism by which a system stores its energy. The categorization is operationally useful but not ontologically fundamental — at the deepest level, all energy forms reduce to two: the kinetic energy of particles in motion and the potential energy associated with the configuration of fields and forces. The intermediate categories used in engineering practice are aggregations convenient for analyzing specific transformations.

The standard taxonomy used in energy engineering and thermodynamics:

**Kinetic energy** (E_k = ½mv²) is the energy of bulk macroscopic motion. Examples: a flywheel, a wind stream, a flowing river, a rotating turbine shaft. Reducible to the kinetic energy of constituent atoms moving in concert.

**Potential energy** (E_p = mgh for gravitational; E_p = ½kx² for elastic) is the energy stored in the position of an object within a force field. Gravitational potential, elastic potential, and electromagnetic potential are the principal sub-types. Examples: water in an upper reservoir, a compressed spring, a charged capacitor.

**Thermal energy** is the kinetic and potential energy of atomic and molecular motion at the microscopic scale. Often called *internal energy* (U) in thermodynamics. Per the equipartition theorem, thermal energy per molecule scales as ½k_BT per degree of freedom, where k_B is Boltzmann's constant and T is absolute temperature. Critically: thermal energy is not a separate form but rather the disordered version of kinetic and potential energy at small scales. The Second Law's preference for higher entropy is a preference for energy distributed across many microscopic degrees of freedom rather than concentrated in macroscopic motion.

**Chemical energy** is the energy stored in the configuration of electrons in molecular bonds. Released or absorbed when bonds break and re-form. The energy density of fossil fuels (~45-55 MJ/kg for hydrocarbons) reflects the difference in bond energies between fuel + oxygen and combustion products (CO₂ + H₂O). Mechanistically, chemical energy is a sub-category of electromagnetic potential energy, expressed at the scale of electron orbitals.

**Electrical energy** is the energy associated with the configuration of charges in an electromagnetic field. In circuit-level analysis, separated into electric potential energy (across capacitors and voltage gradients) and magnetic energy (in inductors and current-carrying conductors). The energy stored in an electromagnetic field per unit volume is u = ½ε₀E² + (1/2μ₀)B², where E and B are the electric and magnetic field strengths. Electrical energy is operationally distinguished from chemical energy because in circuits it is the *bulk* configuration of charge that stores energy, not the molecular bond structure.

**Electromagnetic radiation** carries energy as photons, with E_photon = hν, where h is Planck's constant and ν is frequency. Solar radiation, blackbody emission, radio transmission, and microwave heating are all electromagnetic energy in different frequency ranges. The energy flux of solar radiation at Earth's surface (the solar constant) averages ~1,361 W/m² above the atmosphere and ~1,000 W/m² at sea level on a clear day at solar noon.

**Nuclear energy** is the energy stored in the configuration of nucleons (protons and neutrons) within atomic nuclei, governed by the strong nuclear force. Released through fission (heavy nucleus splitting) or fusion (light nuclei combining). Energy densities are ~10⁶× greater than chemical energy per unit mass — uranium-235 fission releases ~83 TJ/kg vs ~50 MJ/kg for diesel.

**Mass-energy** (E = mc²) is the rest-mass equivalent of energy per Einstein's special relativity. Operationally negligible in non-nuclear processes (chemical reactions involve mass changes of ~10⁻⁹ relative to total mass), but critical for nuclear reactions, where the released energy corresponds to a measurable mass deficit between reactants and products.

**2. Transformations Between Forms**

Energy transformations are governed by two laws and a set of constraints specific to each transformation pathway:

The **First Law** requires that the total energy across all forms be conserved through any transformation. The **Second Law** requires that entropy increase, which constrains the maximum useful work extractable from any transformation involving thermal energy. The **transformation-specific constraints** include:

- **Carnot limit** for any heat-to-work conversion: η_Carnot = 1 - T_cold/T_hot, where temperatures are absolute (Kelvin). A combined-cycle gas turbine with combustion at ~1,500°C (1,773 K) and rejection at ~30°C (303 K) has a theoretical Carnot limit of η = 1 - 303/1773 = 82.9%; actual CCGT efficiency of ~60% is well below this because of irreversibilities throughout the cycle.

- **Betz limit** for any rotor-based wind energy capture: η_Betz = 16/27 ≈ 59.3%. Modern utility-scale turbines reach 75-80% of this limit (effective ~45-47% conversion).

- **Shockley-Queisser limit** for single-junction photovoltaics: ~33% theoretical maximum for terrestrial sunlight. Multijunction cells exceed this by stacking junctions tuned to different parts of the spectrum; commercial monocrystalline silicon achieves ~22-26%.

- **Round-trip efficiency** for storage systems: lithium-ion batteries 85-95%; pumped hydro 70-85%; hydrogen electrolysis-fuel-cell ~30-40%; compressed air 50-70%. These figures reflect cumulative losses across charge, storage, and discharge phases.

**3. The Energy Cascade in Power Generation**

The standard thermal power generation cascade illustrates how multiple forms transform sequentially, with exergy destroyed at each step:

*Combustion (chemical → thermal):* A coal or natural gas plant combusts fuel, converting chemical bond energy to thermal energy in flue gases at ~1,500-1,800 K. Combustion efficiency is ~95-99%, but most exergy destruction occurs here because of the large temperature gradient between flame and working fluid.

*Heat transfer (thermal → thermal):* Heat transfers from flue gas to water/steam in a boiler. First Law efficiency is ~85-90% (some heat lost up the stack); Second Law efficiency is much lower because the high-temperature heat is degraded to lower-temperature steam at ~600°C.

*Expansion (thermal → kinetic):* High-pressure steam expands through a turbine, accelerating rotor blades. Isentropic efficiency of modern steam turbines is ~85-92%. The Carnot limit applies between steam inlet temperature and condenser temperature.

*Generation (kinetic → electrical):* The turbine shaft drives an electromagnetic generator. Generator efficiency is typically ~98-99% — the highest-efficiency step in the cascade.

*Transmission (electrical → electrical):* Electrical energy moves through transformers and high-voltage transmission lines. Aggregate transmission and distribution losses run ~5-7% in the US grid, with ~2-3% in transmission and ~3-5% in distribution.

*End use (electrical → various):* At the load, electrical energy becomes heat (resistance heating), motion (motors), light (LEDs and incandescents), or chemical energy (electrolysis, battery charging). End-use efficiencies range from ~5% (incandescent bulbs) to ~95% (LEDs, induction motors).

The total wall-plug-to-useful-work efficiency for a typical thermal generation chain is ~25-35% — meaning ~65-75% of the original chemical energy in the fuel is lost as thermal exergy throughout the cascade. This is the foundation of the case for direct-electrification end uses (heat pumps, EVs) over combustion: avoiding the early thermal-stage exergy destruction can deliver more useful work per unit of primary energy.

**4. Operational Relevance to Energy Markets**

The form taxonomy maps directly onto market structure:

- **Chemical energy markets** (natural gas, coal, oil, refined products) trade fuels measured in energy units (MMBtu, barrel, ton), with prices set by supply/demand for specific commodity grades and delivery points.

- **Electrical energy markets** (RTO/ISO wholesale energy markets, retail electricity) trade delivered electricity in MWh, with locational marginal pricing reflecting transmission constraints.

- **Capacity markets** trade *power* (MW commitments to be available), reflecting the system's need for reliable power capacity independent of energy delivered.

- **Ancillary services markets** trade specific physical capabilities — frequency regulation, spinning reserves, voltage support — which are forms of *power* control rather than energy delivery.

- **Renewable energy credits (RECs)** trade the *attribute* of energy having been produced from renewable sources, decoupled from the underlying electricity. A REC is a tradable claim that one MWh of generation came from a qualifying renewable resource.

- **Carbon markets** trade emissions associated with the transformation of chemical energy into other forms, pricing the externality of CO₂ release during fossil combustion.

A practitioner who understands the form taxonomy understands why these markets exist as separate products: each prices a distinct physical or attribute dimension of the energy system, and the boundaries between markets reflect boundaries between physical phenomena.`,
      primarySources: [
        { citation: 'Çengel, Y. A., & Boles, M. A. (2019). Thermodynamics: An Engineering Approach (9th ed.). McGraw-Hill.', type: 'book' },
        { citation: 'Bejan, A. (2016). Advanced Engineering Thermodynamics (4th ed.). Wiley.', type: 'book' },
        { citation: 'Smil, V. (2017). Energy and Civilization: A History. MIT Press.', type: 'book' },
        { citation: 'MacKay, D. J. C. (2008). Sustainable Energy — Without the Hot Air. UIT Cambridge.', type: 'book' },
        { citation: 'Shockley, W., & Queisser, H. J. (1961). "Detailed balance limit of efficiency of p-n junction solar cells." Journal of Applied Physics.', type: 'paper' },
      ],
    },
  },
};
