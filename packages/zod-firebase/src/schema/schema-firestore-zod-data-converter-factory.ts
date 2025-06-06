import { type FirestoreDataConverter } from '@firebase/firestore'
import { type Except } from 'type-fest'

import { firestoreZodDataConverter, type FirestoreZodDataConverterOptions, type MetaOutputOptions } from '../base'

import { type CollectionSchema, type SchemaDocumentInput, type SchemaDocumentOutput } from './types'

export type SchemaFirestoreDataConverter<
  TCollectionSchema extends CollectionSchema,
  TOutputOptions extends MetaOutputOptions = MetaOutputOptions,
> = FirestoreDataConverter<
  SchemaDocumentOutput<TCollectionSchema, TOutputOptions>,
  SchemaDocumentInput<TCollectionSchema>
>

type SchemaFirestoreDataConverterOptions = Except<FirestoreZodDataConverterOptions, 'includeDocumentIdForZod'>

const schemaFirestoreZodDataConverter = <
  TCollectionSchema extends CollectionSchema,
  TOutputOptions extends MetaOutputOptions,
>(
  { zod, includeDocumentIdForZod }: TCollectionSchema,
  outputOptions?: TOutputOptions,
  converterOptions?: SchemaFirestoreDataConverterOptions,
): SchemaFirestoreDataConverter<TCollectionSchema, TOutputOptions> =>
  firestoreZodDataConverter(zod, outputOptions, { includeDocumentIdForZod, ...converterOptions })

export const schemaFirestoreZodDataConverterFactory = <TCollectionSchema extends CollectionSchema>(
  schema: TCollectionSchema,
  converterOptions?: SchemaFirestoreDataConverterOptions,
) => {
  const memoized = new WeakMap<MetaOutputOptions, FirestoreDataConverter<SchemaDocumentOutput<TCollectionSchema>>>()
  const defaultFactory = schemaFirestoreZodDataConverter(schema, undefined, converterOptions)

  return <TOutputOptions extends MetaOutputOptions>(
    outputOptions?: TOutputOptions,
  ): SchemaFirestoreDataConverter<TCollectionSchema, TOutputOptions> => {
    if (!outputOptions) {
      return defaultFactory
    }
    const memoizedConverter = memoized.get(outputOptions)
    if (memoizedConverter) {
      return memoizedConverter as SchemaFirestoreDataConverter<TCollectionSchema, TOutputOptions>
    }
    const converter = schemaFirestoreZodDataConverter(schema, outputOptions, converterOptions)
    memoized.set(outputOptions, converter)
    return converter
  }
}
