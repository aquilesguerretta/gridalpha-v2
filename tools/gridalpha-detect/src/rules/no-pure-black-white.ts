import { stubRule } from './_stub.js';

export default stubRule(
  'no-pure-black-white',
  'P0',
  'No #000 or #FFF — use the four-tier bg/text tokens.',
  'Pure black #000000 or pure white #FFFFFF',
);
