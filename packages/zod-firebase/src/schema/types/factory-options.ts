import { type getFirestore } from '@firebase/firestore'
import { type Except } from 'type-fest'

import { type FirestoreZodDataConverterOptions } from '../../base'

export interface FirestoreFactoryOptions {
  readonly getFirestore?: typeof getFirestore
}

export interface FirestoreZodFactoryOptions
  extends FirestoreFactoryOptions,
    Except<FirestoreZodDataConverterOptions, 'includeDocumentIdForZod'> {}
