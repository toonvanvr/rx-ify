import { Property } from '../types/object.js'

/**
 * Retrieve the nearest property descriptor in an inheritance chain
 *
 * Crawls along the inheritance chain to find the nearest
 * {@link PropertyDescriptor}
 */
export function getDescriptor(
  target: object,
  key: Property
): PropertyDescriptor | null {
  let descriptor: PropertyDescriptor | undefined
  while (!(descriptor = Object.getOwnPropertyDescriptor(target, key))) {
    target = Object.getPrototypeOf(target)
  }
  return descriptor ?? null
}
