import type { CollectionGroup, CollectionReference, DocumentReference } from 'firebase-admin/firestore'
import type { z } from 'zod'
import type { FactoryOptions } from './factory-options'
import {
  type CollectionPath,
  type DocumentOutput,
  firestoreCollection,
  firestoreCollectionPath,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  firestoreZodDocument,
  type ZodTypeDocumentData,
} from '../base'
import { firestoreZodCollectionQuery, type QueryHelper, queryHelper } from '../query'

export type MultiDocumentCollectionFactory<TCollectionName extends string, Z extends ZodTypeDocumentData> = {
  readonly collectionName: TCollectionName
  readonly collectionPath: CollectionPath
  readonly zod: Z

  readonly read: {
    collection(): CollectionReference<DocumentOutput<Z>>
    doc(id: string): DocumentReference<DocumentOutput<Z>>
    collectionGroup(): CollectionGroup<DocumentOutput<Z>>
  }

  readonly write: {
    collection(): CollectionReference<z.input<Z>>
    doc(id: string): DocumentReference<z.input<Z>>
  }

  findById(this: void, id: string): Promise<DocumentOutput<Z> | undefined>
  findByIdOrThrow(this: void, id: string): Promise<DocumentOutput<Z>>
} & QueryHelper<DocumentOutput<Z>>

export const multiDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  collectionName: TCollectionName,
  zod: Z,
  { getFirestore }: FactoryOptions,
  parentPath?: [string, string]
): MultiDocumentCollectionFactory<TCollectionName, Z> => {
  const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]
  return {
    collectionName,
    collectionPath,
    zod,
    read: {
      collection: () => firestoreZodCollection(collectionPath, zod, getFirestore()),
      doc: (id) => firestoreZodDocument(collectionPath, id, zod, getFirestore()),
      collectionGroup: () => firestoreZodCollectionGroup(collectionName, zod, getFirestore()),
    },
    write: {
      collection: () => firestoreCollection(collectionPath, getFirestore()),
      doc: (id) => firestoreDocument(collectionPath, id, getFirestore()),
    },
    findById: async (id) => {
      const doc = await firestoreZodDocument(collectionPath, id, zod, getFirestore()).get()
      return doc.data()
    },
    findByIdOrThrow: async (id) => {
      const doc = await firestoreZodDocument(collectionPath, id, zod, getFirestore()).get()
      if (!doc.exists) {
        throw new Error(`Document ${id} not found in collection ${firestoreCollectionPath(collectionPath)}`)
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return doc.data()!
    },
    ...queryHelper((query) => firestoreZodCollectionQuery(collectionPath, zod, query, getFirestore())),
  }
}
