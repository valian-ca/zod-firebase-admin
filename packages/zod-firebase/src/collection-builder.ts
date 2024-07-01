import { type Collections, collectionsFactory, type FirestoreZodFactoryOptions, type Schema } from './factories'

/**
 * Build collections from a schema
 * @param schema
 * @param options
 */
export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options?: FirestoreZodFactoryOptions,
): Collections<TSchema> => collectionsFactory(schema, options)
