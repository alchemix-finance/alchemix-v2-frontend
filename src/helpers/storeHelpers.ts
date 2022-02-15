export const DerivedStatus = Object.freeze({
  LOADING: 0,
  LOADED: 1,
  ERROR: 2,
});

export const DefaultDerivedState = Object.freeze({
  Value: undefined,
  Status: DerivedStatus.LOADING,
});

export const useDerived = (state: typeof DefaultDerivedState) => {
  return [state.Value, state.Status];
};
