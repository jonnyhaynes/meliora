import * as migration_20261001_072744_initial from './20261001_072744_initial';

export const migrations = [
  {
    up: migration_20261001_072744_initial.up,
    down: migration_20261001_072744_initial.down,
    name: '20261001_072744_initial'
  },
];
