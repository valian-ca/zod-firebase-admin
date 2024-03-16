import { firestoreZodCollectionGroup, type MetaOutputOptions, type ZodTypeDocumentData } from '../base'
import { applyQuerySpecification, type QuerySpecification } from '../query'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import { schemaQueryHelper } from './schema-query-helper'
import type { CollectionSchema, SchemaDocumentInput, SchemaDocumentOutput } from './types'

export const schemaGroupQueryHelper = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
>(
  collectionName: TCollectionName,
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
