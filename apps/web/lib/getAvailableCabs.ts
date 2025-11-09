// apps/web/lib/getAvailableCabs.ts

import { db } from '@repo/db'
import { calculatePrice } from '@repo/core'

export async function getAvailableCabs(params) {
  const cabs = await db.cabType.findMany({
    where: { isActive: true },
    include: {
      pricing: {
        where: {
          fromCityId: params.fromCityId,
          toCityId: params.toCityId
        }
      }
    }
  })

  return cabs.map(cab => ({
    ...cab,
    totalCost: calculatePrice(cab.pricing[0], params.distance)
  }))
}
