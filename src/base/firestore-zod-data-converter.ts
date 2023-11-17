import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore'

import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreZodDataConverter = <Z extends ZodTypeDocumentData>(
  zod: Z,
): FirestoreDataConverter<DocumentOutput<Z>> => ({
  toFirestore: ({ _id, ...documentData }) => documentData,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => ({
    // Must be added again because zod.parse might remove it
    _id: snapshot.id,
    ...zod.parse({
      // _id can be used in the zod parse for discriminatedUnion
      _id: snapshot.id,
      ...snapshot.data(),
    }),
  }),
})
