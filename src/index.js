import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import once from 'lodash/once';
import every from 'lodash/every';

export default function testStore(store, callback = () => {}) {
  const actions = [];
  const finalCallback = once(callback);

  function testMiddleware({ dispatch, getState }) {
    return next => action => {
      if (typeof action !== 'function'){
        actions.push(action);
      }

      next(action);
    }
  }

  const clonedStore = {...store};

  const newStore = applyMiddleware(thunk, testMiddleware)(() => clonedStore)();

  newStore.queuedActions = [];
  
  newStore.when = (actionType, assertion = () => {}) => {
    newStore.queuedActions.push({
      type: actionType,
      tested: false,
      assertion
    });

    return newStore;
  }

  newStore.subscribe(() => {
    const state = newStore.getState();
    const lastAction = actions[actions.length - 1];

    newStore.queuedActions.forEach((action, index) => {
      if ((action.type !== lastAction.type)
        || action.tested) return action;

      const assertion = action.assertion;

      const result = assertion(state, lastAction, actions);

      newStore.queuedActions[index].tested = true;
    });

    if (every(newStore.queuedActions, { tested: true })) {
      return finalCallback();
    }
  });

  return newStore;
}
