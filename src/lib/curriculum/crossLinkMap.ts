// SCRIBE — Canonical-term → entry-slug map for cross-linking.
// CrossLinkResolver scans rendered text for these terms and wraps matches
// in a Link to the target entry. Keys are lowercase for case-insensitive
// matching; the resolver preserves the original casing of the matched text.

export const CROSS_LINK_MAP: Record<string, string> = {
  'first law': 'what-is-energy',
  'first law of thermodynamics': 'what-is-energy',
  'second law': 'entropy-and-second-law',
  'second law of thermodynamics': 'entropy-and-second-law',
  'entropy': 'entropy-and-second-law',
  'exergy': 'entropy-and-second-law',
  'carnot': 'entropy-and-second-law',
  'carnot limit': 'entropy-and-second-law',
  'capacity factor': 'power-vs-energy',
  'heat rate': 'efficiency',
  'joule': 'units-and-orders-of-magnitude',
  'kilowatt-hour': 'units-and-orders-of-magnitude',
  'kwh': 'units-and-orders-of-magnitude',
  'mmbtu': 'units-and-orders-of-magnitude',
  'btu': 'units-and-orders-of-magnitude',
  'mwh': 'units-and-orders-of-magnitude',
  'forms of energy': 'forms-of-energy',
  'kinetic energy': 'forms-of-energy',
  'potential energy': 'forms-of-energy',
  'thermal energy': 'forms-of-energy',
  'chemical energy': 'forms-of-energy',
  'electrical energy': 'forms-of-energy',
};
