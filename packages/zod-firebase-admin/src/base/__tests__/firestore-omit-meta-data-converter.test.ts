import { type QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore'
import { describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { firestoreOmitMetaDataConverter } from '../firestore-omit-meta-data-converter'

describe('firestoreOmitMetaDataConverter', () => {
  describe('with metadata', () => {
    const converter = firestoreOmitMetaDataConverter()

    describe('toFirestore', () => {
      it('should omit _id _createTime _updateTime _readTime', () => {
        expect(
          converter.toFirestore({
            _id: 'id',
            _createTime: Timestamp.now(),
            _updateTime: Timestamp.now(),
            _readTime: Timestamp.now(),
            name: 'name',
          }),
        ).toEqual({ name: 'name' })
      })
    })

    describe('fromFirestore', () => {
      it('should parse and add _id _createTime _updateTime _readTime', () => {
        const now = Timestamp.now()
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          createTime: now,
          updateTime: now,
          readTime: now,
        })
        snapshot.data.mockReturnValue({ name: 'name' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          name: 'name',
        })
      })
    })
  })
})
