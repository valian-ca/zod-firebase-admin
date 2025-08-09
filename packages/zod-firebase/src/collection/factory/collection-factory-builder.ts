import { type Except } from 'type-fest'

import { firestoreCollectionPath } from '../../base'
import { type CollectionSchema, type FirestoreZodFactoryOptions } from '../../schema'
import {
  type SchemaFirestoreFactoryBuilder,
  schemaFirestoreFactoryBuilder,
} from '../../schema/schema-firestore-factory-builder'

import { multiDocumentCollectionFactory } from './multi-document-collection-factory'
import { singleDocumentCollectionFactory } from './single-document-collection-factory'
import { type CollectionFactory, type SingleOrMultiDocumentCollectionFactory } from './types'

export type CollectionFactoryBuilder<
  TCollectionName extends string,
  TCollectionSchema extends CollectionSchema,
> = Except<SchemaFirestoreFactoryBuilder<TCollectionSchema>, 'build'> & {
  build(this: void, parentPath?: [string, string]): CollectionFactory<TCollectionName, TCollectionSchema>
}

export const collectionFactoryBuilder = <TCollectionName extends string, TCollectionSchema extends CollectionSchema>(
  collectionName: TCollectionName,
  schema: TCollectionSchema,
  options?: FirestoreZodFactoryOptions,
): CollectionFactoryBuilder<TCollectionName, TCollectionSchema> => {
  const firestoreFactoryBuilder = schemaFirestoreFactoryBuilder(collectionName, schema, options)
  const build = (parentPath?: [string, string]): CollectionFactory<TCollectionName, TCollectionSchema> => {
    const firestoreFactory = firestoreFactoryBuilder.build(parentPath)
    const collection = (
      typeof schema.singleDocumentKey === 'string'
        ? singleDocumentCollectionFactory(firestoreFactory, schema, schema.singleDocumentKey)
        : multiDocumentCollectionFactory(firestoreFactory, schema)
    ) as SingleOrMultiDocumentCollectionFactory<TCollectionSchema>

    return {
      collectionName,
      collectionPath: parentPath ? firestoreCollectionPath([...parentPath, collectionName]) : collectionName,
      ...schema,
      ...collection,
    }
  }
  return {
    ...firestoreFactoryBuilder,
    build,
  }
}
