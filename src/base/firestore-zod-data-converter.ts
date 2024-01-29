import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore'

import type { DocumentOutput, ZodTypeDocumentData } from './types'
import type { ZodErrorHandler } from './zod-error-handler'

export type FirestoreZodDataConverterOptions = {
  readonly includeDocumentIdForZod?: boolean
  readonly zodErrorHandler?: ZodErrorHandler
}

export const firestoreZodDataConverter = <Z extends ZodTypeDocumentData>(
  zod: Z,
  options?: FirestoreZodDataConverterOptions,
): FirestoreDataConverter<DocumentOutput<Z>> => ({
  toFirestore: ({ _id, _readTime, _createTime, _updateTime, ...documentData }) => documentData,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const output = zod.safeParse(
      options?.includeDocumentIdForZod
        ? {
            // _id can be used in the zod parse for discriminatedUnion
            _id: snapshot.id,
            ...snapshot.data(),
          }
        : snapshot.data(),
    )
    if (!output.success) throw options?.zodErrorHandler ? options.zodErrorHandler(output.error, snapshot) : output.error
    return {
      // Must be added again because zod.parse might remove it
      _id: snapshot.id,
      _readTime: snapshot.readTime,
      _createTime: snapshot.createTime,
      _updateTime: snapshot.updateTime,
      ...output.data,
    }
  },
})
