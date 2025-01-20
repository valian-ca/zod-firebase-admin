import { type SchemaFirestoreQueryFactory } from './query'
import { type SchemaFirestoreReadFactory } from './read'
import { type CollectionSchema } from './schema'
import { type SchemaFirestoreWriteFactory } from './write'

export interface SchemaFirestoreFactory<TCollectionSchema extends CollectionSchema>
  extends SchemaFirestoreQueryFactory<TCollectionSchema> {
  readonly read: SchemaFirestoreReadFactory<TCollectionSchema>
  readonly write: SchemaFirestoreWriteFactory<TCollectionSchema>
}
