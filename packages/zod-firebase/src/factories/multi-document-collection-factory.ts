import {
  addDoc,
  type CollectionReference,
  deleteDoc,
  type DocumentData,
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
  DbModelType extends DocumentData = TInput,
> = {
  readonly read: {
    collection(this: void): CollectionReference<TOutput, DbModelType>
    doc(this: void, id: string): DocumentReference<TOutput, DbModelType>
    collectionGroup(this: void): Query<TOutput, DbModelType>
  }

  findById(this: void, id: string): Promise<TOutput | undefined>
  findByIdOrThrow(this: void, id: string): Promise<TOutput>

  readonly write: {
    collection(this: void): CollectionReference<TInput, DbModelType>
    doc(this: void, id: string): DocumentReference<TInput, DbModelType>
  }

  add(this: void, data: WithFieldValue<TInput>): Promise<DocumentReference<TInput, DbModelType>>
  set(this: void, id: string, data: WithFieldValue<TInput>): Promise<void>
  set(this: void, id: string, data: PartialWithFieldValue<TInput>, options: SetOptions): Promise<void>
  update(this: void, id: string, data: UpdateData<DbModelType>): Promise<void>
  delete(this: void, id: string): Promise<void>
} & QueryHelper<TOutput>

export type MultiDocumentCollectionFactoryOptions = FirestoreZodFactoryOptions & FirestoreZodDataConverterOptions

export const multiDocumentCollectionFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
  DbModelType extends DocumentData = TInput,
>(
  collectionName: TCollectionName,
  zod: Z,
  { getFirestore, ...zodOptions }: MultiDocumentCollectionFactoryOptions = {},
  parentPath?: [string, string],
): MultiDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput, DbModelType> => {
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
      ? setDoc(firestoreDocument<TInput, DbModelType>(collectionPath, id, getFirestore?.()), data, setOptions)
      : setDoc(
          firestoreDocument<TInput, DbModelType>(collectionPath, id, getFirestore?.()),
          data as WithFieldValue<TInput>,
        )
  return {
    read: {
      collection: () => firestoreZodCollection<Z, TOutput, DbModelType>(collectionPath, zod, buildOptions()),
      doc: (id) => firestoreZodDocument<Z, TOutput, DbModelType>(collectionPath, id, zod, buildOptions()),
      collectionGroup: () => firestoreZodCollectionGroup<Z, TOutput, DbModelType>(collectionName, zod, buildOptions()),
    },
    findById: async (id) => {
      const doc = await getDoc(firestoreZodDocument<Z, TOutput, DbModelType>(collectionPath, id, zod, buildOptions()))
      return doc.data()
    },
    findByIdOrThrow: async (id) => {
      const doc = await getDoc(firestoreZodDocument<Z, TOutput, DbModelType>(collectionPath, id, zod, buildOptions()))
      if (!doc.exists()) {
        throw new Error(`Document ${id} not found in collection ${firestoreCollectionPath(collectionPath)}`)
      }
      return doc.data()
    },
    write: {
      collection: () => firestoreCollection<TInput, DbModelType>(collectionPath, getFirestore?.()),
      doc: (id) => firestoreDocument<TInput, DbModelType>(collectionPath, id, getFirestore?.()),
    },
    add: async (data) => addDoc(firestoreCollection<TInput, DbModelType>(collectionPath, getFirestore?.()), data),
    set,
    update: (id, data) => updateDoc(firestoreDocument<TInput, DbModelType>(collectionPath, id, getFirestore?.()), data),
    delete: (id) => deleteDoc(firestoreDocument<TInput, DbModelType>(collectionPath, id, getFirestore?.())),
    ...queryHelper((query) =>
      firestoreZodCollectionQuery<Z, TOutput, DbModelType>(collectionPath, zod, query, buildOptions()),
    ),
  }
}
