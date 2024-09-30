import { firestoreZodCollectionGroup, type MetaOutputOptions, type ZodTypeDocumentData } from '../base'
import { applyQuerySpecification, type QuerySpecification } from '../query'

import { type FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import { schemaQueryHelper } from './schema-query-helper'
import { type CollectionSchema, type SchemaDocumentInput, type SchemaDocumentOutput } from './types'

export const schemaGroupQueryHelper = <
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
>(
  collectionName: string,
  { zod }: TCollectionSchema,
  factoryOptions?: FirestoreZodFactoryOptions,
) => {
  const queryFactory = <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) =>
    applyQuerySpecification(
      firestoreZodCollectionGroup<
        Z,
        Options,
        SchemaDocumentOutput<TCollectionSchema, Options>,
        SchemaDocumentInput<TCollectionSchema>
      >(collectionName, zod, options, factoryOptions),
      query,
    )
  return schemaQueryHelper<TCollectionSchema>(queryFactory)
}
