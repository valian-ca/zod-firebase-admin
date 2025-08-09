import { type ReadonlyDeep } from 'type-fest'
import { type z } from 'zod'

import {
  type DocumentOutput,
  type MetaOutputOptions,
  type ReadonlyDocumentOutput,
  type ZodTypeDocumentData,
} from '../../base'

import { type CollectionSchema } from './schema'

type CollectionSchemaZod<TCollectionSchema> =
  TCollectionSchema extends CollectionSchema<infer Z extends ZodTypeDocumentData> ? Z : never

export type SchemaDocumentInput<TCollectionSchema extends CollectionSchema> =
  | z.input<CollectionSchemaZod<TCollectionSchema>>
  | ReadonlyDeep<z.input<CollectionSchemaZod<TCollectionSchema>>>

export type SchemaDocumentOutput<
  TCollectionSchema extends CollectionSchema,
  Options extends MetaOutputOptions = MetaOutputOptions,
> = TCollectionSchema extends { readonlyDocuments: true }
  ? ReadonlyDocumentOutput<CollectionSchemaZod<TCollectionSchema>, Options>
  : DocumentOutput<CollectionSchemaZod<TCollectionSchema>, Options>
