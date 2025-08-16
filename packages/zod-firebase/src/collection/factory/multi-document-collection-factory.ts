import {
  addDoc,
  deleteDoc,
  type DocumentData,
  type DocumentReference,
  getDoc,
  type PartialWithFieldValue,
  setDoc,
  type SetOptions,
  type UpdateData,
  updateDoc,
  type WithFieldValue,
} from '@firebase/firestore'
import { type Except } from 'type-fest'

import { type MetaOutputOptions } from '../../base'
import {
  type CollectionSchema,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreFactory,
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
  ): Promise<SchemaFallbackOutputDocument<TCollectionSchema>>

  add(
    this: void,
    data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
  ): Promise<DocumentReference<SchemaDocumentInput<TCollectionSchema>>>

  set(this: void, id: string, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<void>

  set(
    this: void,
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    options: SetOptions,
  ): Promise<void>

  update(this: void, id: string, data: UpdateData<SchemaDocumentInput<TCollectionSchema>>): Promise<void>

  delete(this: void, id: string): Promise<void>
}

export const multiDocumentCollectionFactory = <TCollectionSchema extends CollectionSchema>(
  firestoreFactory: SchemaFirestoreFactory<TCollectionSchema>,
  schema: TCollectionSchema,
): MultiDocumentCollectionFactory<TCollectionSchema> => ({
  ...firestoreFactory,
  findById: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
    const doc = await getDoc(firestoreFactory.read.doc(id, options))
    return doc.data()
  },
  findByIdOrThrow: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
    const reference = firestoreFactory.read.doc(id, options)
    const doc = await getDoc(reference)
    if (!doc.exists()) {
      throw new Error(`Document ${reference.path} not found`)
    }
    return doc.data()
  },
  findByIdWithFallback: async <TDocumentId extends string>(
    id: TDocumentId,
    fallback: SchemaFallbackValue<TCollectionSchema, TDocumentId>,
  ) => {
    const doc = await getDoc(firestoreFactory.read.doc(id))
    if (doc.exists()) {
      return doc.data() as SchemaFallbackOutputDocument<TCollectionSchema, TDocumentId>
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
  add: async (data) => addDoc(firestoreFactory.write.collection(), data),
  set: async (
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    setOptions?: SetOptions,
  ) =>
    setOptions
      ? setDoc(firestoreFactory.write.doc(id), data, setOptions)
      : setDoc(firestoreFactory.write.doc(id), data as WithFieldValue<SchemaDocumentInput<TCollectionSchema>>),
  update: (id, data) => updateDoc(firestoreFactory.write.doc(id), data),
  delete: (id) => deleteDoc(firestoreFactory.write.doc(id)),
})
