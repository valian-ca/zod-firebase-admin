# zod-firebase

[![npm version](https://badge.fury.io/js/zod-firebase.svg)](https://badge.fury.io/js/zod-firebase)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/valian-ca/zod-firebase-admin/actions/workflows/pull-request.yml/badge.svg)](https://github.com/valian-ca/zod-firebase-admin/actions/workflows/pull-request.yml)
[![codecov](https://codecov.io/gh/valian-ca/zod-firebase-admin/branch/main/graph/badge.svg?flag=firebase)](https://codecov.io/gh/valian-ca/zod-firebase-admin)

Type-safe Firestore collections and documents using [Zod](https://zod.dev/) schemas for the [Firebase Web SDK](https://github.com/firebase/firebase-js-sdk).

## Installation

Peer dependencies: `firebase` and `zod`.

```bash
npm install zod-firebase zod firebase
```

## Usage

### Basic Setup

First, define your document schemas using Zod:

```typescript
import { z } from 'zod'
import { collectionsBuilder } from 'zod-firebase'

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
// Find all posts across all users
const allPosts = await collections.users.posts.group.findMany({
  name: 'posts-since-2024',
  where: [['publishedAt', '>=', new Date('2024-01-01')]],
})

// Aggregate with the Firestore Web SDK (e.g. count)
import { count } from 'firebase/firestore'
const totals = await collections.users.posts.comments.group.aggregateFromServer(
  { name: 'all-comments' },
  { total: count() },
)
console.log(totals.total)
```

### Advanced Options

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
import { Timestamp } from 'firebase/firestore'

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

### Query Features

#### Advanced Queries

```typescript
// Complex queries with multiple conditions
const recentPopularPosts = await collections.posts.findMany({
  name: 'recent-popular',
  where: [
    ['publishedAt', '>=', new Date('2024-01-01')],
    ['likes', '>=', 100],
  ],
  orderBy: [['likes', 'desc']],
  limit: 10,
})

// Prepare once, execute with the Web SDK
import { getDocs } from 'firebase/firestore'
const popularPrepared = collections.posts.prepare({
  name: 'popular',
  where: [['likes', '>=', 100]],
  orderBy: [['likes', 'desc']],
})
const snapshot = await getDocs(popularPrepared)
const results = snapshot.docs.map((d) => d.data())
```

#### Metadata Access

Access Firestore metadata when needed:

```typescript
// Get document with metadata
const userWithMeta = await collections.users.findByIdOrThrow(userId, {
  _metadata: true,
})

console.log(userWithMeta._metadata?.hasPendingWrites)
```

## API Reference

### Collection Methods

- `add(data)` - Add a new document
- `set(id, data, options?)` - Set document data (create or overwrite)
- `update(id, data, options?)` - Update document fields
- `delete(id)` - Delete a document
- `findById(id, options?)` - Find document by ID (returns undefined if not found)
- `findByIdOrThrow(id, options?)` - Find document by ID (throws if not found)
- `prepare(query)` - Prepare a typed query for reuse
- `query(query)` - Execute a query and return a QuerySnapshot
- `findMany(query)` - Query multiple documents and return data[]
- `aggregateFromServer(query, aggregateSpec)` - Server-side aggregates (e.g. count)

### Sub-Collection Access

- `collection(parentId).subCollection` - Access sub-collection
- `collection.subCollection.group` - Access collection group

### Configuration Options

- `zodErrorHandler` - Custom error handling for validation failures
- `snapshotDataConverter` - Transform document data before validation
- `includeDocumentIdForZod` - Include document ID in Zod validation
- `readonlyDocuments` - Mark collection as read-only
- `singleDocumentKey` - Create single-document sub-collections

## License

MIT

## Contributing

See the main repository at [valian-ca/zod-firebase-admin](https://github.com/valian-ca/zod-firebase-admin) for contributing guidelines.
