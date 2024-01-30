import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'

import type { DocumentOutput, ZodTypeDocumentData } from './types'
import type { ZodErrorHandler } from './zod-error-handler'

export type FirestoreZodDataConverterOptions = {
  readonly includeDocumentIdForZod?: boolean
  readonly zodErrorHandler?: ZodErrorHandler
  readonly snapshotDataConverter?: (snapshot: QueryDocumentSnapshot) => DocumentData
}

export const firestoreZodDataConverter = <Z extends ZodTypeDocumentData>(
  zod: Z,
  options?: FirestoreZodDataConverterOptions,
): FirestoreDataConverter<DocumentOutput<Z>> => ({
  toFirestore: ({ _id, _metadata, ...documentData }) => documentData,
  fromFirestore: (snapshot) => {
    const data = options?.snapshotDataConverter ? options.snapshotDataConverter(snapshot) : snapshot.data()
    const output = zod.safeParse(
      options?.includeDocumentIdForZod
        ? {
            // _id can be used in the zod parse for discriminatedUnion
            _id: snapshot.id,
            ...data,
          }
        : data,
    )
    if (!output.success) throw options?.zodErrorHandler ? options.zodErrorHandler(output.error, snapshot) : output.error
    return {
      // Must be added again because zod.parse might remove it
      _id: snapshot.id,
      _metadata: snapshot.metadata,
      ...output.data,
    }
  },
})
