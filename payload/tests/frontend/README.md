# Frontend test placeholder (TASK-010 / QA-01)

This directory holds frontend (jsdom-environment) tests that exercise the
Better Justice static-site frontend. Empty today - filled by TASK-075
(a11y / contrast sweep) and any future BJ frontend logic tests.

## Path alias

Vitest's root `vitest.config.ts` defines:

```ts
'@bj-frontend': path.resolve(ROOT, '../../BetterJustice/js')
```

So a frontend test imports BJ static-site source as:

```ts
import { something } from '@bj-frontend/form-validation'
import { contrastRatio } from '../helpers/contrast'
```

## Workspace assumption

The alias resolves the BJ static-site repo as a sibling of `skeleton-crew/`:

```
~/Documents/GitHub/
├── skeleton-crew/
│   └── payload/        <- this monorepo
└── BetterJustice/      <- BJ static-site sibling
    └── js/
```

CI (TASK-050) is responsible for arranging the same layout (sibling
checkout) or providing an equivalent override. Local dev satisfies it
naturally.

## Run

```sh
npm run test:frontend
```

`passWithNoTests: true` is set, so the script exits 0 when this directory
is empty.
