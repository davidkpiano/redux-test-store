import thunk from 'redux-thunk';
import { assert } from 'chai';
import { createStore, applyMiddleware, combineReducers } from 'redux';

import testStore from '../src/index';

const initialUser = {
  name: 'Billy Goat'
};

const userReducer = (state = initialUser, action) => {
  switch (action.type) {
    case 'FOO':
      return {
        ...state,
        test: 'foo'
      };
    default:
      return state;
  }
}

const store = applyMiddleware(thunk)(createStore)(combineReducers({
  user: userReducer
}));

describe('store testing', () => {
  it('should test stores', (done) => {
    const _store = testStore(store);

    _store.when('FOO', (state, action) => {
      assert.equal(state.user.test, 'foo');
      done();
    });

    _store.dispatch({
      type: 'FOO'
    });
  })
})
