import { stubRule } from './_stub.js';

export default stubRule(
  'no-gradient-text',
  'P0',
  'background-clip: text + gradient fill is a marketing convention. Tokens carry emphasis.',
  'Gradient text for emphasis',
);
