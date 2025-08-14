# zod firestore schema monorepo

Type-safe Firestore collections and documents powered by [Zod](https://zod.dev/).

This monorepo contains two npm packages:

- [zod-firebase-admin](packages/zod-firebase-admin/README.md) — for server-side apps using the [Firebase Admin SDK](https://github.com/firebase/firebase-admin-node)
- [zod-firebase](packages/zod-firebase/README.md) — for client-side apps using the [Firebase Web SDK](https://github.com/firebase/firebase-js-sdk)

Both packages provide the same ergonomic developer experience: define your data once with Zod, get strongly-typed reads/writes, sub-collections, and collection-group queries.

## Packages

- [packages/zod-firebase-admin](packages/zod-firebase-admin/README.md) — Admin SDK (Node.js). Supports transactions, batch writes, preconditions, and admin metadata fields
- [packages/zod-firebase](packages/zod-firebase/README.md) — Web SDK (browser/node). Supports aggregate queries via `aggregateFromServer`

See each package README for installation, usage, and API reference.

## Development

Requirements: Node.js 22+, pnpm.

Common scripts (run at the repo root):

```bash
pnpm i
pnpm -r build
pnpm -r test
pnpm -r type-check
```

## License

MIT
