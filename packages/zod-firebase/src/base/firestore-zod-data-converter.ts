import { type DocumentData, type FirestoreDataConverter, type QueryDocumentSnapshot } from '@firebase/firestore'

import { omitMetadata, type WithFieldValueAndMetadata } from './firestore-omit-meta-data-converter'
import { type DocumentInput, type DocumentOutput, type MetaOutputOptions, type ZodTypeDocumentData } from './types'
import { type ZodErrorHandler } from './zod-error-handler'

export interface FirestoreZodDataConverterOptions {
  readonly includeDocumentIdForZod?: boolean
  readonly zodErrorHandler?: ZodErrorHandler
  readonly snapshotDataConverter?: (snapshot: QueryDocumentSnapshot) => DocumentData
}

export const firestoreZodDataConverter = <
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
>(
  zod: Z,
  outputOptions?: OutputOptions,
  options?: FirestoreZodDataConverterOptions,
): FirestoreDataConverter<AppModelType, DbModelType> => ({
  toFirestore: (modelObject) =>
    omitMetadata<AppModelType, DbModelType>(modelObject as WithFieldValueAndMetadata<AppModelType>),
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
      ...(outputOptions?._id !== false ? { _id: snapshot.id } : {}),
      ...(outputOptions?._metadata ? { _metadata: snapshot.metadata } : {}),
      ...output.data,
    } as AppModelType
  },
})
