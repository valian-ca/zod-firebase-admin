import { getFirestore } from 'firebase-admin/firestore'

import { firestoreCollection } from '../firestore-collection'

describe('firestoreCollection', () => {
  it('should invoke getFirestore().collection', () => {
    firestoreCollection('foo')
    expect(getFirestore().collection).toHaveBeenCalledWith('foo')
  })

  it('should invoke getFirestore().collection for subCollection', () => {
    firestoreCollection(['foo', 'id', 'bar'])
    expect(getFirestore().collection).toHaveBeenCalledWith('foo/id/bar')
  })
})
