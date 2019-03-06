import React from 'react';
import { TypeInfo, getPropTypes } from './proptypes';
import { joinValues } from './utils';

const Enum = ({ propType }) => (
  <span>{joinValues(getPropTypes(propType))}</span>
);

Enum.propTypes = {
  propType: TypeInfo.isRequired
};
