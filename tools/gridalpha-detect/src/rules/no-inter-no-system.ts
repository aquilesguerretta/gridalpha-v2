import { stubRule } from './_stub.js';

export default stubRule(
  'no-inter-no-system',
  'P0',
  'Terminal surfaces must not declare Inter / system-ui as the primary face. Geist Mono only.',
  'Default Inter or system-ui typography',
);
