'use strict'

/**
 * create and return a new box with given objject state
 *
 * @param {object} state = {} inital state
 * @returns {object} a new box
 */
function boxes (state = {}) {
  const links = new Map()
  const history = []

  let hIndex = 0

  function deleteFutureStories () {
    if (hIndex < history.length) {
      // get future stories
      const toClean = history.splice(hIndex + 1)
      // reset `post` property in every link in every future story
      toClean.forEach(story => story.forEach(link => link.post = []))
    }
  }

  /**
   * Call the `action` when saving or triggering `scope`. Default scope is main scope (state)
   *
   * @param {function} action method to dispatch every time `scope` is saved or triggered
   * @param {object} scope target. By default is the main state
   * @returns {function} unsubscribe
   */
  function subscribe (action, scope) {
    if (!action || typeof action !== 'function') {
      throw new Error('subscribe requires a function as action argument')
    }
    // use state as default scope
    if (!scope) {
      scope = state
    } else if (typeof scope !== 'object') {
      throw new Error('subscribe requires a object as scope argument')
    } else if (!links.has(scope)) {
      throw new Error('cannot subscribe to a scope outside the box')
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

  function save (scope) {
    if (!scope) {
      scope = state
    } else if (typeof scope !== 'object') {
      throw new Error('save argument has to be a object or undefined')
    }
    // assure we can add new stories after old ones
    deleteFutureStories()
    // add story to history and increase hIndex
    history[hIndex++] = applySave(scope)
  }

  function applySave (scope) {
    const link = links.get(scope) || links.set(scope, {scope, pre: [], post: [], bindings: new Set()}).get(scope)
    const cp = Array.isArray(scope) ? [] : {}
    Object.keys(scope).forEach(k => {
      const val = scope[k]
      cp[k] = val
      if (val && typeof val === 'object' && !links.has(val)) {
        applySave(val)
      }
    })
    link.pre.push(cp)
    applyTrigger(scope)
    return [link]
  }

  // trigger actions subscribed to a `scope`.
  function applyTrigger (scope) {
    const bindings = links.get(scope).bindings
    if (bindings.size) {
      bindings.forEach(f => f(scope))
    }
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
    applyTrigger(scope)
  }

  function applyStory (link) {
    const pre = link.pre[link.pre.length - 1]
    const scope = link.scope
    const keys = Object.keys(pre)
    // delete properties
    Object.keys(scope)
    .filter(i => keys.indexOf(i) < 0)
    .forEach(k => delete scope[k])
    // assign properties
    keys.forEach(k => scope[k] = pre[k])
    link.bindings.forEach(f => f(scope))
  }

  function prevState () {
    if (hIndex - 1) {
      history[--hIndex].forEach(link => {
        link.post.push(link.pre.pop())
        applyStory(link)
      })
      return true
    }
    return false
  }

  function nextState () {
    if (history[hIndex]) {
      history[hIndex++].forEach(link => {
        link.pre.push(link.post.pop())
        applyStory(link)
      })
      return true
    }
    return false
  }

  // save initial state so we can get back later
  save(state)

  return {
    get: () => state,
    save, trigger, subscribe, prevState, nextState
  }
}

// this line has to be the last for building purposes
module.exports = boxes
