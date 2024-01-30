import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  PartialWithFieldValue,
  Query,
  SetOptions,
  UpdateData,
} from 'firebase/firestore'

import type { DocumentInput, DocumentOutput, ZodTypeDocumentData } from '../base'

import {
  multiDocumentCollectionFactory,
  type MultiDocumentCollectionFactoryOptions,
} from './multi-document-collection-factory'

export type SingleDocumentCollectionFactory<
  Z extends ZodTypeDocumentData,
  TInput extends DocumentData = DocumentInput<Z>,
  TOutput extends DocumentData = DocumentOutput<Z>,
> = {
  readonly singleDocumentKey: string

  readonly read: {
    collection(this: void): CollectionReference<TOutput>
    doc(this: void): DocumentReference<TOutput>
    collectionGroup(this: void): Query<TOutput>
  }

  readonly write: {
    collection(this: void): CollectionReference<TInput>
    doc(this: void): DocumentReference<TInput>
  }

  set(this: void, data: PartialWithFieldValue<TInput>, options: SetOptions): Promise<void>
  update(this: void, data: UpdateData<TInput>): Promise<void>
  delete(this: void): Promise<void>
}

export const singleDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  collectionName: TCollectionName,
  zod: Z,
  singleDocumentKey: string,
  factoryOptions?: MultiDocumentCollectionFactoryOptions,
  parentPath?: [string, string],
): SingleDocumentCollectionFactory<Z> => {
  const {
    read,
    write,
    set,
    update,
    delete: deleteDocument,
  } = multiDocumentCollectionFactory(collectionName, zod, factoryOptions, parentPath)
  return {
    singleDocumentKey,
    read: {
      ...read,
      doc: () => read.doc(singleDocumentKey),
    },
    write: {
      ...write,
      doc: () => write.doc(singleDocumentKey),
    },
    set: (data, options) => set(singleDocumentKey, data, options),
    update: (data) => update(singleDocumentKey, data),
    delete: () => deleteDocument(singleDocumentKey),
  }
}
