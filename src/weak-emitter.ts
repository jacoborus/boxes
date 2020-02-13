type Handler = (...args: any[]) => void
type Stack = Set<Handler>
type Prop = string | object

export function weakEmitter () {
  const events = new WeakMap()

  function newStack (event: Map<Prop, any>, prop: Prop) {
    const stack: Stack = new Set()
    event.set(prop, stack)
    return stack
  }

  function newEvent (key: object) {
    const event = new Map()
    events.set(key, event)
    return event
  }

  function on (key: object, prop: Prop, handler: Handler) {
    const event = events.get(key) || newEvent(key)
    const stack = event.get(prop) || newStack(event, prop)
    stack.add(handler)
  }

  function emit (key: object, prop: Prop, ...args: any[]) {
    const event = events.get(key)
    if (!event) return
    const stack = event.get(prop)
    if (!stack) return
    stack.forEach((handler: Handler) => handler(...args))
  }

  function off (key: object, prop: Prop, handler: Handler) {
    const event = events.get(key)
    if (!event) return
    const stack = event.get(prop)
    if (!stack) return
    stack.delete(handler)
    if (stack.size) event.delete(stack)
  }

  return { on, off, emit }
}
