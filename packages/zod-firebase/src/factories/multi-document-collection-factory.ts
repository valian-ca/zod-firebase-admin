import {
  addDoc,
  type CollectionReference,
  deleteDoc,
  type DocumentData,
  type DocumentReference,
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
  type DocumentInput,
  type DocumentOutput,
  firestoreCollection,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  type FirestoreZodDataConverterOptions,
  firestoreZodDocument,
  type ZodTypeDocumentData,
} from '../base'
import { firestoreZodCollectionQuery, type QueryHelper, queryHelper } from '../query'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'

export type MultiDocumentCollectionFactory<
  Z extends ZodTypeDocumentData,
  TInput extends DocumentData = DocumentInput<Z>,
  TOutput extends DocumentData = DocumentOutput<Z>,
> = {
  readonly read: {
    collection(this: void): CollectionReference<TOutput>
    doc(this: void, id: string): DocumentReference<TOutput>
    collectionGroup(this: void): Query<TOutput>
  }

  readonly write: {
    collection(this: void): CollectionReference<TInput>
    doc(this: void, id: string): DocumentReference<TInput>
  }

  add(this: void, data: WithFieldValue<TInput>): Promise<DocumentReference<TInput>>
  set(this: void, id: string, data: PartialWithFieldValue<TInput>, options?: SetOptions): Promise<void>
  update(this: void, id: string, data: UpdateData<TInput>): Promise<void>
  delete(this: void, id: string): Promise<void>
} & QueryHelper<TOutput>

export type MultiDocumentCollectionFactoryOptions = FirestoreZodFactoryOptions & FirestoreZodDataConverterOptions

export const multiDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  collectionName: TCollectionName,
  zod: Z,
  { getFirestore, ...zodOptions }: MultiDocumentCollectionFactoryOptions = {},
  parentPath?: [string, string],
): MultiDocumentCollectionFactory<Z> => {
  const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]
  const buildOptions = () =>
    getFirestore
      ? {
          ...zodOptions,
          firestore: getFirestore(),
        }
      : zodOptions
  return {
    read: {
      collection: () => firestoreZodCollection(collectionPath, zod, buildOptions()),
      doc: (id) => firestoreZodDocument(collectionPath, id, zod, buildOptions()),
      collectionGroup: () => firestoreZodCollectionGroup(collectionName, zod, buildOptions()),
    },
    write: {
      collection: () => firestoreCollection(collectionPath, getFirestore?.()),
      doc: (id) => firestoreDocument(collectionPath, id, getFirestore?.()),
    },
    add: async (data) => addDoc(firestoreCollection(collectionPath, getFirestore?.()), data),
    set: (id, data, setOptions) =>
      setOptions
        ? setDoc(firestoreDocument(collectionPath, id, getFirestore?.()), data, setOptions)
        : setDoc(firestoreDocument(collectionPath, id, getFirestore?.()), data),
    update: (id, data) => updateDoc(firestoreDocument(collectionPath, id, getFirestore?.()), data),
    delete: (id) => deleteDoc(firestoreDocument(collectionPath, id, getFirestore?.())),
    ...queryHelper((query) => firestoreZodCollectionQuery(collectionPath, zod, query, buildOptions())),
  }
}
