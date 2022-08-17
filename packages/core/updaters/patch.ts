export const patch = <TState>(partial: Partial<TState>) => {
  return (state: TState): TState => {
    return { ...state, ...partial };
  };
};
