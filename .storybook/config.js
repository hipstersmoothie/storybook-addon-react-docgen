import { configure, setAddon, addDecorator } from '@storybook/react';
import { withPropsTable } from '../dist';

addDecorator(withPropsTable);

configure(
  require.context(
    '../stories',
    true,
    /^\.\/((?!node_modules).)*\.stories\.(tsx|ts|js|jsx|mdx)$/
  ),
  module
);
