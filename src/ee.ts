import { weakEmitter } from 'weak-emitter'
import { Box } from './tools'
type EventHandler = (...args: any[]) => void
const emitter = weakEmitter()
const ee = {
  emit: emitter.emit,
  off: emitter.off,
  on: (box: Box, prop: string, handler: EventHandler) => {
    box.__isWatched = true
    return emitter.on(box, prop, handler)
  }
}
export default ee
