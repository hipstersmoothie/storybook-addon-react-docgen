import React from 'react';
import PropTypes from 'prop-types';

export const Button = props => <button {...props} />;

Button.propTypes = {
  /** A action for the button to take */
  action: PropTypes.string.isRequired
};

Button.defaultProps = {
  action: 'foo'
};
