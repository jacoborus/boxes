'use strict'

/**
 * create and return a new box with given objject state
 *
 * @param {object} state = {} inital state
 * @returns {object} a new box
 */
function boxes (state) {
  if (state) {
    if (typeof state !== 'object') {
      throw new Error('state should be a object')
    }
  } else {
    state = {}
  }

  let now = 0
  const links = new Map()
  const history = []
  const records = []
  const box = {
    get: () => state,
    save, trigger, subscribe, undo, redo, log, records
  }

  // save initial state so we can get back later
  save(state)

  // clean future stories and future logs
  function removeFuture () {
    if (now < history.length) {
      // get future stories
      const toClean = history.splice(now + 1)
      // reset `post` property in every link in of future stories
      toClean.forEach(story => story.targets.forEach(link => {link.post = []}))
    }
  }

  /**
   * Call the `action` when saving or triggering `scope`. `scope` is `state` by default
   *
   * @param {function} action method to dispatch on saving
   * @param {object} scope target. `state` by default
   * @returns {function} unsubscribe method
   */
  function subscribe (action, scope) {
    if (!action || typeof action !== 'function') {
      throw new Error('subscribe requires a function as first argument')
    }
    // use state as default scope
    if (!scope) {
      scope = state
    } else if (!links.has(scope)) {
      throw new Error('cannot subscribe to a scope outside the box state')
    }
    const link = links.get(scope)
    let subscribed = true
    link.bindings.add(action)
    // return unsubscribe method
    return () => {
      if (subscribed) {
        link.bindings.delete(action)
        subscribed = false
      }
    }
  }

  function getNewLink (scope) {
    const link = {
      scope,
      pre: [],
      post: [],
      bindings: new Set()
    }
    links.set(scope, link)
    return link
  }

  function applySave (scope) {
    // make a copy of the object
    const copy = Array.isArray(scope) ? [] : {},
          link = links.get(scope) || getNewLink(scope)
    Object.keys(scope).forEach(k => {
      const val = scope[k]
      copy[k] = val
      // save nested objects whether they are new in the box
      if (val && typeof val === 'object' && !links.has(val)) {
        applySave(val)
      }
    })
    // save the copy of the object in `pre` list in its link
    link.pre.push(copy)
    // call subscriptions
    applyTrigger(scope)
    // the returned link will be stored as a story in the history
    return link
  }

  function save (scope) {
    if (!scope) {
      // use state as default scope
      scope = state
    } else if (typeof scope !== 'object') {
      throw new Error('scope argument has to be a object')
    }
    // assure we can add new stories after old ones
    removeFuture()
    // add story to history and increase `now`
    const story = {
      targets: [applySave(scope)],
      info: Date.now()
    }
    records[now] = story.info
    history[now++] = story
    return box
  }

  function log (info) {
    info = 0 in arguments ? info : Date.now()
    records[now - 1] = history[now - 1].info = info
  }

  // trigger actions subscribed to a `scope`.
  function applyTrigger (scope) {
    const bindings = links.get(scope).bindings
    if (bindings.size) {
      bindings.forEach(f => f(scope))
    }
    return box
  }

  /**
   * call applyTrigger passing `state` as `scope` by default
   * also check passed `scope` is inside state
   * @param {object} scope optional target
   */
  function trigger (scope) {
    if (!scope) return applyTrigger(state)
    // check passed `scope` is inside state
    if (!links.has(scope)) {
      throw new Error('Cannot trigger a scope outside the box')
    }
    return box
  }

  function applyStory (link) {
    const pre = link.pre[link.pre.length - 1],
          scope = link.scope
    if (Array.isArray(scope)) {
      // remove extra length
      scope.splice(pre.length)
      // assign properties
      pre.forEach((el, i) => {scope[i] = el})
    } else {
      let keys = Object.keys(pre)
      // delete properties
      Object.keys(scope)
      .filter(i => keys.indexOf(i) < 0)
      .forEach(k => delete scope[k])
      // assign properties
      keys.forEach(k => {scope[k] = pre[k]})
    }
    link.bindings.forEach(f => f(scope))
  }

  function undo (steps) {
    if (!steps || steps && (isNaN(steps) || steps < 1)) {
      steps = 1
    }
    if (now - steps) {
      let i = steps
      while (i) {
        history[--now].targets.forEach(link => {
          link.post.push(link.pre.pop())
          applyStory(link)
        })
        --i
      }
      return steps
    }
    return 0
  }

  function redo (steps) {
    if (!steps || steps && (isNaN(steps) || steps < 1)) {
      steps = 1
    }
    let i = steps
    if (history[now + steps - 1]) {
      while (i) {
        history[now++].targets.forEach(link => {
          link.pre.push(link.post.pop())
          applyStory(link)
        })
        --i
      }
      return steps
    }
    return 0
  }

  return box
}

// this line has to be the last for building purposes
module.exports = boxes
