import React from 'react';
import ReactDOM from 'react-dom/server';
import nestedObjectAssign from 'nested-object-assign';
import addons, { makeDecorator, StoryContext } from '@storybook/addons';

import Story, {
  getProps,
  PropTableType,
  StylingFunction,
  stylesheetBase
} from './Components/Story';
import makeTableComponent from './Components/makeTableComponent';
import { DisplayOptions, ComponentFilterType } from './types';

type DocgenTableOptions = DisplayOptions & {
  /**
   * Components used in story
   * Displays Prop Tables with these components
   * @default []
   */
  propTables: React.ComponentType[] | null;
  /**
   * Define custom sorting order for the components specifying component names in the desired order.
   * Example:
   * propTablesSortOrder: ["MyComponent", "FooComponent", "AnotherComponent"]
   * @default []
   */
  propTablesSortOrder?: string[];
  /**
   * Only include prop tables for these components.
   * Accepts an array of component classes or functions
   * @default null
   */
  propTablesInclude?: ComponentFilterType[];
  /**
   * Exclude Components from being shown in Prop Tables section
   * Accepts an array of component classes or functions
   * @default []
   */
  propTablesExclude?: ComponentFilterType[];
  /**
   * Overrides styles of addon. The object should follow this shape:
   * This prop can also accept a function which has the default stylesheet passed as an argument
   */
  styles: StylingFunction;
  /**
   * Override the component used to render the props table
   * @default PropTable
   */
  TableComponent: PropTableType;
};

const defaultOptions = {
  propTables: [],
  maxPropsIntoLine: 3,
  maxPropObjectKeys: 3,
  maxPropArrayLength: 3,
  maxPropStringLength: 50
};

function addPropsTable(
  storyFn: React.ReactElement,
  context: StoryContext,
  docGenOptions: DocgenTableOptions
) {
  const options = {
    ...defaultOptions,
    ...docGenOptions
  };

  // Props.propTables can only be either an array of components or null
  // propTables option is allowed to be set to 'false' (a boolean)
  // if the option is false, replace it with null to avoid react warnings
  if (!options.propTables) {
    options.propTables = null;
  }

  return {
    context,
    components: getProps({
      propTables: options.propTables,
      include: options.propTablesInclude,
      exclude: options.propTablesExclude,
      order: options.propTablesSortOrder,
      children: storyFn
    })
      .map(c => ({ ...c }))
      .filter(c => c && Object.keys(c).length),
    styles:
      typeof options.styles === 'function'
        ? options.styles
        : nestedObjectAssign({}, stylesheetBase, options.styles),
    propTables: (options.propTables || []).map(
      c => ({ ...c } as React.ComponentType)
    ),
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
    const storyOptions = (parameters || options) as DocgenTableOptions;
    const mergedOptions = { ...options, ...storyOptions };

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
}) as (options: DocgenTableOptions) => any;

export { default as Story } from './Components/Story';
