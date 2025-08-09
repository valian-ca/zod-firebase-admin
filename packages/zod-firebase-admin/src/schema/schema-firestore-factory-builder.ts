import { type Except } from 'type-fest'

import { type MetaOutputOptions } from '../base'

import { schemaFirestoreQueryFactory } from './schema-firestore-query-factory'
import {
  type SchemaFirestoreReadFactoryBuilder,
  schemaFirestoreReadFactoryBuilder,
} from './schema-firestore-read-factory-builder'
import { schemaFirestoreWriteFactoryBuilder } from './schema-firestore-write-factory-builder'
import { type SchemaFirestoreDataConverter } from './schema-firestore-zod-data-converter-factory'
import { type CollectionSchema, type FirestoreFactoryOptions, type SchemaFirestoreFactory } from './types'

export interface SchemaFirestoreFactoryBuilder<TCollectionSchema extends CollectionSchema>
  extends Except<SchemaFirestoreReadFactoryBuilder<TCollectionSchema>, 'build'> {
  build(this: void, parentPath?: [string, string]): SchemaFirestoreFactory<TCollectionSchema>
  zodConverter<Options extends MetaOutputOptions>(
    this: void,
    options?: Options,
  ): SchemaFirestoreDataConverter<TCollectionSchema, Options>
}

export const schemaFirestoreFactoryBuilder = <TCollectionSchema extends CollectionSchema>(
  collectionName: string,
  schema: TCollectionSchema,
  factoryOptions?: FirestoreFactoryOptions,
): SchemaFirestoreFactoryBuilder<TCollectionSchema> => {
  const readBuilder = schemaFirestoreReadFactoryBuilder(collectionName, schema, factoryOptions)
  const writeBuilder = schemaFirestoreWriteFactoryBuilder(collectionName, schema, factoryOptions)

  const build = (parentPath?: [string, string]): SchemaFirestoreFactory<TCollectionSchema> => {
    const read = readBuilder.build(parentPath)
    const write = writeBuilder.build(parentPath)
    return {
      ...schemaFirestoreQueryFactory(read.collection, collectionName),
      read,
      write,
    }
  }

  return {
    ...readBuilder,
    ...writeBuilder,
    build,
  }
}
