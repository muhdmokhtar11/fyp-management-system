import administration from './administration.reducer';

describe('Administration reducer tests', () => {
  function isEmpty(element): boolean {
    if (element instanceof Array) {
      return element.length === 0;
    }
    return Object.keys(element).length === 0;
  }

  function testInitialState(state) {
    expect(state).toMatchObject({
      loading: false,
      errorMessage: null,
      totalItems: 0,
    });
    expect(isEmpty(state.tracker.activities));
  }

  function testMultipleTypes(types, payload, testFunction, error?) {
    types.forEach(e => {
      testFunction(administration(undefined, { type: e, payload, error }));
    });
  }

  describe('Common', () => {
    it('should return the initial state', () => {
      testInitialState(administration(undefined, { type: '' }));
    });
  });

  describe('Requests', () => {
    it('should set state to loading', () => {
      testMultipleTypes([], {}, state => {
        expect(state).toMatchObject({
          errorMessage: null,
          loading: true,
        });
      });
    });
  });

  describe('Failures', () => {
    it('should set state to failed and put an error message in errorMessage', () => {
      testMultipleTypes(
        [],
        'something happened',
        state => {
          expect(state).toMatchObject({
            loading: false,
            errorMessage: 'error',
          });
        },
        {
          message: 'error',
        },
      );
    });
  });

  describe('Success', () => {});
  describe('Websocket Message Handling', () => {
    const username = process.env.E2E_USERNAME ?? 'admin';

    it('should update state according to a successful websocket message receipt', () => {
      const payload = { id: 1, userLogin: username, page: 'home', sessionId: 'abc123' };
      const toTest = administration(undefined, websocketActivityMessage(payload));

      expect(toTest).toMatchObject({
        tracker: { activities: [payload] },
      });
    });

    it('should update state according to a successful websocket message receipt - only one activity per session', () => {
      const firstPayload = { id: 1, userLogin: username, page: 'home', sessionId: 'abc123' };
      const secondPayload = { id: 1, userLogin: username, page: 'user-management', sessionId: 'abc123' };
      const firstState = administration(undefined, websocketActivityMessage(firstPayload));
      const secondState = administration(firstState, websocketActivityMessage(secondPayload));

      expect(secondState).toMatchObject({
        tracker: { activities: [secondPayload] },
      });
    });

    it('should update state according to a successful websocket message receipt - remove logged out sessions', () => {
      const firstPayload = { id: 1, userLogin: username, page: 'home', sessionId: 'abc123' };
      const secondPayload = { id: 1, userLogin: username, page: 'logout', sessionId: 'abc123' };
      const firstState = administration(undefined, websocketActivityMessage(firstPayload));
      const secondState = administration(firstState, websocketActivityMessage(secondPayload));

      expect(secondState).toMatchObject({
        tracker: { activities: [] },
      });
    });
  });
  describe('Actions', () => {
    const resolvedObject = { value: 'whatever' };
    const getState = jest.fn();
    const dispatch = jest.fn();
    const extra = {};
  });
});
