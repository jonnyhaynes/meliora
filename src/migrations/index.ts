import * as migration_20261001_060248_initial from './20261001_060248_initial';

export const migrations = [
  {
    up: migration_20261001_060248_initial.up,
    down: migration_20261001_060248_initial.down,
    name: '20261001_060248_initial'
  },
];
