import {
  addDoc,
  type CollectionReference,
  deleteDoc,
  type DocumentReference,
  getDoc,
  type PartialWithFieldValue,
  type Query,
  setDoc,
  type SetOptions,
  type UpdateData,
  updateDoc,
  type WithFieldValue,
} from 'firebase/firestore'

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
    collectionGroup(this: void): Query<TOutput>
  }

  findById(this: void, id: string): Promise<TOutput | undefined>
  findByIdOrThrow(this: void, id: string): Promise<TOutput>

  readonly write: {
    collection(this: void): CollectionReference<TInput>
    doc(this: void, id: string): DocumentReference<TInput>
  }

  add(this: void, data: WithFieldValue<TInput>): Promise<DocumentReference<TInput>>
  set(this: void, id: string, data: WithFieldValue<TInput>): Promise<void>
  set(this: void, id: string, data: PartialWithFieldValue<TInput>, options: SetOptions): Promise<void>
  update(this: void, id: string, data: UpdateData<TInput>): Promise<void>
  delete(this: void, id: string): Promise<void>
} & QueryHelper<TOutput>

export type MultiDocumentCollectionFactoryOptions = FirestoreZodFactoryOptions & FirestoreZodDataConverterOptions

export const multiDocumentCollectionFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
>(
  collectionName: TCollectionName,
  zod: Z,
  { getFirestore, ...zodOptions }: MultiDocumentCollectionFactoryOptions = {},
  parentPath?: [string, string],
): MultiDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput> => {
  const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]
  const buildOptions = () =>
    getFirestore
      ? {
          ...zodOptions,
          firestore: getFirestore(),
        }
      : zodOptions

  const set = (id: string, data: PartialWithFieldValue<TInput>, setOptions?: SetOptions) =>
    setOptions
      ? setDoc(firestoreDocument(collectionPath, id, getFirestore?.()), data, setOptions)
      : setDoc(firestoreDocument(collectionPath, id, getFirestore?.()), data as WithFieldValue<TInput>)
  return {
    read: {
      collection: () => firestoreZodCollection<Z, TOutput>(collectionPath, zod, buildOptions()),
      doc: (id) => firestoreZodDocument<Z, TOutput>(collectionPath, id, zod, buildOptions()),
      collectionGroup: () => firestoreZodCollectionGroup<Z, TOutput>(collectionName, zod, buildOptions()),
    },
    findById: async (id) => {
      const doc = await getDoc(firestoreZodDocument<Z, TOutput>(collectionPath, id, zod, buildOptions()))
      return doc.data()
    },
    findByIdOrThrow: async (id) => {
      const doc = await getDoc(firestoreZodDocument<Z, TOutput>(collectionPath, id, zod, buildOptions()))
      if (!doc.exists()) {
        throw new Error(`Document ${id} not found in collection ${firestoreCollectionPath(collectionPath)}`)
      }
      return doc.data()
    },
    write: {
      collection: () => firestoreCollection(collectionPath, getFirestore?.()),
      doc: (id) => firestoreDocument(collectionPath, id, getFirestore?.()),
    },
    add: async (data) => addDoc(firestoreCollection(collectionPath, getFirestore?.()), data),
    set,
    update: (id, data) => updateDoc(firestoreDocument(collectionPath, id, getFirestore?.()), data),
    delete: (id) => deleteDoc(firestoreDocument(collectionPath, id, getFirestore?.())),
    ...queryHelper((query) => firestoreZodCollectionQuery<Z, TOutput>(collectionPath, zod, query, buildOptions())),
  }
}
