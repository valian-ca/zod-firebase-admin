import type { QueryDocumentSnapshot, SnapshotMetadata } from 'firebase/firestore'
import { mock } from 'jest-mock-extended'

import { firestoreOmitMetaDataConverter } from '../firestore-omit-meta-data-converter'

const META_DATA_MOCK = mock<SnapshotMetadata>()

describe('firestoreOmitMetaDataConverter', () => {
  describe('with metadata', () => {
    const converter = firestoreOmitMetaDataConverter()

    describe('toFirestore', () => {
      it('should omit _id _createTime _updateTime _readTime', () => {
        expect(
          converter.toFirestore({
            _id: 'id',
            _metadata: META_DATA_MOCK,
            name: 'name',
          }),
        ).toEqual({ name: 'name' })
      })
    })

    describe('fromFirestore', () => {
      it('should parse and add _id _createTime _updateTime _readTime', () => {
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          metadata: META_DATA_MOCK,
        })
        snapshot.data.mockReturnValue({ name: 'name' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          name: 'name',
        })
      })
    })
  })
})
