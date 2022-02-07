export const DerivedStatus = Object.freeze({
  LOADING: 0,
  LOADED: 1,
  ERROR: 2,
});

export const DefaultDerivedState = Object.freeze({
  Value: undefined,
  Status: DerivedStatus.LOADING,
});
