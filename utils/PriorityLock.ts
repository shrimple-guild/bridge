export class PriorityLock {
  private queue: { executor: Function, priority: number }[] = []
  private active: boolean = false
  private maxLength: number

  constructor(maxLength?: number) {
    if ((maxLength != null) && (maxLength < 0)) {
      throw new Error("Maximum queue length must be non-negative!")
    }
    this.maxLength = maxLength ?? Infinity
  }

  get length() {
    return this.queue.length
  }

  get locked() {
    return !this.active
  }

  get priority() {
    return Math.max(...this.queue.map(q => q.priority))
  }
  
  // largely stolen from https://stackoverflow.com/a/74538176
  acquire(fn: Function, priority: number = 0) {
    let deferredResolve: Function
    let deferredReject: Function
    const deferred = new Promise((resolve, reject) => {
      deferredResolve = resolve
      deferredReject = reject
    })
    const exec = async () => {
      await fn().then(deferredResolve, deferredReject)
      if (this.queue.length > 0) {
        const highestPriority = this.queue.reduce((iMax, x, i, arr) => (
          x.priority > arr[iMax].priority ? i : iMax
        ), 0)
        this.queue.splice(highestPriority, 1)[0].executor()
      } else {
        this.active = false
      }
    }
    if (this.active) {
      if (this.queue.length >= this.maxLength - 1) throw new Error("Queue is full!")
      this.queue.push({ executor: exec, priority: priority })
    } else {
      this.active = true
      exec()
    }
    return deferred
  }
}

