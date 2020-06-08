const { addDecorator } = require('@storybook/react');
const { withPropsTable } = require('../src');

addDecorator(withPropsTable);
