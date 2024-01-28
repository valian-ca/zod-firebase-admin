export type CollectionPath = [string] | [string, string, string]

export const firestoreCollectionPath = (path: CollectionPath | string): string =>
  Array.isArray(path) ? path.join('/') : path
