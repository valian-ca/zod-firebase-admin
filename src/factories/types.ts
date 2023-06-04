import type { ZodTypeDocumentData } from '../base'

export type CollectionSchema<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TSubCollectionsSchema extends Schema = {}
> = {
  readonly zod: Z
  readonly singleDocumentKey?: string
} & TSubCollectionsSchema

export type Schema = {
  [key: string]: CollectionSchema
}
