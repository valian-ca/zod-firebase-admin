import {
  type DocumentData,
  type PartialWithFieldValue,
  type Precondition,
  type SetOptions,
  type UpdateData,
  type WithFieldValue,
  type WriteResult,
} from 'firebase-admin/firestore'
import { type Except } from 'type-fest'

import { type MetaOutputOptions } from '../../base'
import {
  type CollectionSchema,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreFactory,
  type SchemaWriteDocumentReference,
} from '../../schema'

export type SchemaFallbackValue<
  TCollectionSchema extends CollectionSchema,
  TDocumentId extends string = string,
> = TCollectionSchema extends { includeDocumentIdForZod: true }
  ? Except<Extract<SchemaDocumentInput<TCollectionSchema>, { _id: TDocumentId }>, '_id'>
  : SchemaDocumentInput<TCollectionSchema>

export type SchemaFallbackOutputDocument<
  TCollectionSchema extends CollectionSchema,
  TDocumentId extends string = string,
> = TCollectionSchema extends { includeDocumentIdForZod: true }
  ? Except<Extract<SchemaDocumentOutput<TCollectionSchema>, { _id: TDocumentId }>, '_id'>
  : SchemaDocumentOutput<TCollectionSchema>

export interface MultiDocumentCollectionFactory<TCollectionSchema extends CollectionSchema>
  extends SchemaFirestoreFactory<TCollectionSchema> {
  findById<Options extends MetaOutputOptions>(
    this: void,
    id: string,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options> | undefined>

  findByIdOrThrow<Options extends MetaOutputOptions>(
    this: void,
    id: string,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options>>

  findByIdWithFallback<TDocumentId extends string>(
    this: void,
    id: TDocumentId,
    fallback: SchemaFallbackValue<TCollectionSchema, TDocumentId>,
  ): Promise<SchemaFallbackOutputDocument<TCollectionSchema, TDocumentId>>

  add(
    this: void,
    data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
  ): Promise<SchemaWriteDocumentReference<TCollectionSchema>>

  create(this: void, id: string, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<WriteResult>

  set(this: void, id: string, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<WriteResult>

  set(
    this: void,
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    options: SetOptions,
  ): Promise<WriteResult>

  update(
    this: void,
    id: string,
    data: UpdateData<SchemaDocumentInput<TCollectionSchema>>,
    precondition?: Precondition,
  ): Promise<WriteResult>

  delete(this: void, id: string, precondition?: Precondition): Promise<WriteResult>
}

export const multiDocumentCollectionFactory = <TCollectionSchema extends CollectionSchema>(
  firestoreFactory: SchemaFirestoreFactory<TCollectionSchema>,
  schema: TCollectionSchema,
): MultiDocumentCollectionFactory<TCollectionSchema> => ({
  ...firestoreFactory,
  findById: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
    const doc = await firestoreFactory.read.doc(id, options).get()
    return doc.data()
  },
  findByIdOrThrow: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
    const reference = firestoreFactory.read.doc(id, options)
    const doc = await reference.get()
    if (!doc.exists) {
      throw new Error(`Document ${reference.path} not found`)
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return doc.data()!
  },
  findByIdWithFallback: async <TDocumentId extends string>(
    id: TDocumentId,
    fallback: SchemaFallbackValue<TCollectionSchema, TDocumentId>,
  ) => {
    const doc = await firestoreFactory.read.doc(id).get()
    if (doc.exists) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return doc.data()! as SchemaFallbackOutputDocument<TCollectionSchema, TDocumentId>
    }
    if (schema.includeDocumentIdForZod) {
      return schema.zod.parse({
        _id: id,
        ...(fallback as DocumentData),
      }) as SchemaFallbackOutputDocument<TCollectionSchema, TDocumentId>
    }
    return {
      _id: id,
      ...schema.zod.parse(fallback),
    } as SchemaFallbackOutputDocument<TCollectionSchema, TDocumentId>
  },
  add: async (data) => firestoreFactory.write.collection().add(data),
  create: async (id, data) => firestoreFactory.write.doc(id).create(data),
  set: async (
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    setOptions?: SetOptions,
  ) =>
    setOptions
      ? firestoreFactory.write.doc(id).set(data, setOptions)
      : firestoreFactory.write.doc(id).set(data as WithFieldValue<SchemaDocumentInput<TCollectionSchema>>),
  update: (id: string, data: UpdateData<SchemaDocumentInput<TCollectionSchema>>, precondition?: Precondition) =>
    precondition
      ? firestoreFactory.write.doc(id).update(data, precondition)
      : firestoreFactory.write.doc(id).update(data),
  delete: (id: string, precondition?: Precondition) => firestoreFactory.write.doc(id).delete(precondition),
})
