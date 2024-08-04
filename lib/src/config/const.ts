/**
 * Symbol attached invisibly to objects which are rxified
 *
 * It is accessible, but the property descriptor defines it as non-enumerable
 */
export const RxTools = Symbol('rx-ify')
