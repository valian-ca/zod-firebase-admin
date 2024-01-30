import { type Collections, collectionsFactory, type FirestoreZodFactoryOptions, type Schema } from './factories'

export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options?: FirestoreZodFactoryOptions,
): Collections<TSchema> => collectionsFactory(schema, options)
