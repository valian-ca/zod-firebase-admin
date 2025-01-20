import { rootCollectionsBuilder } from './collection/root-collections-builder'
import { type Collections } from './collection'
import { type FirestoreZodFactoryOptions, type Schema } from './schema'

/**
 * Build collections from a schema
 * @param schema
 * @param options
 */
export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options?: FirestoreZodFactoryOptions,
): Collections<TSchema> => rootCollectionsBuilder(schema, options)
