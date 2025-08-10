import {
  type CollectionPath,
  firestoreCollection,
  firestoreCollectionGroup,
  firestoreDocument,
  type MetaOutputOptions,
} from '../base'

import { schemaFirestoreQueryFactory } from './schema-firestore-query-factory'
import {
  type SchemaFirestoreDataConverter,
  schemaFirestoreZodDataConverterFactory,
} from './schema-firestore-zod-data-converter-factory'
import {
  type CollectionSchema,
  type FirestoreZodFactoryOptions,
  type SchemaFirestoreQueryFactory,
  type SchemaFirestoreReadFactory,
} from './types'

export interface SchemaFirestoreReadFactoryBuilder<TCollectionSchema extends CollectionSchema> {
  build(this: void, parentPath?: [string, string]): SchemaFirestoreReadFactory<TCollectionSchema>

  zodConverter<Options extends MetaOutputOptions>(
    this: void,
    options?: Options,
  ): SchemaFirestoreDataConverter<TCollectionSchema, Options>

  group: SchemaFirestoreQueryFactory<TCollectionSchema>
}

export const schemaFirestoreReadFactoryBuilder = <TCollectionSchema extends CollectionSchema>(
  collectionName: string,
  schema: TCollectionSchema,
  { getFirestore, ...converterOptions }: FirestoreZodFactoryOptions = {},
): SchemaFirestoreReadFactoryBuilder<TCollectionSchema> => {
  const zodConverterFactory = schemaFirestoreZodDataConverterFactory(schema, converterOptions)
  const collectionGroup = <Options extends MetaOutputOptions>(options?: Options) =>
    firestoreCollectionGroup(collectionName, getFirestore?.()).withConverter(zodConverterFactory(options))
  const build = (parentPath?: [string, string]): SchemaFirestoreReadFactory<TCollectionSchema> => {
    const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]

    return {
      collection: <Options extends MetaOutputOptions>(options?: Options) =>
        firestoreCollection(collectionPath, getFirestore?.()).withConverter(zodConverterFactory(options)),
      doc: <Options extends MetaOutputOptions>(id: string, options?: Options) =>
        firestoreDocument(collectionPath, id, getFirestore?.()).withConverter(zodConverterFactory(options)),
      collectionGroup,
    }
  }
  return {
    build,
    zodConverter: zodConverterFactory,
    group: schemaFirestoreQueryFactory(collectionGroup, collectionName),
  }
}
