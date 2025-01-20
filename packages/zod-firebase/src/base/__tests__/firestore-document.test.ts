import { doc, getFirestore } from '@firebase/firestore'

import { firestoreDocument } from '../firestore-document'

describe('firestoreDocument', () => {
  it('should invoke doc(getFirestore(), id)', () => {
    firestoreDocument('foo', 'id')
    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/id')
  })

  it('should invoke doc(getFirestore(), id) for subCollection', () => {
    firestoreDocument(['foo', 'parent', 'bar'], 'id')
    expect(doc).toHaveBeenCalledWith(getFirestore(), 'foo/parent/bar/id')
  })
})
