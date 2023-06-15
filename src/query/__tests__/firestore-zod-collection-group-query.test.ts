import { z } from 'zod'
import { mock } from 'jest-mock-extended'
import { type ZodCollectionGroup, firestoreZodCollectionGroup } from '../../base'
import { firestoreZodCollectionGroupQuery } from '../firestore-zod-collection-group-query'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreZodCollectionGroupQuery', () => {
  it('should invoke applyQuerySpecification to firestoreZodCollection', () => {
    const collectionGroup = mock<ZodCollectionGroup>()
    collectionGroup.where.mockReturnThis()
    collectionGroup.orderBy.mockReturnThis()
    jest.mocked(firestoreZodCollectionGroup).mockReturnValue(collectionGroup)

    firestoreZodCollectionGroupQuery('test', TestDocumentZod, {
      name: 'test',
      where: [['test', '==', 'value']],
      orderBy: [['test']],
    })

    expect(collectionGroup.where).toHaveBeenCalledWith('test', '==', 'value')
    expect(collectionGroup.orderBy).toHaveBeenCalledWith('test', undefined)
  })
})
