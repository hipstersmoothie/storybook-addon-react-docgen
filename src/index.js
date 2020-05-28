import React from 'react';
import ReactDOM from 'react-dom/server';
import nestedObjectAssign from 'nested-object-assign';
import addons, { makeDecorator } from '@storybook/addons';

import Story, { getProps } from './Components/Story';
import PropTable from './Components/PropTable';
import makeTableComponent from './Components/makeTableComponent';

const defaultOptions = {
  propTables: [],
  TableComponent: PropTable,
  maxPropsIntoLine: 3,
  maxPropObjectKeys: 3,
  maxPropArrayLength: 3,
  maxPropStringLength: 50
};

function addPropsTable(storyFn, context, infoOptions) {
  const options = {
    ...defaultOptions,
    ...infoOptions
  };

  // Props.propTables can only be either an array of components or null
  // propTables option is allowed to be set to 'false' (a boolean)
  // if the option is false, replace it with null to avoid react warnings
  if (!options.propTables) {
    options.propTables = null;
  }

  return {
    info: options.text,
    context,
    components: getProps(
      options.propTables,
      options.propTablesExclude,
      options.propTablesSortOrder,
      storyFn
    ),
    styles:
      typeof options.styles === 'function'
        ? options.styles
        : s => nestedObjectAssign({}, s, options.styles),
    propTables: options.propTables,
    propTablesExclude: options.propTablesExclude,
    propTablesSortOrder: options.propTablesSortOrder,
    PropTable: makeTableComponent(options.TableComponent),
    maxPropObjectKeys: options.maxPropObjectKeys,
    maxPropArrayLength: options.maxPropArrayLength,
    maxPropsIntoLine: options.maxPropsIntoLine,
    maxPropStringLength: options.maxPropStringLength,
    excludedPropTypes: options.excludedPropTypes
  };
}

export const withPropsTable = makeDecorator({
  name: 'withPropsTable',
  parameterName: 'props',
  allowDeprecatedUsage: true,
  wrapper: (getStory, context, { options, parameters }) => {
    const channel = addons.getChannel();
    const storyOptions = parameters || options;
    const propsTableOptions =
      typeof storyOptions === 'string' ? { text: storyOptions } : storyOptions;
    const mergedOptions =
      typeof propsTableOptions === 'string'
        ? propsTableOptions
        : { ...options, ...propsTableOptions };

    const content = getStory(context);
    const res = addPropsTable(content, context, mergedOptions);

    channel.emit(
      'storybook/PropsTable/add_PropsTable',
      ReactDOM.renderToString(<Story {...res}>{content}</Story>)
    );

    return content;
  }
});

export { Story };
