import type { CollectionReference, DocumentReference, CollectionGroup } from 'firebase-admin/firestore'
import type { z } from 'zod'
import type { FactoryOptions } from './factory-options'
import { multiDocumentCollectionFactory } from './multi-document-collection-factory'
import type { CollectionPath, DocumentOutput, ZodTypeDocumentData } from '../base'

export type SingleDocumentCollectionFactory<TCollectionName extends string, Z extends ZodTypeDocumentData> = {
  readonly name: TCollectionName
  readonly collectionPath: CollectionPath
  readonly singleDocumentKey: string

  readonly read: {
    collection(): CollectionReference<DocumentOutput<Z>>
    doc(): DocumentReference<DocumentOutput<Z>>
    collectionGroup(): CollectionGroup<DocumentOutput<Z>>
  }

  readonly write: {
    collection(): CollectionReference<z.input<Z>>
    doc(): DocumentReference<z.input<Z>>
  }

  find(this: void): Promise<DocumentOutput<Z> | undefined>
  findOrThrow(this: void): Promise<DocumentOutput<Z>>
}

export const singleDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  name: TCollectionName,
  zod: Z,
  singleDocumentKey: string,
  options: FactoryOptions,
  parentPath?: [string, string]
): SingleDocumentCollectionFactory<TCollectionName, Z> => {
  const { collectionPath, read, write, findById, findByIdOrThrow } = multiDocumentCollectionFactory(
    name,
    zod,
    options,
    parentPath
  )
  return {
    name,
    collectionPath,
    singleDocumentKey,
    read: {
      ...read,
      doc: () => read.doc(singleDocumentKey),
    },
    write: {
      ...write,
      doc: () => write.doc(singleDocumentKey),
    },
    find: () => findById(singleDocumentKey),
    findOrThrow: () => findByIdOrThrow(singleDocumentKey),
  }
}
