/* eslint no-underscore-dangle: 0 */

import React, { Component } from 'react';
import { polyfill } from 'react-lifecycles-compat';
import PropTypes from 'prop-types';

const getName = type => type.displayName || type.name;
const getDescription = type =>
  type.__docgenInfo && type.__docgenInfo.description;

export const getProps = (propTables, propTablesExclude, propTablesSortOrder, children) => {
  const types = new Map();

  if (propTables === null) {
    return null;
  }

  if (propTables) {
    propTables.forEach(type => {
      types.set(type, true);
    });
  }

  const propTableCompare = (element, Component) => {
    // https://github.com/gaearon/react-hot-loader#checking-element-types
    // eslint-disable-next-line no-undef
    if (typeof reactHotLoaderGlobal !== 'undefined') {
      // eslint-disable-next-line no-undef
      if (reactHotLoaderGlobal.areComponentsEqual(element.type, Component)) {
        return true;
      }
    }

    if (element.type === Component) {
      return true;
    }

    if (
      element.type &&
      typeof element.type &&
      element.type.name === Component
    ) {
      return true;
    }
    
    if (
      element.type &&
      typeof element.type &&
      element.type.displayName === Component
    ) {
      return true;
    }

    return false;
  };

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
        propTablesExclude.some(Comp => propTableCompare(innerChildren, Comp)))
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
  
  if (propTablesSortOrder && Array.isArray(propTablesSortOrder) && propTablesSortOrder.length > 0) {
    array.sort((a, b) => {
      const nameA = getName(a);
      const nameB = getName(b);
      const sA = propTablesSortOrder.indexOf(nameA);
      const sB = propTablesSortOrder.indexOf(nameB);
      if (sA === -1 && sB === -1) {
        return nameA.localeCompare(nameB);
      }
      
      if (sA === -1) {
        return 1;
      }
      
      if (sB === -1) {
        return -1;
      }
      
      return sA - sB;
    });
  }
  else {
    array.sort((a, b) => getName(a).localeCompare(getName(b)));
  }

  return array;
};

const stylesheetBase = {
  infoBody: {
    fontWeight: 300,
    lineHeight: 1.45,
    fontSize: '15px',
    padding: '20px 40px 40px',
    borderRadius: '2px',
    marginTop: '20px',
    marginBottom: '20px'
  },
  h1: {
    margin: '20px 0 0 0',
    padding: '0 0 5px 0',
    fontSize: '25px',
    borderBottom: '1px solid #EEE'
  },
  propTableHead: {
    margin: '20px 0 0 0',
    fontSize: 20
  },
  description: {}
};

class Story extends Component {
  static displayName = 'Story';

  static propTypes = {
    propTables: PropTypes.arrayOf(PropTypes.func),
    styles: PropTypes.func.isRequired,
    components: PropTypes.array.isRequired,
    maxPropObjectKeys: PropTypes.number.isRequired,
    maxPropArrayLength: PropTypes.number.isRequired,
    maxPropStringLength: PropTypes.number.isRequired,
    excludedPropTypes: PropTypes.arrayOf(PropTypes.string)
  };

  static defaultProps = {
    propTables: null,
    excludedPropTypes: []
  };

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

    propTables = components.map((type, i) => {
      const description = getDescription(type);
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`${getName(type)}_${i}`}>
          <h2 style={stylesheet.propTableHead}>
            &ldquo;{getName(type)}&rdquo; Component
          </h2>
          {description && <p style={stylesheet.description}>{description}</p>}
          <this.props.PropTable
            type={type}
            maxPropObjectKeys={maxPropObjectKeys}
            maxPropArrayLength={maxPropArrayLength}
            maxPropStringLength={maxPropStringLength}
            excludedPropTypes={excludedPropTypes}
          />
        </div>
      );
    });

    if (!propTables || propTables.length === 0) {
      return null;
    }

    return (
      <div>
        <h1 style={stylesheet.h1}>Prop Types</h1>
        {propTables}
      </div>
    );
  }

  render() {
    return this._renderInline();
  }
}

polyfill(Story);

export default Story;
