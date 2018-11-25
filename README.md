# storybook-addon-react-docgen

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://github.com/prettier/prettier) [![CircleCI](https://img.shields.io/circleci/project/github/hipstersmoothie/storybook-addon-react-docgen/master.svg?style=for-the-badge)](https://circleci.com/gh/hipstersmoothie/storybook-addon-react-docgen) [![npm](https://img.shields.io/npm/v/storybook-addon-react-docgen.svg?style=for-the-badge)](https://www.npmjs.com/package/storybook-addon-react-docgen) [![npm](https://img.shields.io/npm/dt/storybook-addon-react-docgen.svg?style=for-the-badge)](https://www.npmjs.com/package/storybook-addon-react-docgen)

A storybook addon to display react docgen info.

![Example Output](https://github.com/hipstersmoothie/storybook-addon-react-docgen/raw/master/example.png)

## Installation

```sh
yarn add storybook-addon-react-docgen
```

## React Docgen Integration

React Docgen is included as part of the @storybook/react package through the use of babel-plugin-react-docgen during babel compile time. When rendering a story with a React component commented in this supported format, the Addon Info description will render the comments above the component declaration and the prop table will display the prop's comment in the description column.

### Typescript

To use this plugin with a typescript project you need to install `react-docgen-typescript-loader`

```sh
yarn add react-docgen-typescript-loader
```

Now add it to your webpack configuration.

The following is the configuration for a typescript project built using babel. If using just typescript to compile all you need to do is add the `react-docgen-typescript-loader` loader.

```js
const path = require('path');
const TSDocgenPlugin = require('react-docgen-typescript-loader');

module.exports = (baseConfig, env, config) => {
  // Find Babel Loader
  const babelRules = config.module.rules.filter(rule => {
    let isBabelLoader = false;

    if (rule.loader && rule.loader.includes('babel-loader')) {
      isBabelLoader = true;
    }

    if (rule.use) {
      rule.use.forEach(use => {
        if (typeof use === 'string' && use.includes('babel-loader')) {
          isBabelLoader = true;
        } else if (
          typeof use === 'object' &&
          use.loader &&
          use.loader.includes('babel-loader')
        ) {
          isBabelLoader = true;
        }
      });
    }

    return isBabelLoader;
  });

  // Add Typescript to Babel Loader Test
  // Add react-docgen-typescript-loader to rule
  babelRules.forEach(rule => {
    rule.test = /\.(jsx|js|ts|tsx)$/;
    rule.use.push({
      loader: require.resolve('react-docgen-typescript-loader')
    });
    // Remove babel docgen plugin (avoid duplicates)
    rule.use[0].options.plugins = rule.use[0].options.plugins.slice(0, 3);
  });

  config.resolve.extensions.push('.ts', '.tsx', '.json');

  return config;
};
```

## Usage

Create or add to a file called `addons.js` in your storybook config.

```js
import 'storybook-addon-react-docgen/register';
```

Then add the `withPropsTable` decorator to your `config.js`. You can pass global options here if you want:

```js
const { addDecorator } = require('@storybook/react');
const { withPropsTable } = require('storybook-addon-react-docgen');

addDecorator(withPropsTable(options));
// or
addDecorator(withPropsTable);
```

You can use the `props` parameter to configure the options for individual stories:

```js
import { storiesOf } from '@storybook/react';

import Other from './Other';
import Component from './Component';

storiesOf('Component', module).add(
  'with some emoji',
  () => (
    <Component>
      <Other />
    </Component>
  ),
  {
    props: {
      propTablesExclude: [Other]
    }
  }
);
```

or for the entire story:

```js
import { storiesOf } from '@storybook/react';

import Other from './Other';
import Component from './Component';

storiesOf('Component', module)
  .addParameters({
    props: {
      propTablesExclude: [Other]
    }
  })
  .add('with some emoji', () => (
    <Component>
      <Other />
    </Component>
  ));
```

## Configuration

```js
{
  /**
   * Components used in story
   * Displays Prop Tables with these components
   * @default []
   */
  propTables: Array<React.ComponentType>,
  /**
   * Exclude Components from being shown in Prop Tables section
   * Accepts an array of component classes or functions
   * @default []
   */
  propTablesExclude: Array<React.ComponentType>,
  /**
   * Overrides styles of addon. The object should follow this shape:
   * https://github.com/storybooks/storybook/blob/master/addons/info/src/components/Story.js#L19.
   * This prop can also accept a function which has the default stylesheet passed as an argument
   */
  styles: Object | Function,
  /**
   * Max props to display per line in source code
   * @default 3
   */
  maxPropsIntoLine: number,
  /**
   * Displays the first 10 characters of the prop name
   * @default 3
   */
  maxPropObjectKeys: number,
  /**
   * Displays the first 10 items in the default prop array
   * @default 3
   */
  maxPropArrayLength: number,
  /**
   * Displays the first 100 characters in the default prop string
   * @default 50
   */
  maxPropStringLength: number,
  /**
   * Override the component used to render the props table
   * @default PropTable
   */
  TableComponent: React.ComponentType,
  /**
   * Will exclude any respective properties whose name is included in array
   * @default []
   */
  excludedPropTypes: Array<string>,
}
```

### Rendering a Custom Table

The TableComponent option allows you to define how the prop table should be rendered. Your component will be rendered with the following props.

```js
{
  propDefinitions: Array<{
    property: string, // The name of the prop
    propType: Object | string, // The prop type. TODO: info about what this object is...
    required: boolean, // True if the prop is required
    description: string, // The description of the prop
    defaultValue: any // The default value of the prop
  }>
}
```

## Inspiration

Code heavily inspired by (copied from):

- [@storybook/addon-info](https://www.npmjs.com/package/@storybook/addon-info)
- [@storybook/addon-notes](https://www.npmjs.com/package/@storybook/addon-notes)
