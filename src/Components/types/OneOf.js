import React from 'react';
import { TypeInfo, getPropTypes } from './proptypes';
import { joinValues } from './utils';

const OneOf = ({ propType }) => {
  const propTypes = getPropTypes(propType);

  return (
    <span>
      {`oneOf ${Array.isArray(propTypes) ? joinValues(propTypes) : propTypes}`}
    </span>
  );
};

OneOf.propTypes = {
  propType: TypeInfo.isRequired
};

export default OneOf;
