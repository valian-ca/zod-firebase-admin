import { type Firestore } from 'firebase/firestore'

import { type FirestoreZodDataConverterOptions } from './firestore-zod-data-converter'

export type FirestoreZodOptions = FirestoreZodDataConverterOptions & {
  readonly firestore?: Firestore
}
