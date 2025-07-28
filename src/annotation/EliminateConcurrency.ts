import ResourceConcurrentEliminator from '../ResourceConcurrentEliminator'

/**
 * 不支持重入
 * @param eliminator
 * @param keyIndex
 * @constructor
 */
export default function EliminateConcurrency(eliminator: ResourceConcurrentEliminator, keyIndex: number = 0) {
  return (target: any, key: string, descriptor: PropertyDescriptor): void => {
    const oldFun = descriptor.value
    descriptor.value = function (...args: any[]) {
      const key = args[keyIndex]
      return eliminator.schedule(key, () => {
        return oldFun.call(this, ...args)
      })
    }
  }
}
