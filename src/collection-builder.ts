import { Collections, collectionWithSubCollectionsFactory, FactoryOptions, Schema } from './factories'

export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options: FactoryOptions
): Collections<TSchema> =>
  Object.entries(schema).reduce(
    (acc, [collectionName, collectionSchema]) => ({
      ...acc,
      [collectionName]: collectionWithSubCollectionsFactory<string>(collectionName, collectionSchema, options),
    }),
    {} as Collections<TSchema>
  )
