import type { CollectionReference, DocumentReference, CollectionGroup } from 'firebase-admin/firestore'
import type { z } from 'zod'
import type { FactoryOptions } from './factory-options'
import { multiDocumentCollectionFactory } from './multi-document-collection-factory'
import type { CollectionPath, DocumentOutput, ZodTypeDocumentData } from '../base'
import type { QueryHelper } from '../query'

export type SingleDocumentCollectionFactory<TCollectionName extends string, Z extends ZodTypeDocumentData> = {
  readonly collectionName: TCollectionName
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

  readonly group: QueryHelper<DocumentOutput<Z>>

  find(this: void): Promise<DocumentOutput<Z> | undefined>
  findOrThrow(this: void): Promise<DocumentOutput<Z>>
}

export const singleDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  collectionName: TCollectionName,
  zod: Z,
  singleDocumentKey: string,
  options: FactoryOptions,
  parentPath?: [string, string]
): SingleDocumentCollectionFactory<TCollectionName, Z> => {
  const { collectionPath, read, write, group, findById, findByIdOrThrow } = multiDocumentCollectionFactory(
    collectionName,
    zod,
    options,
    parentPath
  )
  return {
    collectionName,
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
    group,
    find: () => findById(singleDocumentKey),
    findOrThrow: () => findByIdOrThrow(singleDocumentKey),
  }
}
