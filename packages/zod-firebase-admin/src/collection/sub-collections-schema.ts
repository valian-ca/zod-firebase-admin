import { type CollectionSchema } from '../schema'

import { type SubCollectionsSchema } from './types'

export const subCollectionsSchema = <TCollectionSchema extends CollectionSchema>(
  collectionSchema: TCollectionSchema,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { zod, singleDocumentKey, includeDocumentIdForZod, readonlyDocuments, ...rest } = collectionSchema
  return rest as SubCollectionsSchema<TCollectionSchema>
}
