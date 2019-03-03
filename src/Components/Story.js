/* eslint no-underscore-dangle: 0 */

import React, { Component } from 'react';
import { polyfill } from 'react-lifecycles-compat';
import PropTypes from 'prop-types';
import { baseFonts } from '@storybook/components';

const getName = type => type.displayName || type.name;

export const getProps = (propTables, propTablesExclude, children) => {
  const types = new Map();

  if (propTables === null) {
    return null;
  }

  if (propTables) {
    propTables.forEach(type => {
      types.set(type, true);
    });
  }

  // Depth-first traverse and collect types
  const extract = innerChildren => {
    if (!innerChildren) {
      return;
    }
    if (Array.isArray(innerChildren)) {
      innerChildren.forEach(extract);
      return;
    }
    if (innerChildren.props && innerChildren.props.children) {
      extract(innerChildren.props.children);
    }
    if (
      typeof innerChildren === 'string' ||
      typeof innerChildren.type === 'string' ||
      (Array.isArray(propTablesExclude) && // Also ignore excluded types
        (~propTablesExclude.indexOf(innerChildren.type) || // eslint-disable-line no-implicit-coercion
          (typeof innerChildren.type === 'function' &&
            propTablesExclude.indexOf(innerChildren.type.name) > -1))) // eslint-disable-line no-implicit-coercion
    ) {
      return;
    }
    if (innerChildren.type && !types.has(innerChildren.type)) {
      types.set(innerChildren.type, true);
    }
  };

  // Extract components from children
  extract(children);

  const array = [...types.keys()];
  array.sort((a, b) => getName(a) > getName(b));

  return array;
};

const stylesheetBase = {
  infoBody: {
    ...baseFonts,
    fontWeight: 300,
    lineHeight: 1.45,
    fontSize: '15px',
    border: '1px solid #eee',
    padding: '20px 40px 40px',
    borderRadius: '2px',
    backgroundColor: '#fff',
    marginTop: '20px',
    marginBottom: '20px'
  },
  infoStory: {},
  source: {
    h1: {
      margin: '20px 0 0 0',
      padding: '0 0 5px 0',
      fontSize: '25px',
      borderBottom: '1px solid #EEE'
    }
  },
  propTableHead: {
    margin: '20px 0 0 0'
  }
};

class Story extends Component {
  state = {
    stylesheet: this.props.styles(stylesheetBase)
  };

  _renderInline() {
    const { stylesheet } = this.state;

    return (
      <div>
        <div style={stylesheet.infoPage}>
          <div style={stylesheet.infoBody}>{this._getPropTables()}</div>
        </div>
      </div>
    );
  }

  _getPropTables() {
    const {
      components,
      maxPropObjectKeys,
      maxPropArrayLength,
      maxPropStringLength,
      excludedPropTypes
    } = this.props;
    let { propTables } = this.props;
    const { stylesheet } = this.state;

    if (propTables === null) {
      return null;
    }

    propTables = components.map((type, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={`${getName(type)}_${i}`}>
        <h2 style={stylesheet.propTableHead}>
          &ldquo;{getName(type)}&rdquo; Component
        </h2>
        <this.props.PropTable
          type={type}
          maxPropObjectKeys={maxPropObjectKeys}
          maxPropArrayLength={maxPropArrayLength}
          maxPropStringLength={maxPropStringLength}
          excludedPropTypes={excludedPropTypes}
        />
      </div>
    ));

    if (!propTables || propTables.length === 0) {
      return null;
    }

    return (
      <div>
        <h1 style={stylesheet.source.h1}>Prop Types</h1>
        {propTables}
      </div>
    );
  }

  render() {
    return this._renderInline();
  }
}

Story.displayName = 'Story';

Story.propTypes = {
  propTables: PropTypes.arrayOf(PropTypes.func),
  // eslint-disable-next-line react/no-unused-prop-types
  styles: PropTypes.func.isRequired,
  components: PropTypes.array.isRequired,
  maxPropObjectKeys: PropTypes.number.isRequired,
  maxPropArrayLength: PropTypes.number.isRequired,
  maxPropStringLength: PropTypes.number.isRequired,
  excludedPropTypes: PropTypes.arrayOf(PropTypes.string)
};

Story.defaultProps = {
  propTables: null,
  excludedPropTypes: []
};

polyfill(Story);

export default Story;
