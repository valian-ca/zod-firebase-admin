import { type CollectionReference, type DocumentReference, type Query } from 'firebase-admin/firestore'

import { type MetaOutputOptions } from '../../base'

import { type SchemaDocumentInput, type SchemaDocumentOutput } from './doc'
import { type CollectionSchema } from './schema'

export type SchemaReadCollectionReference<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = CollectionReference<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaReadDocumentReference<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = DocumentReference<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaReadCollectionGroup<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = Query<SchemaDocumentOutput<TCollectionSchema, Options>, SchemaDocumentInput<TCollectionSchema>>

export interface SchemaFirestoreReadFactory<TCollectionSchema extends CollectionSchema> {
  collection<Options extends MetaOutputOptions>(
    this: void,
    options?: Options,
  ): SchemaReadCollectionReference<TCollectionSchema, Options>

  doc<Options extends MetaOutputOptions>(
    this: void,
    id: string,
    options?: Options,
  ): SchemaReadDocumentReference<TCollectionSchema, Options>

  collectionGroup<Options extends MetaOutputOptions>(
    this: void,
    options?: Options,
  ): SchemaReadCollectionGroup<TCollectionSchema, Options>
}
