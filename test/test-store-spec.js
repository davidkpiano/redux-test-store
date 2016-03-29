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
    case 'BAR':
      return {
        ...state,
        test: 'bar'
      };
    case 'BAZ':
      return {
        ...state,
        test: 'baz'
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
    const _store = testStore(store, done);

    _store.when('FOO', (state, action) => {
      return assert.equal(state.user.test, 'foo');
      // done();
    });

    _store.dispatch({
      type: 'FOO'
    });
  });

  it('should work with thunks', (done) => {
    const _store = testStore(store, done);

    _store.when('FOO', (state) => {
      assert.equal(state.user.test, 'foo');
    });

    _store.when('BAR', (state) => {
      assert.equal(state.user.test, 'bar');
    });

    const thunk = (dispatch) => {
      dispatch({ type: 'FOO' });
      dispatch({ type: 'BAR' });
    };

    _store.dispatch(thunk);
  });

  it('should work with deep thunks', (done) => {
    const _store = testStore(store, done);

    _store.when('FOO', (state) => {
      assert.equal(state.user.test, 'foo');
    });

    _store.when('BAR', (state) => {
      assert.equal(state.user.test, 'bar');
    });

    _store.when('BAZ', (state) => {
      assert.equal(state.user.test, 'baz');
    });

    const thunk = (dispatch) => {
      dispatch({ type: 'FOO' });
      dispatch({ type: 'BAR' });
      dispatch((_dispatch) => {
        _dispatch({ type: 'BAZ' });
      });
    };

    _store.dispatch(thunk);
  });
});
