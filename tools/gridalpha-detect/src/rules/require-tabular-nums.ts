import { stubRule } from './_stub.js';

export default stubRule(
  'require-tabular-nums',
  'P1',
  'Numeric data elements must declare fontVariantNumeric: tabular-nums.',
  'Missing tabular-nums on data values',
);
