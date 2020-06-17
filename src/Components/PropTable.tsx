import React from 'react';
import PrettyPropType from 'storybook-pretty-props';

import PropVal from './PropVal';
import { getName } from './utils';
import { Component, Property, DisplayOptions } from '../types';

const cell: React.CSSProperties = {
  paddingRight: 20,
  paddingTop: 15,
  paddingBottom: 15,
  verticalAlign: 'top',
  border: 'none'
};

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: '100%',
    margin: '2rem 0',
    borderCollapse: 'collapse'
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
    fontWeight: 500,
    color: '#FF4400'
  },
  propType: {
    ...cell,
    fontWeight: 500,
    maxWidth: '150px',
    overflow: 'auto',
    color: '#66BF3C'
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

export const multiLineText = (input?: string) => {
  if (!input) {
    return input;
  }

  const text = String(input);
  const arrayOfText = text.split(/\r?\n|\r/g);
  const isSingleLine = arrayOfText.length < 2;

  if (isSingleLine) {
    return text;
  }

  return arrayOfText.map((lineOfText, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <span key={`${lineOfText}.${i}`}>
      {i > 0 && <br />} {lineOfText}
    </span>
  ));
};

const determineIncludedPropTypes = (
  propDefinitions: Property[],
  excludedPropTypes: string[],
  type: Component
) => {
  if (excludedPropTypes.length === 0) {
    return propDefinitions;
  }

  const name = getName(type);

  return propDefinitions.filter(propDefinition => {
    const propertyName = propDefinition.property;
    const propertyNameAbsolute = `${name}.${propertyName}`;

    return !(
      excludedPropTypes.includes(propertyName) ||
      excludedPropTypes.includes(propertyNameAbsolute)
    );
  });
};

export type PropTableProps = DisplayOptions & {
  type?: Component;
  propDefinitions: Property[];
};

const PropTable = (props: PropTableProps) => {
  const {
    type,
    maxPropObjectKeys,
    maxPropArrayLength,
    maxPropStringLength,
    propDefinitions = [],
    excludedPropTypes = []
  } = props;

  if (!type) {
    return null;
  }

  const includedPropDefinitions = determineIncludedPropTypes(
    propDefinitions,
    excludedPropTypes,
    type
  );

  if (includedPropDefinitions.length === 0) {
    return <small>No propTypes defined!</small>;
  }

  const propValueProps = {
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
                <PropVal val={row.defaultValue} {...propValueProps} />
              )}
            </td>
            <td style={styles.description}>{multiLineText(row.description)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PropTable;
