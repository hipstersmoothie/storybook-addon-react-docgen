import PropTypes from 'prop-types';
import React from 'react';

import PropVal from './PropVal';
import PrettyPropType from './types/PrettyPropType';

const cell = {
  paddingRight: 20,
  paddingTop: 15,
  paddingBottom: 15,
  verticalAlign: 'top',
  border: 'none'
};

const styles = {
  table: {
    width: '100%',
    padding: '2rem 0'
  },
  header: {
    paddingRight: 20,
    paddingBottom: 10,
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 14,
    whiteSpace: 'nowrap',
    border: 'none',
    borderBottom: '1px solid #ccc'
  },

  property: {
    ...cell,
    color: '#c62828'
  },
  propType: {
    ...cell,
    maxWidth: '150px',
    overflow: 'scroll',
    color: '#2e7d32'
  },
  required: {
    ...cell
  },
  defaultValue: {
    ...cell
  },
  description: {
    ...cell
  }
};

export const multiLineText = input => {
  if (!input) {
    return input;
  }

  const text = String(input);
  const arrayOfText = text.split(/\r?\n|\r/g);
  const isSingleLine = arrayOfText.length < 2;

  return isSingleLine
    ? text
    : arrayOfText.map((lineOfText, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`${lineOfText}.${i}`}>
          {i > 0 && <br />} {lineOfText}
        </span>
      ));
};

const determineIncludedPropTypes = (propDefinitions, excludedPropTypes) => {
  if (excludedPropTypes.length === 0) {
    return propDefinitions;
  }

  return propDefinitions.filter(
    propDefinition => !excludedPropTypes.includes(propDefinition.property)
  );
};

export default function PropTable(props) {
  const {
    type,
    maxPropObjectKeys,
    maxPropArrayLength,
    maxPropStringLength,
    propDefinitions,
    excludedPropTypes
  } = props;

  if (!type) {
    return null;
  }

  const includedPropDefinitions = determineIncludedPropTypes(
    propDefinitions,
    excludedPropTypes
  );

  if (includedPropDefinitions.length === 0) {
    return <small>No propTypes defined!</small>;
  }

  const propValProps = {
    maxPropObjectKeys,
    maxPropArrayLength,
    maxPropStringLength
  };

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.header}>property</th>
          <th style={styles.header}>propType</th>
          <th style={styles.header}>required</th>
          <th style={styles.header}>default</th>
          <th style={styles.header}>description</th>
        </tr>
      </thead>
      <tbody>
        {includedPropDefinitions.map(row => (
          <tr key={row.property}>
            <td style={styles.property}>{row.property}</td>
            <td style={styles.propType}>
              <PrettyPropType propType={row.propType} />
            </td>
            <td style={styles.required}>{row.required ? 'yes' : '-'}</td>
            <td style={styles.defaultValue}>
              {row.defaultValue === undefined ? (
                '-'
              ) : (
                <PropVal val={row.defaultValue} {...propValProps} />
              )}
            </td>
            <td style={styles.description}>{multiLineText(row.description)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

PropTable.displayName = 'PropTable';

PropTable.defaultProps = {
  type: null,
  propDefinitions: [],
  excludedPropTypes: []
};

PropTable.propTypes = {
  type: PropTypes.func,
  maxPropObjectKeys: PropTypes.number.isRequired,
  maxPropArrayLength: PropTypes.number.isRequired,
  maxPropStringLength: PropTypes.number.isRequired,
  excludedPropTypes: PropTypes.arrayOf(PropTypes.string),
  propDefinitions: PropTypes.arrayOf(
    PropTypes.shape({
      property: PropTypes.string.isRequired,
      propType: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
      required: PropTypes.bool,
      description: PropTypes.string,
      defaultValue: PropTypes.any
    })
  )
};
