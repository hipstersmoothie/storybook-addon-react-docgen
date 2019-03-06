export const joinValues = propTypes =>
  propTypes.map(({ value }) => value).join(' | ');
