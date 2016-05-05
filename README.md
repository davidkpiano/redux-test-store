# redux-test-store
Test existing stores in Redux, the easy way

## Quick Start
- `npm install redux-test-store --save-dev`
- Import it:

```js
import createTestStore from 'redux-test-store';

import store from '../path/to/real/store';

describe('auth action creators', () => {
  it('should authenticate successfully', (done) => {
    let tokenSet = [{token: 1}, {token: 2}];

    const testStore = createTestStore(store, done);

    testStore.when(actionTypes.CHANGE, (state, action) => {
      assert.deepEqual(state.auth.sets, tokenSet);
    });

    testStore.dispatch(actions.authenticate({
      email: 'foo@bar.com',
      password: 'goat'
    }));
  });
```
