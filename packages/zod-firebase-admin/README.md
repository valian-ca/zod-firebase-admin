# zod-firebase-admin

[![npm version](https://badge.fury.io/js/zod-firebase-admin.svg)](https://badge.fury.io/js/zod-firebase-admin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/valian-ca/zod-firebase-admin/actions/workflows/pull-request.yml/badge.svg)](https://github.com/valian-ca/zod-firebase-admin/actions/workflows/pull-request.yml)
[![codecov](https://codecov.io/gh/valian-ca/zod-firebase-admin/branch/main/graph/badge.svg?flag=firebase-admin)](https://codecov.io/gh/valian-ca/zod-firebase-admin)

Type-safe Firestore collections and documents using [Zod](https://zod.dev/) schemas for the [Firebase Admin SDK](https://github.com/firebase/firebase-admin-node).

## Installation

Peer dependencies: `firebase-admin` and `zod`.

```bash
npm install zod-firebase-admin zod firebase-admin
```

Node.js >= 22 is recommended (matches the library engines field). ESM and CJS bundles are provided.

## Usage

### Basic Setup

First, define your document schemas using Zod:

```typescript
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase-admin'

// Define your document schemas
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
  tags: z.array(z.string()).optional().default([]),
})

const PostSchema = z.object({
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  publishedAt: z.date(),
  likes: z.number().default(0),
})

// Define your collection schema
const schema = {
  users: {
    zod: UserSchema,
  },
  posts: {
    zod: PostSchema,
  },
} as const

// Build type-safe collections
const collections = collectionsBuilder(schema)
```

### CRUD Operations

```typescript
// Create a new user
const userRef = await collections.users.add({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
})

// Get a user by ID
const user = await collections.users.findByIdOrThrow(userRef.id)
console.log(user._id, user.name, user.email) // Fully typed!

// Update a user
await collections.users.update(userRef.id, {
  age: 31,
})

// Query users
const adults = await collections.users.findMany({
  name: 'adults',
  where: [['age', '>=', 18]],
})

// Delete a user
await collections.users.delete(userRef.id)
```

### Fallback reads

Return a document if it exists or a validated fallback when it does not.

```typescript
// Multi-document collection: findByIdWithFallback(id, fallback)
const post = await collections.posts.findByIdWithFallback('post123', {
  title: 'Untitled',
  content: '',
  authorId: 'anonymous',
  publishedAt: new Date(),
  likes: 0,
})
// If the document exists, you get its data; otherwise you get:
// { _id: 'post123', title: 'Untitled', content: '', ... }

// Single-document collection: findWithFallback(fallback)
const userId = 'user123'
const profile = await collections.users(userId).profile.findWithFallback({
  bio: 'This user has not set up a bio yet',
  avatar: undefined,
})
// If the document does not exist, you get { _id: 'profile', ...fallback }
```

When your schema validates document IDs (includeDocumentIdForZod), the fallback is validated
with the injected `_id`:

```typescript
const UserWithIdSchema = z.discriminatedUnion('_id', [
  z.object({
    _id: z.literal('admin'),
    name: z.string(),
    role: z.literal('administrator'),
  }),
  z.object({
    _id: z.string(),
    name: z.string(),
    role: z.literal('user'),
  }),
])

const schema = {
  users: {
    zod: UserWithIdSchema,
    includeDocumentIdForZod: true,
  },
} as const

const collections = collectionsBuilder(schema)

// Fallback excludes _id; it will be injected and validated by Zod
const admin = await collections.users.findByIdWithFallback('admin', {
  name: 'System',
  role: 'administrator',
})
```

### Sub-Collections

You can define nested sub-collections with full type safety:

```typescript
const schema = {
  users: {
    zod: UserSchema,
    posts: {
      zod: PostSchema,
      // Sub-sub-collections
      comments: {
        zod: z.object({
          text: z.string(),
          authorId: z.string(),
          createdAt: z.date(),
        }),
      },
    },
    // Single document sub-collection
    profile: {
      zod: z.object({
        bio: z.string(),
        avatar: z.string().optional(),
      }),
      singleDocumentKey: 'profile', // Fixed document ID
    },
  },
} as const

const collections = collectionsBuilder(schema)

// Working with sub-collections
const userId = 'user123'

// Add a post to user's posts sub-collection
const postRef = await collections.users(userId).posts.add({
  title: 'My First Post',
  content: 'Hello world!',
  authorId: userId,
  publishedAt: new Date(),
})

// Add a comment to the post
await collections.users(userId).posts(postRef.id).comments.add({
  text: 'Great post!',
  authorId: 'commenter123',
  createdAt: new Date(),
})

// Work with single document sub-collection
await collections.users(userId).profile.set({
  bio: 'Software developer',
  avatar: 'https://example.com/avatar.jpg',
})

const profile = await collections.users(userId).profile.findOrThrow()
```

### Collection Group Queries

Query across all sub-collections of the same type:

```typescript
// Count all posts across all users
const postCount = await collections.users.posts.group.count({
  name: 'all-posts',
})

// Count all comments across all posts
const commentCount = await collections.users.posts.comments.group.count({
  name: 'all-comments',
})
```

### Advanced Schema Options

#### Custom Error Handling

```typescript
const collections = collectionsBuilder(schema, {
  zodErrorHandler: (error, snapshot) => {
    console.error(`Validation error for document ${snapshot.id}:`, error)
    return new Error(`Invalid document: ${snapshot.id}`)
  },
})
```

#### Data Transformation

Handle Firebase-specific data types like Timestamps:

```typescript
import { Timestamp } from 'firebase-admin/firestore'

const collections = collectionsBuilder(schema, {
  snapshotDataConverter: (snapshot) => {
    const data = snapshot.data()
    // Convert Firestore Timestamps to JavaScript Dates
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value instanceof Timestamp ? value.toDate() : value]),
    )
  },
})
```

#### Document ID Validation

Include document IDs in Zod validation:

```typescript
const UserWithIdSchema = z.discriminatedUnion('_id', [
  z.object({
    _id: z.literal('admin'),
    name: z.string(),
    role: z.literal('administrator'),
  }),
  z.object({
    _id: z.string(),
    name: z.string(),
    role: z.literal('user'),
  }),
])

const schema = {
  users: {
    zod: UserWithIdSchema,
    includeDocumentIdForZod: true,
  },
} as const
```

#### Read-Only Documents

Mark collections as read-only to prevent accidental modifications:

```typescript
const schema = {
  config: {
    zod: ConfigSchema,
    readonlyDocuments: true,
  },
} as const

// This collection will only have read operations available
const collections = collectionsBuilder(schema)
```

### Transactions and Batches

Work with Firebase Admin transactions and batch writes:

```typescript
import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

// Using transactions
await db.runTransaction(async (transaction) => {
  const userSnap = await transaction.get(collections.users.read.doc('user123'))
  if (!userSnap.exists) return
  transaction.update(collections.users.write.doc('user123'), { age: FieldValue.increment(1) })
})

// Using batch writes
const batch = db.batch()
batch.create(collections.posts.write.doc('post123'), {
  title: 'Batch Post',
  authorId: 'user123',
})
await batch.commit()
```

### Firebase Admin SDK Features

Take advantage of Firebase Admin SDK server-side capabilities:

```typescript
// Precondition checks with last update time
const user = await collections.users.findByIdOrThrow('user123', {
  _updateTime: true,
})

await collections.users.update(
  'user123',
  {
    name: 'Updated Name',
  },
  {
    lastUpdateTime: user._updateTime, // Prevents concurrent modifications
  },
)

// Server timestamps and field values
import { FieldValue } from 'firebase-admin/firestore'

await collections.users.update('user123', {
  lastLoginAt: FieldValue.serverTimestamp(),
  loginCount: FieldValue.increment(1),
})
```

### Query Features

#### Advanced Queries

```typescript
// Complex queries with multiple conditions
const recentPopularPosts = await collections.posts.findMany({
  where: [
    ['publishedAt', '>=', new Date('2024-01-01')],
    ['likes', '>=', 100],
  ],
  orderBy: [['likes', 'desc']],
  limit: 10,
})

// Prepared queries for reuse
const popularPrepared = collections.posts.prepare({
  name: 'popular',
  where: [['likes', '>=', 100]],
  orderBy: [['likes', 'desc']],
})
const snapshot = await popularPrepared.get()
const results = snapshot.docs.map((d) => d.data())
```

#### QuerySpecification

The `QuerySpecification` accepted by `prepare`, `query`, `find*`, and `count` supports:

- **name**: A label for your query, used in error messages
- **where?**: Either an array of tuples `[field, op, value]` or an Admin `Filter`
  - Tuples: [Simple queries](https://firebase.google.com/docs/firestore/query-data/queries)
  - Filters: [Admin Filter API](https://cloud.google.com/nodejs/docs/reference/firestore/latest/Filter)
- **orderBy?**: Array of tuples `[field]` or `[field, 'asc' | 'desc']`
  - Docs: [Order and limit data](https://firebase.google.com/docs/firestore/query-data/order-limit-data)
- **limit?**: Maximum number of results
  - Docs: [Order and limit data](https://firebase.google.com/docs/firestore/query-data/order-limit-data)
- **limitToLast?**: Returns the last N results; requires a matching `orderBy`
  - Docs: [Order and limit data](https://firebase.google.com/docs/firestore/query-data/order-limit-data)
- **offset?**: Skip the first N results
  - Docs: [Pagination with offset](https://cloud.google.com/nodejs/docs/reference/firestore/latest/Query#offset)
- **startAt?** | **startAfter?** | **endAt?** | **endBefore?**: Cursor boundaries, each can be a document snapshot or an array of field values
  - Arrays are forwarded as individual arguments (e.g. `startAt(...values)`). Ensure the order matches your `orderBy`
  - Docs: [Query cursors](https://firebase.google.com/docs/firestore/query-data/query-cursors)

Related:

- Collection group queries: [Guide](https://firebase.google.com/docs/firestore/query-data/queries#collection-group-query)
- Aggregations via Admin SDK `count()`: [Admin Query.count](https://cloud.google.com/nodejs/docs/reference/firestore/latest/Query#count)

#### Metadata Access

Access Firestore metadata when needed:

```typescript
// Get document with metadata
const userWithMeta = await collections.users.findByIdOrThrow(userId, {
  _createTime: true,
  _updateTime: true,
})

console.log(userWithMeta._createTime, userWithMeta._updateTime)
```

## API Reference

### Collection Methods

- `add(data)` - Add a new document with auto-generated ID
- `create(id, data)` - Create a document with specific ID
- `set(id, data, options?)` - Set document data (overwrites)
- `update(id, data, options?)` - Update document fields
- `delete(id, options?)` - Delete a document
- `findById(id, options?)` - Find document by ID (returns undefined if not found)
- `findByIdOrThrow(id, options?)` - Find document by ID (throws if not found)
- `findMany(query)` - Query multiple documents
- `count(query)` - Count documents matching query
- `prepare(query)` - Prepare a query for reuse

### Sub-Collection Access

- `collection(parentId).subCollection` - Access sub-collection
- `collection.subCollection.group` - Access collection group

### Configuration Options

- `zodErrorHandler` - Custom error handling for validation failures
- `snapshotDataConverter` - Transform document data before validation
- `includeDocumentIdForZod` - Include document ID in Zod validation
- `readonlyDocuments` - Mark collection as read-only
- `singleDocumentKey` - Create single-document sub-collections

### Operation Options

- `transaction` - Run operation within a transaction
- `batch` - Add operation to a batch write
- `lastUpdateTime` - Precondition check for updates
- `_createTime` / `_updateTime` - Include metadata in results

## Firebase Admin vs Web SDK

This package is designed for server-side applications using the Firebase Admin SDK. Key differences from the web SDK version (`zod-firebase`):

- **Server Environment**: Runs in Node.js with admin privileges
- **No Authentication**: Admin SDK bypasses Firebase Auth
- **Transactions**: Full transaction support with preconditions
- **Batch Operations**: Atomic batch writes
- **Server Timestamps**: Access to server-side timestamp operations
- **Metadata Access**: Read/write times and other document metadata

For client-side applications, use [`zod-firebase`](https://www.npmjs.com/package/zod-firebase) instead.

## License

MIT

## Contributing

See the main repository at [valian-ca/zod-firebase-admin](https://github.com/valian-ca/zod-firebase-admin) for contributing guidelines.
