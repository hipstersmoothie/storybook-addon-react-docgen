/* eslint no-underscore-dangle: 0 */

import React from 'react';
import { getName } from './utils';
import PropTable, { PropTableProps } from './PropTable';
import { ComponentFilterType, Component } from '../types';
import makeTableComponent from './makeTableComponent';

const getDescription = (type: Component) =>
  type.__docgenInfo?.description;

interface GetPropsOptions {
  propTables?: React.ComponentType[] | null;
  order?: string[];
  include?: ComponentFilterType[];
  exclude?: ComponentFilterType[];
  children: React.ReactElement;
}

export const getProps = ({
  propTables,
  include,
  exclude,
  order,
  children
}: GetPropsOptions) => {
  const types = new Map();

  if (propTables === null) {
    return [];
  }

  if (propTables) {
    propTables.forEach(type => {
      types.set(type, true);
    });
  }

  const propTableCompare = (
    element: any,
    Component: React.ComponentType | string
  ) => {
    // https://github.com/gaearon/react-hot-loader#checking-element-types
    // @ts-expect-error
    // eslint-disable-next-line no-undef
    if (typeof reactHotLoaderGlobal !== 'undefined') {
      // @ts-expect-error
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
  const extract = (innerChild: React.ReactElement) => {
    if (!innerChild) {
      return;
    }

    if (Array.isArray(innerChild)) {
      innerChild.forEach(c => extract(c));
      return;
    }

    if (innerChild.props?.children) {
      extract(innerChild.props.children);
    }

    if (
      typeof innerChild === 'string' ||
      typeof innerChild.type === 'string' ||
      (Array.isArray(exclude) && // Also ignore excluded types
        exclude.some(Comp => propTableCompare(innerChild, Comp)))
    ) {
      return;
    }

    if (innerChild.type && !types.has(innerChild.type)) {
      if (
        !include ||
        include.some(Comp => propTableCompare(innerChild, Comp))
      ) {
        types.set(innerChild.type, true);
      }
    }
  };

  // Extract components from children
  extract(children);

  const array = [...types.keys()];

  if (order && Array.isArray(order) && order.length > 0) {
    array.sort((a, b) => {
      const nameA = getName(a);
      const nameB = getName(b);
      const sA = order.indexOf(nameA);
      const sB = order.indexOf(nameB);

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
  } else {
    array.sort((a, b) => getName(a).localeCompare(getName(b)));
  }

  return array as Component[];
};

export const stylesheetBase: Record<
  'infoBody' | 'h1' | 'propTableHead' | 'description' | 'infoPage',
  React.CSSProperties
> = {
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
  description: {},
  infoPage: {},
};

export type PropTableStyleSheet = typeof stylesheetBase;
export type PropTableType = React.ComponentType<
  Omit<PropTableProps, 'propDefinitions'>
>;
export type StylingFunction = (
  styles: PropTableStyleSheet
) => PropTableStyleSheet;

type StoryProps = {
  PropTable: PropTableType;
  propTables?: React.ComponentType[] | null;
  styles: StylingFunction;
  components?: Component[];
  maxPropObjectKeys: number;
  maxPropArrayLength: number;
  maxPropStringLength: number;
  excludedPropTypes?: string[];
};

const getPropTables = (
  props: Omit<StoryProps, 'styles'>,
  stylesheet: PropTableStyleSheet
) => {
  const {
    components = [],
    maxPropObjectKeys,
    maxPropArrayLength,
    maxPropStringLength,
    excludedPropTypes,
    PropTable
  } = props;
  const { propTables } = props;

  if (propTables === null) {
    return null;
  }

  const componentPropTables = components.map((type, i) => {
    const description = getDescription(type);

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div key={`${getName(type)}_${i}`}>
        <h2 style={stylesheet.propTableHead}>
          &ldquo;{getName(type)}&rdquo; Component
        </h2>

        {description && <p style={stylesheet.description}>{description}</p>}

        <PropTable
          type={type}
          maxPropObjectKeys={maxPropObjectKeys}
          maxPropArrayLength={maxPropArrayLength}
          maxPropStringLength={maxPropStringLength}
          excludedPropTypes={excludedPropTypes}
        />
      </div>
    );
  });

  if (!componentPropTables || componentPropTables.length === 0) {
    return null;
  }

  return (
    <div>
      <h1 style={stylesheet.h1}>Prop Types</h1>
      {componentPropTables}
    </div>
  );
};

const Story = ({ styles, ...props }: StoryProps) => {
  const [stylesheet] = React.useState(typeof styles === 'function' ? styles(stylesheetBase): styles);

  return (
    <div>
      <div style={stylesheet.infoPage}>
        <div style={stylesheet.infoBody}>
          {getPropTables(props, stylesheet)}
        </div>
      </div>
    </div>
  );
};

Story.defaultProps = {
  PropTable: makeTableComponent(PropTable),
  excludedPropTypes: []
};

export default Story;
