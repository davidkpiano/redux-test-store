import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import once from 'lodash/once';

export default function testStore(store, callback = () => {}) {
  const queuedActions = [];
  const actions = [];
  const done = once(callback);

  function testMiddleware({ dispatch, getState }) {
    return next => action => {
      if (typeof action !== 'function'){
        actions.push(action);
      }

      next(action);
    }
  }

  const newStore = applyMiddleware(thunk, testMiddleware)(() => store)();
  
  newStore.when = (actionType, assertion = () => {}) => {
    queuedActions.push({
      type: actionType,
      assertion
    });

    return newStore;
  }

  newStore.subscribe(() => {
    if (!queuedActions.length) return done();
    if (!actions.length) return;

    const state = newStore.getState();
    const lastAction = actions[actions.length - 1];
    let assertion;

    if (lastAction.type === queuedActions[0].type) {
      assertion = queuedActions[0].assertion;

      setTimeout(() => {
        assertion(state, lastAction, actions);

        if (!queuedActions.length) return done();
      });

      queuedActions.splice(0, 1);
    }
  });

  return newStore;
}
