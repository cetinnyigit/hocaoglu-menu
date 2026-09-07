import { hocaoglu } from './hocaoglu'
import type { Restaurant } from './types'

/** Yeni esnaf eklerken data dosyasını import edip bu listeye ekle. */
export const restaurants: Restaurant[] = [hocaoglu]

export function getRestaurant(slug: string): Restaurant | undefined {
  return restaurants.find((r) => r.slug === slug)
}

export function getRestaurantSlugs(): string[] {
  return restaurants.map((r) => r.slug)
}

export type { Restaurant } from './types'
