import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'
import { collectionsBuilder } from '../src'

const RequestZod = z.object({
  status: z.enum(['draft', 'completed']),
  team: z.string().array().optional().default([]),
  createdAt: z.instanceof(Timestamp).transform((t) => t.toDate()),
})

const EventZod = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('creation'),
    value: z.string(),
    creator: z.string(),
  }),
  z.object({
    type: z.literal('deletion'),
    timestamp: z.instanceof(Timestamp).transform((t) => t.toDate()),
  }),
])

const SingleDocumentExampleZod = z.object({
  value: z.number().optional(),
})

const schema = {
  requests: {
    zod: RequestZod,
    events: { zod: EventZod },
    single: {
      zod: SingleDocumentExampleZod,
      singleDocumentKey: '_',
    },
  },
}

export const collections = collectionsBuilder(schema, { getFirestore })

async function test() {
  await collections.requests.write.collection().add({
    status: 'completed',
    createdAt: Timestamp.now(),
  })

  const data = await collections.requests.findByIdOrThrow('test')
  data._id
  data.status
  data.createdAt

  const snapshot = await collections.requests('test').events.read.doc('test').get()
  const event = snapshot.data()

  if (event?.type === 'deletion') {
    event.timestamp
  }

  const tempData = await collections.requests('test').single.findOrThrow()
}
