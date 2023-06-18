<!-- markdownlint-disable -->

[![npm version](http://img.shields.io/npm/v/@valian/zod-firebase-admin.svg?style=flat)](https://npmjs.org/package/zod-firebase-admin 'View this project on npm')
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

<!-- markdownlint-restore -->

# zod-firebase-admin

## Install

```sh
yarn add zod-firebase-admin firebase-admin
```

or

```sh
npm install zod-firebase-admin firebase-admin
```

## zod

Each collection is typed with a [zod schema](https://zod.dev/).

## configuration

Define a schema declaring each firestore collection and sub-collection. For example, given the following collections:

- `requests`
  with the following sub-collections
  - `events`
  - `extended`
- `activities`

Define a schema that specifies the `zod` for each collection and then construct a `collections` object
with `collectionsBuilder`

```ts
import { collectionsBuilder } from 'zod-firebase-admin'

const schema = {
  requests: {
    zod: RequestZod,
    events: {
      zod: EventZod
    },
    extended: {
      zod: ExtendedRequestZod,
      singleDocumentKey: '_',
    },
  },
  activities: {
    zod: ActvitiyZod,
  }
}

export const collections = collectionsBuilder(schema)
```

## Reading Document Data

#### Example

given the `requests` document id `5oJzgbNMhGg2rcLvjF2A`, we can get the document data with `findById`
or `findByIdOrThrow`

```ts
const request = await collections.requests.findByIdOrThrow('5oJzgbNMhGg2rcLvjF2A')
```

### sub-collections

#### Example

given the `events` document id `qgLrVUG9HlERAsLzRr9n`, we can get the document data with `findById` or `findByIdOrThrow`

```ts
const event = await collections.requests('5oJzgbNMhGg2rcLvjF2A').events.findById('qgLrVUG9HlERAsLzRr9n')
```

## Query Collection

The following query methods are provided

- `count`
- `findMany`
- `findUnique`
- `findUniqueOrThrow`
- `findFirst`
- `findFirstOrThrow`

#### Example

```ts
const request = await collections.requests.findFirst({
  name: 'Most recent active request',
  where: [['providerId', '==', 'test'], ['active', '==', true]],
  orderBy: [['createdAt', 'desc']],
  limit: 1
})
```

## Update Documents

#### Example

```ts
await collections.requests.write.collection().add({
  status: 'completed',
  createdAt: Timestamp.now(),
})
```
