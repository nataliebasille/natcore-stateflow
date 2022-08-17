type Actions<TState> = {
  [key: string]: (
    payload: any,
    currentState: TState
  ) => TState | Promise<TState>;
};

type Subscriber<TState> = (nextState: TState, prevState: TState) => void;
type Unsubscribe = () => void;

type Store<TState, TActions extends Actions<TState>> = {
  getState: () => TState;
  dispatch: <TDispatchKey extends keyof TActions>(
    action: TDispatchKey,
    payload: Parameters<TActions[TDispatchKey]>[0]
  ) => ReturnType<TActions[TDispatchKey]> extends Promise<any>
    ? Promise<TState>
    : TState;
  subscribe: (subscriber: Subscriber<TState>) => Unsubscribe;
};

export function createStore<TState, TActions extends Actions<TState>>(
  defaultState: TState,
  actions: TActions
): Store<TState, TActions> {
  let state = defaultState;

  const subscribers: Subscriber<TState>[] = [];
  const handleNextState = (nextState: TState) => {
    subscribers.forEach((subscriber) => subscriber(nextState, state));
    state = nextState;
    return state;
  };

  const dispatch = <TDispatchKey extends keyof TActions>(
    action: TDispatchKey,
    payload: Parameters<TActions[TDispatchKey]>[0]
  ): any => {
    const nextState = actions[action](payload, state);
    if (nextState instanceof Promise) {
      return nextState.then(handleNextState);
    } else {
      return handleNextState(nextState);
    }
  };

  const subscribe = (subscriber: Subscriber<TState>) => {
    subscribers.push(subscriber);
    return () => {
      subscribers.splice(subscribers.indexOf(subscriber), 1);
    };
  };

  return {
    getState: () => state,
    dispatch,
    subscribe,
  };
}
