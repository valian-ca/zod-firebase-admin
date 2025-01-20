import { type EmptyObject } from 'type-fest'

import { type ZodTypeDocumentData } from '../../base'

export type CollectionSchema<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TSubCollectionsSchema extends Schema = EmptyObject,
> = {
  readonly zod: Z
  readonly singleDocumentKey?: string
  readonly includeDocumentIdForZod?: true
  readonly readonlyDocuments?: true
} & TSubCollectionsSchema

export type Schema = Record<string, CollectionSchema>
