import { getFirestore } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import { type ZodQuerySnapshot } from '../../base'
import { schemaGroupQueryHelper } from '../schema-group-query-helper'

const TestDocumentZod = z.object({
  name: z.string(),
})

type TestQuerySnapshot = ZodQuerySnapshot<typeof TestDocumentZod>

describe('schemaGroupQueryHelper', () => {
  it('should produce a queryHelper for CollectionGroup', async () => {
    const snapshot = mock<TestQuerySnapshot>({ size: 8 })
    jest.mocked(getFirestore().collectionGroup('foo').get).mockResolvedValue(snapshot)

    const helper = schemaGroupQueryHelper('for', { zod: TestDocumentZod }, { getFirestore })

    const result = await helper.query({ name: 'test' })

    expect(result.size).toBe(8)
  })
})
