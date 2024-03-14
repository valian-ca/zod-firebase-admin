import type {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  PartialWithFieldValue,
  Precondition,
  SetOptions,
  UpdateData,
  WithFieldValue,
  WriteResult,
} from 'firebase-admin/firestore'

import {
  type CollectionPath,
  firestoreCollection,
  firestoreCollectionPath,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  type FirestoreZodDataConverterOptions,
  firestoreZodDocument,
  type ZodTypeDocumentData,
} from '../base'
import { firestoreZodCollectionQuery, type QueryHelper, queryHelper } from '../query'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import type { CollectionSchema, SchemaDocumentInput, SchemaDocumentOutput } from './types'

export type MultiDocumentCollectionFactory<
  Z extends ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
> = {
  readonly read: {
    collection(this: void): CollectionReference<TOutput>
    doc(this: void, id: string): DocumentReference<TOutput>
    collectionGroup(this: void): CollectionGroup<TOutput>
  }

  findById(this: void, id: string): Promise<TOutput | undefined>
  findByIdOrThrow(this: void, id: string): Promise<TOutput>

  readonly write: {
    collection(this: void): CollectionReference<TInput>
    doc(this: void, id: string): DocumentReference<TInput>
  }

  add(this: void, data: WithFieldValue<TInput>): Promise<DocumentReference<TInput>>
  create(this: void, id: string, data: WithFieldValue<TInput>): Promise<WriteResult>
  set(this: void, id: string, data: WithFieldValue<TInput>): Promise<WriteResult>
  set(this: void, id: string, data: PartialWithFieldValue<TInput>, options: SetOptions): Promise<WriteResult>
  update(this: void, id: string, data: UpdateData<TInput>, precondition?: Precondition): Promise<WriteResult>
  delete(this: void, id: string, precondition?: Precondition): Promise<WriteResult>
} & QueryHelper<TOutput>

export type MultiDocumentCollectionFactoryOptions = FirestoreZodFactoryOptions & FirestoreZodDataConverterOptions

export const multiDocumentCollectionFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
>(
  collectionName: TCollectionName,
  zod: Z,
  { getFirestore, ...zodDataConverterOptions }: MultiDocumentCollectionFactoryOptions = {},
  parentPath?: [string, string],
): MultiDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput> => {
  const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]
  const buildZodOptions = () =>
    getFirestore ? { ...zodDataConverterOptions, firestore: getFirestore() } : zodDataConverterOptions
  const set = (id: string, data: PartialWithFieldValue<TInput>, setOptions?: SetOptions) =>
    setOptions
      ? firestoreDocument(collectionPath, id, getFirestore?.()).set(data, setOptions)
      : firestoreDocument(collectionPath, id, getFirestore?.()).set(data as WithFieldValue<TInput>)
  return {
    read: {
      collection: () => firestoreZodCollection<Z, TOutput>(collectionPath, zod, buildZodOptions()),
      doc: (id) => firestoreZodDocument<Z, TOutput>(collectionPath, id, zod, buildZodOptions()),
      collectionGroup: () => firestoreZodCollectionGroup<Z, TOutput>(collectionName, zod, buildZodOptions()),
    },
    findById: async (id) => {
      const doc = await firestoreZodDocument<Z, TOutput>(collectionPath, id, zod, buildZodOptions()).get()
      return doc.data()
    },
    findByIdOrThrow: async (id) => {
      const doc = await firestoreZodDocument<Z, TOutput>(collectionPath, id, zod, buildZodOptions()).get()
      if (!doc.exists) {
        throw new Error(`Document ${id} not found in collection ${firestoreCollectionPath(collectionPath)}`)
      }
      return doc.data()!
    },
    write: {
      collection: () => firestoreCollection(collectionPath, getFirestore?.()),
      doc: (id) => firestoreDocument(collectionPath, id, getFirestore?.()),
    },
    add: async (data) => firestoreCollection<TInput>(collectionPath, getFirestore?.()).add(data),
    create: async (id, data) => firestoreDocument<TInput>(collectionPath, id, getFirestore?.()).create(data),
    set,
    update: (id, data, precondition) =>
      precondition
        ? firestoreDocument(collectionPath, id, getFirestore?.()).update(data, precondition)
        : firestoreDocument(collectionPath, id, getFirestore?.()).update(data),
    delete: (id, precondition) => firestoreDocument(collectionPath, id, getFirestore?.()).delete(precondition),
    ...queryHelper((query) => firestoreZodCollectionQuery(collectionPath, zod, query, buildZodOptions())),
  }
}
