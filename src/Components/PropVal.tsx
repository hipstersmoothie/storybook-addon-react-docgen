import React from 'react';
import { DisplayOptions } from '../types';

const styles: Record<string, React.CSSProperties> = {
  default: {
    color: '#1EA7FD',
    fontWeight: 700,
    wordBreak: 'break-word'
  },

  empty: {
    color: '#444'
  }
};

const indent = (breakIntoNewLines: boolean, level: number, isBlock?: boolean) =>
  breakIntoNewLines && (
    <span>
      <br />
      <span style={{ width: level * 10, display: 'inline-block' }} />
      {!isBlock && '  '}
    </span>
  );

type PreviewProps<T> = Pick<
  DisplayOptions,
  | 'maxPropArrayLength'
  | 'maxPropObjectKeys'
  | 'maxPropStringLength'
  | 'maxPropsIntoLine'
> & {
  val: T;
  level?: number;
};

type PreviewArrayProps = Required<
  Omit<PreviewProps<any[]>, 'maxPropObjectKeys'>
>;

const PreviewArray = ({
  val,
  level,
  maxPropArrayLength,
  maxPropStringLength,
  maxPropsIntoLine
}: PreviewArrayProps) => {
  const items: Record<string, React.ReactNode> = {};
  const breakIntoNewLines = val.length > maxPropsIntoLine;

  val.slice(0, maxPropArrayLength).forEach((item, i) => {
    items[`n${i}`] = (
      <span>
        {indent(breakIntoNewLines, level)}
        <PropValue
          val={item}
          level={level + 1}
          maxPropStringLength={maxPropStringLength}
          maxPropsIntoLine={maxPropsIntoLine}
        />
      </span>
    );
    items[`c${i}`] = ',';
  });

  if (val.length > maxPropArrayLength) {
    items.last = <span>{indent(breakIntoNewLines, level)}…</span>;
  } else {
    delete items[`c${val.length - 1}`];
  }

  return (
    <span style={styles.default}>
      [
      {Object.values(items)}
      {indent(breakIntoNewLines, level, true)}
      ]
    </span>
  );
};

type PreviewObjectProps = Required<
  Omit<PreviewProps<Record<string, any>>, 'maxPropArrayLength'>
>;

const PreviewObject = ({
  val,
  level,
  maxPropObjectKeys,
  maxPropStringLength,
  maxPropsIntoLine
}: PreviewObjectProps) => {
  const names = Object.keys(val);
  const items: Record<string, React.ReactNode> = {};
  const breakIntoNewLines =
    names.length > maxPropsIntoLine ||
    Object.values(val).find(v => typeof v === 'object');

  names.slice(0, maxPropObjectKeys).forEach((name, i) => {
    items[`k${i}`] = (
      <span>
        {indent(breakIntoNewLines, level)}
        <span style={styles.default}>{name}</span>
      </span>
    );
    items[`c${i}`] = ': ';
    items[`v${i}`] = (
      <PropValue
        val={val[name]}
        level={level + 1}
        maxPropStringLength={maxPropStringLength}
        maxPropsIntoLine={maxPropsIntoLine}
      />
    );
    items[`m${i}`] = ',';
  });

  if (names.length > maxPropObjectKeys) {
    items.rest = <span>{indent(breakIntoNewLines, level)}…</span>;
  } else {
    delete items[`m${names.length - 1}`];
  }

  return (
    <>
      {'{ '}
      <span style={styles.default}>
        {Object.values(items)}
        {indent(breakIntoNewLines, level, true)}
      </span>
      {' }'}
    </>
  );
};

const PropValue = (props: PreviewProps<any>) => {
  const {
    level = 1,
    maxPropObjectKeys = 3,
    maxPropArrayLength = 3,
    maxPropStringLength = 50,
    maxPropsIntoLine = 3
  } = props;
  let { val } = props;
  let content = null;

  if (typeof val === 'number') {
    content = <span style={styles.default}>{val}</span>;
  } else if (typeof val === 'string') {
    if (val.length > maxPropStringLength) {
      val = `${val.slice(0, maxPropStringLength)}…`;
    }

    if (level > 1) {
      val = `'${val}'`;
    }

    content = <span style={styles.default}>{val}</span>;
  } else if (typeof val === 'boolean') {
    content = <span style={styles.default}>{`${val}`}</span>;
  } else if (Array.isArray(val)) {
    content = (
      <PreviewArray
        val={val}
        level={level}
        maxPropArrayLength={maxPropArrayLength}
        maxPropStringLength={maxPropStringLength}
        maxPropsIntoLine={maxPropsIntoLine}
      />
    );
  } else if (typeof val === 'function') {
    content = <span style={styles.default}>{val.name || 'anonymous'}</span>;
  } else if (!val) {
    content = <span style={styles.default}>{`${val}`}</span>;
  } else if (typeof val !== 'object') {
    content = <span>…</span>;
  } else if (React.isValidElement(val)) {
    // @ts-expect-error
    const name = val.displayName || val.name || val;

    content = <span style={styles.default}>{`<${name} />`}</span>;
  } else {
    content = (
      <PreviewObject
        val={val}
        level={level}
        maxPropObjectKeys={maxPropObjectKeys}
        maxPropStringLength={maxPropStringLength}
        maxPropsIntoLine={maxPropsIntoLine}
      />
    );
  }

  return content;
};

export default PropValue;
