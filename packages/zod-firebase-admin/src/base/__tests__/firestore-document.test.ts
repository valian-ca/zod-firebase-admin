import { getFirestore } from 'firebase-admin/firestore'
import { describe, expect, it, vi } from 'vitest'

import { firestoreDocument } from '../firestore-document'

vi.mock('firebase-admin/firestore')

describe('firestoreDocument', () => {
  it('should invoke getFirestore().doc', () => {
    firestoreDocument('foo', 'id')
    expect(getFirestore().doc).toHaveBeenCalledWith('foo/id')
  })

  it('should invoke getFirestore().doc for subCollection', () => {
    firestoreDocument(['foo', 'parent', 'bar'], 'id')
    expect(getFirestore().doc).toHaveBeenCalledWith('foo/parent/bar/id')
  })
})
