# storybook-addon-react-docgen

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://github.com/prettier/prettier) [![CircleCI](https://img.shields.io/circleci/project/github/hipstersmoothie/storybook-addon-react-docgen/master.svg?style=for-the-badge)](https://circleci.com/gh/hipstersmoothie/storybook-addon-react-docgen) [![npm](https://img.shields.io/npm/v/storybook-addon-react-docgen.svg?style=for-the-badge)](https://www.npmjs.com/package/storybook-addon-react-docgen) [![npm](https://img.shields.io/npm/dt/storybook-addon-react-docgen.svg?style=for-the-badge)](https://www.npmjs.com/package/storybook-addon-react-docgen)

A storybook addon to display react docgen info.
This addon is a drop in replacement for the "info" addon's prop table functionality.
Rather than rendering with the component it renders in the addons panel.
Works with typescript too!

There exist other addons that do this, but they didn't work in the same way as the `info` addon.
This resulted in complicated configuration changes.
This plugin aims to be painless to switch to.

![Example Output](https://github.com/hipstersmoothie/storybook-addon-react-docgen/raw/master/example.png)

## Installation

```sh
yarn add storybook-addon-react-docgen
```

## React Docgen Integration

React Docgen is included as part of the `@storybook/addon-docs` package.
If you are using `@storybook/addon-docs` then you do not need to set up docgen and can skip the next steps

### Typescript DocGen

To use this plugin with a typescript project you need to install [react-docgen-typescript-loader](https://github.com/strothj/react-docgen-typescript-loader) and configure webpack to use it.

### Javascript DocGen

To use this plugin with a javascript project you need to install [babel-plugin-react-docgen](https://github.com/storybookjs/babel-plugin-react-docgen)

## Usage

Add it in your `main.js` addons":

```js
module.exports = {
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs', 'storybook-addon-react-docgen']
};
```

Then add the `withPropsTable` decorator to your `preview.js`.
You can pass global options here if you want:

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

export default {
  title: 'Components/Button'
};

export const WithSomeEmoji = () => (
  <Component>
    <Other />
  </Component>
);

WithSomeEmoji.parameters: {
 props: {
   propTablesExclude: [
     Other // the actual component
   ]
 }
}
```

or for the entire story:

```js
import { storiesOf } from '@storybook/react';

import Other from './Other';
import Component from './Component';

export default {
  title: 'Components/Button',
  parameters: {
    props: {
      propTablesExclude: [
        Other // the actual component
      ]
    }
  }
};

export const WithSomeEmoji = () => (
  <Component>
    <Other />
  </Component>
);
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
   * Define custom sorting order for the components specifying component names in the desired order.
   * Example:
   * propTablesSortOrder: ["MyComponent", "FooComponent", "AnotherComponent"]
   * @default []
   */
  propTablesSortOrder: string,
  /**
   * Only include prop tables for these components.
   * Accepts an array of component classes or functions
   * @default null
   */
  propTablesInclude: Array<React.ComponentType | string>,
  /**
   * Exclude Components from being shown in Prop Tables section
   * Accepts an array of component classes or functions
   * @default []
   */
  propTablesExclude: Array<React.ComponentType | string>,
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
   * Will exclude any respective properties whose name is included in array.
   * Can also specify absolute propType to exclude (see example below)
   * Examples:
   * excludedPropTypes: ["message"] // propType to exclude
   * excludedPropTypes: ["MyComponent.message"] // absolute propType
   *
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

## FAQ

### Nothing shows up, this is broken!

The way that the packages implement docgen for react means that there are some limitations on how you can import things and write you components.

1. Must use default export + named export: The docgen will not be able to pick up a name for the default export so you must also use a named export

```ts
import * as React from "react";

interface ColorButtonProps {
  /** Buttons background color */
  color: "blue" | "green";
}

/** A button with a configurable background color. */
export const ColorButton: React.SFC<ColorButtonProps> = props => (
  <button {...props}>
);

export default ColorButton;
```

2. Imports Matter (TypeScript only): The way you import react and use it's types must conform to a few different formate

```tsx
// To get React.FC to work
import * as React from 'react';
export const Button: React.FC<ButtonProps> = () => {};

// Without "* as" you can only use like:
import React, { FC } from 'react';
export const Button: FC<ButtonProps> = () => {};
```

3. Usage within the story matter: This addon determines what components to display props for by finding all components used in the JSX returned by the story. So if you want prop-types to be displayed for a component, you **must** return that component in the story function.

```tsx
import React from 'react';
import { Button } from './Button';

export default {
  title: 'Button'
};

/** WILL NOT WORK */

// Since the usage of the component is not in the JSX
// returned by the story function no props are displayed
const MyFancyExample = () => {
  const [count, setCount] = React.useState(0);

  return (
    <Button
      primary={boolean('primary', false)}
      onClick={() => setCount(count + 1)}
    >
      "hello: " {count}
    </Button>
  );
};

export const BaseStory = () => <MyFancyExample />;

/** WILL WORK */

// The JSX returned by the story uses Button, so we will
// get the props types for button.
export const BaseStory = () => {
  const [count, setCount] = React.useState(0);

  return (
    <Button
      primary={boolean('primary', false)}
      onClick={() => setCount(count + 1)}
    >
      "hello: " {count}
    </Button>
  );
};
```

### Why are default props so hard to get right? (TypeScript only)

The `react` types are magical and you're probably doing too much. Using `React.FC` is the quickest way to ramp up the complexity of your components. Once you use that you lose the `defaultProps` experience.

**Using `React.FC`:**

```tsx
interface CardProps {
  size?: 'small' | 'large';
}

// The type of size will be "string | undefined"
// You will either have to repeat your default value
// Or write a helper type the figures out what is defaulted
const Card: React.FC<CardProps> = ({ size }) => <div>{size}</div>;

Card.defaultProps = {
  size: 'small'
};

// Size is optional to the user
const Usage = () => <Card />;
```

Without React.FC:

```tsx
interface CardProps {
  // Key part right here is to make the defaulted prop not optional
  // this way in your function it won't be undefined
  size: 'small' | 'large';
}

// The type of size will be "string"
const Card = ({ size }: CardProps) => <div>{size}</div>;

// Typescript can use this defaultProps to determine what is optional
// for the user of your component.
Card.defaultProps = {
  size: 'small'
};

// Size is optional to the user
const Usage = () => <Card />;
```

### My components extends from HTML elements and there are way too many props in the panel! How do I get rid of some?

You can add a filter to `react-docgen-typescript-loader` that will omit anything that comes from `@types/react`.s

```js
{
  loader: require.resolve('react-docgen-typescript-loader'),
  options: {
    tsconfigPath,
    propFilter(prop) {
      if (prop.parent) {
        return !prop.parent.fileName.includes('@types/react');
      }

      return true;
    }
  }
}
```

## Inspiration

Code heavily inspired by (copied from):

- [@storybook/addon-info](https://www.npmjs.com/package/@storybook/addon-info)
- [@storybook/addon-notes](https://www.npmjs.com/package/@storybook/addon-notes)
