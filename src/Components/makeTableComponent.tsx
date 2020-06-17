import React from 'react';
import * as PropTypes from 'prop-types';
import { PropTableProps } from './PropTable';
import { DocgenInfo, Component, Property } from '../types';

const PropTypesMap = new Map<typeof PropTypes[keyof typeof PropTypes] | PropTypes.Validator<any>, string>();

Object.keys(PropTypes).forEach(typeName => {
  const type = PropTypes[typeName as keyof typeof PropTypes];

  PropTypesMap.set(type, typeName);


  if (typeof type === 'function' && 'isRequired' in type && type.isRequired) {
    PropTypesMap.set(type.isRequired, typeName);
  }
});

const isNotEmpty = (component?: DocgenInfo) =>
  component?.props && Object.keys(component.props).length > 0;

const hasDocgen = (type: Component) => isNotEmpty(type.__docgenInfo);

const propsFromDocgen = (type: Component) => {
  const props: Record<string, Property> = {};
  const docgenInfoProps = type.__docgenInfo?.props || {};
  const defaults = type.defaultProps || {};

  Object.keys(docgenInfoProps).forEach(property => {
    const docgenInfoProp = docgenInfoProps[property];
    const defaultValueDesc =
      docgenInfoProp.defaultValue || { value: defaults[property] } || {};
    const propType = docgenInfoProp.flowType || docgenInfoProp.type;

    if (!propType) {
      return;
    }

    props[property] = {
      property,
      propType,
      required: docgenInfoProp.required,
      description: docgenInfoProp.description,
      defaultValue: defaultValueDesc.value
    };
  });

  return props;
};

const propsFromPropTypes = (type: Component) => {
  const props: Record<string, Property> = {};

  if (type.propTypes) {
    Object.keys(type.propTypes).forEach(property => {
      const typeInfo = type.propTypes[property];
      const required = typeInfo.isRequired === undefined;
      const docgenProp = type.__docgenInfo?.props?.[property];
      const description = docgenProp ? docgenProp.description : undefined;
      let propType = PropTypesMap.get(typeInfo);

      if (!propType && docgenProp?.type) {
        propType = docgenProp.type.name;
      }

      // @ts-expect-error
      props[property] = { property, propType, required, description };
    });
  }

  if (type.defaultProps) {
    Object.keys(type.defaultProps).forEach(property => {
      const value = type.defaultProps[property];

      if (value === undefined) {
        return;
      }

      if (!props[property]) {
        props[property] = { property };
      }

      props[property].defaultValue = value;
    });
  }

  return props;
};

export default function makeTableComponent(Component: React.ElementType) {
  return (props: Omit<PropTableProps, 'propDefinitions'>) => {
    const { type } = props;

    if (!type) {
      return null;
    }

    const propDefinitionsMap = hasDocgen(type)
      ? propsFromDocgen(type)
      : propsFromPropTypes(type);
    const propDefinitions = Object.values(propDefinitionsMap);

    return <Component propDefinitions={propDefinitions} {...props} />;
  };
}
