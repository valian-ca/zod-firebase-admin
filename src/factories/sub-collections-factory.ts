import type { SubCollections, SubCollectionsSchema } from './types'
import type { FactoryOptions } from './factory-options'
import { collectionGroupQueryHelper } from './collection-group-query-helper'

export const subCollectionsFactory = <TCollectionSchema>(
  subCollectionsSchema: SubCollectionsSchema<TCollectionSchema>,
  options: FactoryOptions
) =>
  Object.entries(subCollectionsSchema).reduce(
    (acc, [collectionName, collectionSchema]) => ({
      ...acc,
      [collectionName]: {
        ...collectionSchema,
        collectionName,
        group: collectionGroupQueryHelper(collectionName, collectionSchema, options),
      },
    }),
    {} as SubCollections<SubCollectionsSchema<TCollectionSchema>>
  )
