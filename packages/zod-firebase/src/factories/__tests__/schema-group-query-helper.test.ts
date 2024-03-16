import { getDocs, getFirestore, type QuerySnapshot } from 'firebase/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import { schemaGroupQueryHelper } from '../schema-group-query-helper'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('schemaGroupQueryHelper', () => {
  it('should produce a queryHelper for CollectionGroup', async () => {
    const snapshot = mock<QuerySnapshot>({ size: 8 })
    jest.mocked(getDocs).mockResolvedValue(snapshot)

    const helper = schemaGroupQueryHelper('for', { zod: TestDocumentZod }, { getFirestore })

    const result = await helper.query({ name: 'test' })

    expect(result.size).toBe(8)
  })
})
