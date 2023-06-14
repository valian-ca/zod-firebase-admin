import { z } from 'zod'
import { mock } from 'jest-mock-extended'
import { firestoreZodCollectionQuery } from '../firestore-zod-collection-query'
import { firestoreZodCollection, type ZodCollectionReference } from '../../base'

jest.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreZodCollectionQuery', () => {
  it('should invoke applyQuerySpecification to firestoreZodCollection', () => {
    const collectionReference = mock<ZodCollectionReference>()
    collectionReference.where.mockReturnThis()
    collectionReference.orderBy.mockReturnThis()
    jest.mocked(firestoreZodCollection).mockReturnValue(collectionReference)

    firestoreZodCollectionQuery('test', TestDocumentZod, {
      name: 'test',
      where: [['test', '==', 'value']],
      orderBy: [['test']],
    })

    expect(collectionReference.where).toHaveBeenCalledWith('test', '==', 'value')
    expect(collectionReference.orderBy).toHaveBeenCalledWith('test', undefined)
  })
})
