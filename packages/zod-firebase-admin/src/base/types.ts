import type {
  CollectionGroup,
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
} from 'firebase-admin/firestore'
import type { ReadonlyDeep } from 'type-fest'
import type { z } from 'zod'

export type ZodTypeDocumentData<
  Output extends DocumentData = DocumentData,
  Input extends DocumentData = Output,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = z.ZodType<Output, any, Input>

export type DocumentInput<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = z.input<Z>

export type ReadonlyDocumentInput<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = ReadonlyDeep<DocumentInput<Z>>

export type DocumentOutput<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = z.output<Z> & {
  readonly _id: string
  readonly _createTime: Timestamp
  readonly _updateTime: Timestamp
  readonly _readTime: Timestamp
}

export type ReadonlyDocumentOutput<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = ReadonlyDeep<
  DocumentOutput<Z>
>

export type ZodDocumentReference<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
> = DocumentReference<AppModelType, DbModelType>

export type ZodDocumentSnapshot<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
> = DocumentSnapshot<AppModelType, DbModelType>

export type ZodCollectionReference<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
> = CollectionReference<AppModelType, DbModelType>

export type ZodCollectionGroup<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
> = CollectionGroup<AppModelType, DbModelType>

export type ZodQuerySnapshot<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  AppModelType extends DocumentOutput<Z> = DocumentOutput<Z>,
  DbModelType extends DocumentData = DocumentData,
> = QuerySnapshot<AppModelType, DbModelType>
