import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { polyfill } from 'es6-promise';
import axios from 'axios';
import expect from 'expect';
import sinon from 'sinon';
import * as actions from '../../actions/users';
import * as types from '../../types';
import createAuthServiceStub from '../../tests/helpers/createAuthServiceStub';

polyfill();

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Users Async Actions', () => {
  let sandbox;
  let store;
  let stub;

  const initialState = {
    isLogin: true,
    message: '',
    isWaiting: false,
    authenticated: false
  };

  const response = {
    data: {
      message: 'Success'
    },
    status: 200
  };

  const data = {
    email: 'hello@world.com',
    password: '2BeOrNot2Be'
  };

  const errMsg = {
    response: {
      data: {
        message: 'Oops! Something went wrong!'
      }
    }
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create(); // eslint-disable-line
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('manualLogin', () => {

    describe('on success', () => {

      beforeEach(() => {
        stub = createAuthServiceStub().replace('login').with(() => Promise.resolve({ status: 200 }));
        store = mockStore(initialState);
      });

      afterEach(() => {
        stub.restore();
      });

      it('should dispatch MANUAL_LOGIN_USER, LOGIN_SUCCESS_USER and route path change actions', done => {
        const expectedActions = [
          {
            type: types.MANUAL_LOGIN_USER
          },
          {
            type: types.LOGIN_SUCCESS_USER,
            message: "You have been successfully logged in"
          },
          {
            payload: {
              args: ['/'],
              method: 'push'
            },
            type: '@@router/CALL_HISTORY_METHOD'
          }
        ];

        store.dispatch(actions.manualLogin(data))
          .then(() => {
            expect(store.getActions()).toEqual(expectedActions);
            done();
          })
          .catch(done);
      });

    });
    describe('on failure', () => {

      beforeEach(() => {
        stub = createAuthServiceStub().replace('login').with(() => Promise.reject({ status: 401 }));
        store = mockStore(initialState);
      });

      afterEach(() => {
        stub.restore();
      });

      it('should dispatch MANUAL_LOGIN_USER and LOGIN_ERROR_USER', (done) => {
        const expectedActions = [
          {
            type: types.MANUAL_LOGIN_USER
          },
          {
            type: types.LOGIN_ERROR_USER,
            message: 'Oops! Invalid username or password'
          }
        ];

        store.dispatch(actions.manualLogin(data))
          .then(() => {
            expect(store.getActions()).toEqual(expectedActions);
            done();
          })
          .catch(done);
      });
    });

    describe('User Logout', () => {
      it('dispatches SIGNUP_USER and SIGNUP_SUCCESS_USER when Sign Up returns status of 200 and routes user to /', (done) => {
        const expectedActions = [
          {
            type: types.LOGOUT_USER
          },
          {
            type: types.LOGOUT_SUCCESS_USER
          }];

        sandbox.stub(axios, 'post').returns(Promise.resolve({status: 200}));

        const store = mockStore(initialState);
        store.dispatch(actions.logOut(data))
          .then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          }).then(done)
          .catch(done);
      });

      it('dispatches SIGNUP_USER and SIGNUP_ERROR_USER when Sign Up returns status of NOT 200', (done) => {
        const expectedActions = [
          {
            type: types.SIGNUP_USER
          },
          {
            type: types.SIGNUP_ERROR_USER,
          }];

        sandbox.stub(axios, 'post').returns(Promise.reject());

        const store = mockStore(initialState);
        store.dispatch(actions.logOut(data))
          .then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          }).then(done)
          .catch(done);
      });
    });
  });

  describe('signUp', () => {
    describe('on success', () => {

      beforeEach(() => {
        stub = createAuthServiceStub().replace('signUp').with(() => Promise.resolve({ status: 200 }));
        store = mockStore(initialState);
      });

      afterEach(() => {
        stub.restore();
      });

      it('should dispatch SIGNUP_USER, SIGNUP_SUCCESS_USER and route path change actions', done => {
        const expectedActions = [
          {
            type: types.SIGNUP_USER
          },
          {
            type: types.SIGNUP_SUCCESS_USER,
            message: 'You have successfully registered an account!'
          },
          {
            payload: {
              args: ['/'],
              method: 'push'
            },
            type: '@@router/CALL_HISTORY_METHOD'
          }
        ];

        store.dispatch(actions.signUp(data))
          .then(() => {
            expect(store.getActions()).toEqual(expectedActions);
            done();
          })
          .catch(done);
      });

    });
    describe('on failure', () => {

      beforeEach(() => {
        stub = createAuthServiceStub().replace('signUp').with(() => Promise.reject({ status: 401 }));
        store = mockStore(initialState);
      });

      afterEach(() => {
        stub.restore();
      });

      it('should dispatch MANUAL_LOGIN_USER and LOGIN_ERROR_USER', (done) => {
        const expectedActions = [
          {
            type: types.SIGNUP_USER
          },
          {
            type: types.SIGNUP_ERROR_USER,
            message: 'Oops! Something went wrong when signing up'
          }
        ];

        store.dispatch(actions.signUp(data))
          .then(() => {
            expect(store.getActions()).toEqual(expectedActions);
            done();
          })
          .catch(done);
      });
    });
  });

  describe('Users Action Creators', () => {
    describe('User Logout', () => {
      it('beginLogout returns action type LOGOUT_USER', () => {
        expect(actions.beginLogout()).toEqual({type: types.LOGOUT_USER});
      });
      it('signUpSuccess returns action type SIGNUP_SUCCESS_USER', () => {
        expect(actions.logoutSuccess()).toEqual({type: types.LOGOUT_SUCCESS_USER});
      });
      it('signUpError returns action type SIGNUP_ERROR_USER', () => {
        expect(actions.logoutError()).toEqual({type: types.LOGOUT_ERROR_USER});
      });
    });
  });
});