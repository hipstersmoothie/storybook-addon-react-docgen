import { Component } from '../types';

export const getName = (type: Component) =>
  (type.__docgenInfo?.displayName) ||
  type.displayName ||
  type.name ||
  '';
