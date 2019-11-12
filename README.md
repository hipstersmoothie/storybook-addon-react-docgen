# storybook-addon-react-docgen

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://github.com/prettier/prettier) [![CircleCI](https://img.shields.io/circleci/project/github/hipstersmoothie/storybook-addon-react-docgen/master.svg?style=for-the-badge)](https://circleci.com/gh/hipstersmoothie/storybook-addon-react-docgen) [![npm](https://img.shields.io/npm/v/storybook-addon-react-docgen.svg?style=for-the-badge)](https://www.npmjs.com/package/storybook-addon-react-docgen) [![npm](https://img.shields.io/npm/dt/storybook-addon-react-docgen.svg?style=for-the-badge)](https://www.npmjs.com/package/storybook-addon-react-docgen)

A storybook addon to display react docgen info. This addon is a drop in replacement for the "info" addon's prop table functionality. Rather than rendering with the component it renders in the addons panel. Works with typescript too!

There exist other addons that do this, but they didn't work in the same way as the `info` addon. This resulted in complicated configuration changes. This plugin aims to be painless to switch to.

![Example Output](https://github.com/hipstersmoothie/storybook-addon-react-docgen/raw/master/example.png)

## Installation

```sh
yarn add storybook-addon-react-docgen
```

## React Docgen Integration

React Docgen is included as part of the @storybook/react package through the use of babel-plugin-react-docgen during babel compile time. When rendering a story with a React component commented in this supported format, the Addon Info description will render the comments above the component declaration and the prop table will display the prop's comment in the description column.

### Typescript

To use this plugin with a typescript project you need to install `react-docgen-typescript-loader`. You can either:

1. Install and add `react-docgen-typescript-loader` manually to your storybook webpack config
2. Use the official [storybook typescript preset](https://www.npmjs.com/package/@storybook/preset-typescript)

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
      propTablesExclude: [
        Other, // the actual component
        'Other' // the name of the component as a string
      ]
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
import * as React from "react";
export const Button: React.FC<ButtonProps> = () => {};

// Without "* as" you can only use like:
import React, { FC } from "react";
export const Button: FC<ButtonProps> = () => {};
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
const Card: React.FC<CardProps> = ({ size }) => (
  <div>{size}</div>
);

Card.defaultProps = {
  size: 'small'
};

// Size is optional to the user
const Usage = () => (
  <Card />
)
```

Without React.FC:

```tsx
interface CardProps {
  // Key part right here is to make the defaulted prop not optional
  // this way in your function it won't be undefined
  size: 'small' | 'large';
}

// The type of size will be "string"
const Card = ({ size }: CardProps) => (
  <div>{size}</div>
);

// Typescript can use this defaultProps to determine what is optional
// for the user of your component.
Card.defaultProps = {
  size: 'small'
};

// Size is optional to the user
const Usage = () => (
  <Card />
)
```

## Inspiration

Code heavily inspired by (copied from):

- [@storybook/addon-info](https://www.npmjs.com/package/@storybook/addon-info)
- [@storybook/addon-notes](https://www.npmjs.com/package/@storybook/addon-notes)
