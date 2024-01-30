import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  SnapshotMetadata,
} from 'firebase/firestore'
import type { z } from 'zod'

export type ZodTypeDocumentData<
  Output extends DocumentData = DocumentData,
  Input extends DocumentData = Output,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = z.ZodType<Output, any, Input>

export type DocumentInput<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = z.input<Z>

export type DocumentOutput<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = z.output<Z> & {
  readonly _id: string
  readonly _metadata: SnapshotMetadata
}

export type ZodDocumentReference<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = DocumentReference<
  DocumentOutput<Z>
>

export type ZodDocumentSnapshot<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = DocumentSnapshot<
  DocumentOutput<Z>
>

export type ZodCollectionReference<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = CollectionReference<
  DocumentOutput<Z>
>

export type ZodQuerySnapshot<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = QuerySnapshot<DocumentOutput<Z>>
