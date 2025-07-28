interface Waiter {
  name: string
  resolve: () => void
}
export default class MutexLock {
  private _name: string
  private _owner: string
  private _locked: boolean
  private _waiting: Waiter[]

  constructor(name?: string) {
    this._locked = false
    this._waiting = []
    this._name = name
  }

  tryLock(owner?: string): boolean {
    if (!this._locked) {
      this._locked = true
      this._owner = owner
      return true
    } else {
      return false
    }
  }
  lock(owner?: string): Promise<void> {
    if (!this._locked) {
      this._locked = true
      this._owner = owner
      return Promise.resolve(undefined)
    } else {
      return new Promise((resolve) => {
        this._waiting.push({
          resolve,
          name: owner,
        })
      })
    }
  }

  unlock() {
    this._locked = false
    if (this._waiting.length > 0) {
      const waiter = this._waiting.shift()
      this._locked = true
      if (waiter) {
        waiter.resolve()
        this._owner = waiter.name
      }
    }
  }
  get Name(): string {
    return this._name
  }
  get Owner(): string {
    return this._owner
  }
}
