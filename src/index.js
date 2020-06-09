import React from 'react';
import ReactDOM from 'react-dom/server';
import nestedObjectAssign from 'nested-object-assign';
import addons, { makeDecorator } from '@storybook/addons';

import Story, { getProps, stylesheetBase } from './Components/Story';
import PropTable from './Components/PropTable';
import makeTableComponent from './Components/makeTableComponent';

const defaultOptions = {
  propTables: [],
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
    components: getProps({
      propTables: options.propTables,
      include: options.propTablesInclude,
      exclude: options.propTablesExclude,
      order: options.propTablesSortOrder,
      children: storyFn
    }).map(c => ({ ...c })),
    styles:
      typeof options.styles === 'function'
        ? options.styles
        : nestedObjectAssign({}, stylesheetBase, options.styles),
    propTables: options.propTables.map(c => ({ ...c })),
    propTablesInclude: options.propTablesInclude,
    propTablesExclude: options.propTablesExclude,
    propTablesSortOrder: options.propTablesSortOrder,
    ...(options.TableComponent && {
      PropTable: makeTableComponent(options.TableComponent)
    }),
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
    const response = addPropsTable(content, context, mergedOptions);

    const shouldLegacyRender = Boolean(mergedOptions.TableComponent);

    if (shouldLegacyRender) {
      channel.emit('storybook/PropsTable/add_PropsTable', {
        legacy: ReactDOM.renderToString(<Story {...response} />)
      });
    } else {
      channel.emit('storybook/PropsTable/add_PropsTable', response);
    }

    return content;
  }
});

export { Story };
