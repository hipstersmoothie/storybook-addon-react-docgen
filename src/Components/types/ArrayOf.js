import React from 'react';

import PrettyPropType from './PrettyPropType';
import { TypeInfo, getPropTypes } from './proptypes';

const ArrayOf = ({ propType }) => (
  <span>
    [<PrettyPropType propType={getPropTypes(propType)} />]
  </span>
);

ArrayOf.propTypes = {
  propType: TypeInfo.isRequired
};

export default ArrayOf;
