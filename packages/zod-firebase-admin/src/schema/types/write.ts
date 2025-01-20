import { type CollectionReference, type DocumentReference } from 'firebase-admin/firestore'

import { type SchemaDocumentInput } from './doc'
import { type CollectionSchema } from './schema'

export type SchemaWriteCollectionReference<TCollectionSchema extends CollectionSchema> = CollectionReference<
  SchemaDocumentInput<TCollectionSchema>,
  SchemaDocumentInput<TCollectionSchema>
>

export type SchemaWriteDocumentReference<TCollectionSchema extends CollectionSchema> = DocumentReference<
  SchemaDocumentInput<TCollectionSchema>,
  SchemaDocumentInput<TCollectionSchema>
>

export interface SchemaFirestoreWriteFactory<TCollectionSchema extends CollectionSchema> {
  collection(this: void): SchemaWriteCollectionReference<TCollectionSchema>

  doc(this: void, id: string): SchemaWriteDocumentReference<TCollectionSchema>
}
