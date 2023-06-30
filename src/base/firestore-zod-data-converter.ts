import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore'

import type { DocumentOutput, ZodTypeDocumentData } from './types'

export const firestoreZodDataConverter = <Z extends ZodTypeDocumentData>(
  zod: Z
): FirestoreDataConverter<DocumentOutput<Z>> => ({
  toFirestore: ({ _id, ...documentData }) => documentData,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => ({
    _id: snapshot.id,
    ...zod.parse(snapshot.data()),
  }),
})
