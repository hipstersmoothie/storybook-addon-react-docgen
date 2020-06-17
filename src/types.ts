import { PropTypeValue } from 'storybook-pretty-props';

export interface PropertyType {
  name: string;
}

export interface Property {
  property: string;
  propType?: PropTypeValue;
  required?: boolean;
  description?: string;
  defaultValue?: any;
  flowType?: PropertyType;
  type?: PropertyType;
}

export interface DocgenInfo {
  displayName: string;
  description: string;
  props: Record<string, Property>;
}

export interface Component {
  displayName?: string;
  name?: string;
  defaultProps: Record<string, any>;
  propTypes: Record<string, any>;
  __docgenInfo?: DocgenInfo;
}

export interface DisplayOptions {
  /**
   * Displays the first 100 characters in the default prop string
   * @default 50
   */
  maxPropStringLength?: number;
  /**
   * Max props to display per line in source code
   * @default 3
   */
  maxPropsIntoLine?: number;
  /**
   * Displays the first 10 characters of the prop name
   * @default 3
   */
  maxPropObjectKeys?: number;
  /**
   * Displays the first 10 items in the default prop array
   * @default 3
   */
  maxPropArrayLength?: number;
  /**
   * Will exclude any respective properties whose name is included in array.
   * Can also specify absolute propType to exclude (see example below)
   * Examples:
   * excludedPropTypes: ["message"] // propType to exclude
   * excludedPropTypes: ["MyComponent.message"] // absolute propType
   *
   * @default []
   */
  excludedPropTypes?: string[];
}

export type ComponentFilterType = React.ComponentType | string;