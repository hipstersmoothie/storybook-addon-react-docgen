import React from 'react';
import PropTypes from 'prop-types';

export const Button = props => <button {...props} />;

Button.propTypes = {
  /** A action for the button to take */
  action: PropTypes.string,
  /** A made-up property to test minimizing/expanding enum list */
  label: PropTypes.oneOf([
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o'
  ])
};

Button.defaultProps = {
  action: 'foo'
};
