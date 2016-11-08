import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import once from 'lodash/once';
import every from 'lodash/every';
import cloneDeep from 'lodash/cloneDeep';
import identity from 'lodash/identity';

function getActions(action) {
  // Check if batch action
  if (action && action.actions) {
    return action.actions;
  }

  return action;
}

function deepCloneStrategy(store) {
  const actions = [];

  function testMiddleware({ dispatch, getState }) {
    return next => action => {
      if (typeof action !== 'function'){
        actions.push(action);
      }

      next(action);
    }
  }

  const clonedStore = cloneDeep(store);

  const newStore = applyMiddleware(thunk, testMiddleware)(() => clonedStore)();

  newStore.testStoreActions = actions;

  return newStore;
}

export default function testStore(store, callback = identity, cloneStore = deepCloneStrategy,
                                  fetchActions = (store) => store.testStoreActions) {
  const finalCallback = once(callback);

  const newStore = cloneStore(store);

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
    const actions = fetchActions(newStore);
    let lastActions = [].concat(getActions(actions[actions.length - 1]));

    lastActions = [].concat(lastActions);

    lastActions.forEach((lastAction) => {    
      newStore.queuedActions.forEach((action, index) => {
        if ((action.type !== lastAction.type)
          || action.tested) return action;

        const assertion = action.assertion;

        const result = assertion(state, lastAction, actions);

        newStore.queuedActions[index].tested = true;
      });
    });

    if (every(newStore.queuedActions, { tested: true })) {
      return finalCallback();
    }
  });

  return newStore;
}
