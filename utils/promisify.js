/**
 * Wrap Browser API (like setTimeout()) and old callback APIs (used by Openlayers) 
 * in Promises to send them to the async job queue like fetch() calls.
 *
 * Otherwise, ie. send them to the callback/task queue, will lead to unexpected
 * order of invokation. The async data fetching  would not await Openlayers animations.
 * see https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop
*/

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Animate the view. ... (see ol)
 * @param {...(AnimationOptions|function(boolean): void)} var_args Animation
 *     options.  Multiple animations can be run in series by passing multiple
 *     options objects ...
 */
export function animate(view, var_args) {
  return new Promise((resolve, reject) => {
    view.animate(
      ...Object.values(arguments).slice(1),
      (animationComplete) => {
        // NOTE: ... if you provide a function as the last argument, 
        // it will get called at the end of an animation series,
        // with true if the series completed on its own
        // or false if it was cancelled.
        if (!animationComplete) {
          reject('cancelled')
        }
        resolve('completed')
      }
    )
  })
}
