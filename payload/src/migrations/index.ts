import * as migration_20260412_002508_initial from './20260412_002508_initial';
import * as migration_20260502_183523_add_shop_collections from './20260502_183523_add_shop_collections';

export const migrations = [
  {
    up: migration_20260412_002508_initial.up,
    down: migration_20260412_002508_initial.down,
    name: '20260412_002508_initial',
  },
  {
    up: migration_20260502_183523_add_shop_collections.up,
    down: migration_20260502_183523_add_shop_collections.down,
    name: '20260502_183523_add_shop_collections'
  },
];
