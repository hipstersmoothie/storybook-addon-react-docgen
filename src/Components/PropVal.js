import React from 'react';
import PropTypes from 'prop-types';
import createFragment from 'react-addons-create-fragment';

const styles = {
  default: {
    color: '#1EA7FD',
    fontWeight: 700,
    wordBreak: 'break-word'
  },

  empty: {
    color: '#444'
  }
};

function indent(breakIntoNewLines, level, isBlock) {
  return (
    breakIntoNewLines && (
      <span>
        <br />
        {`${new Array(level).join('  ')}  `}
        {!isBlock && '  '}
      </span>
    )
  );
}

function PreviewArray({
  val,
  level,
  maxPropArrayLength,
  maxPropStringLength,
  maxPropsIntoLine
}) {
  const items = {};
  const breakIntoNewLines = val.length > maxPropsIntoLine;
  val.slice(0, maxPropArrayLength).forEach((item, i) => {
    items[`n${i}`] = (
      <span>
        {indent(breakIntoNewLines, level)}
        <PropVal
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
    items.last = (
      <span>
        {indent(breakIntoNewLines, level)}
        {'…'}
      </span>
    );
  } else {
    delete items[`c${val.length - 1}`];
  }

  return (
    <span style={styles.default}>
      [{createFragment(items)}
      {indent(breakIntoNewLines, level, true)}]
    </span>
  );
}

PreviewArray.propTypes = {
  val: PropTypes.any, // eslint-disable-line react/require-default-props
  maxPropArrayLength: PropTypes.number.isRequired,
  maxPropStringLength: PropTypes.number.isRequired,
  maxPropsIntoLine: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired
};

function PreviewObject({
  val,
  level,
  maxPropObjectKeys,
  maxPropStringLength,
  maxPropsIntoLine
}) {
  const names = Object.keys(val);
  const items = {};
  const breakIntoNewLines = names.length > maxPropsIntoLine;
  names.slice(0, maxPropObjectKeys).forEach((name, i) => {
    items[`k${i}`] = (
      <span>
        {indent(breakIntoNewLines, level)}
        <span style={styles.default}>{name}</span>
      </span>
    );
    items[`c${i}`] = ': ';
    items[`v${i}`] = (
      <PropVal
        val={val[name]}
        level={level + 1}
        maxPropStringLength={maxPropStringLength}
        maxPropsIntoLine={maxPropsIntoLine}
      />
    );
    items[`m${i}`] = ',';
  });
  if (names.length > maxPropObjectKeys) {
    items.rest = (
      <span>
        {indent(breakIntoNewLines, level)}
        {'…'}
      </span>
    );
  } else {
    delete items[`m${names.length - 1}`];
  }
  return (
    <span style={styles.default}>
      {'{'}
      {createFragment(items)}
      {indent(breakIntoNewLines, level, true)}
      {'}'}
    </span>
  );
}

PreviewObject.propTypes = {
  val: PropTypes.any, // eslint-disable-line react/require-default-props
  maxPropObjectKeys: PropTypes.number.isRequired,
  maxPropStringLength: PropTypes.number.isRequired,
  maxPropsIntoLine: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired
};

function PropVal(props) {
  const {
    level,
    maxPropObjectKeys,
    maxPropArrayLength,
    maxPropStringLength,
    maxPropsIntoLine
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
    content = (
      <span style={styles.default}>
        {`<${val.type.displayName || val.type.name || val.type} />`}
      </span>
    );
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
}

PropVal.defaultProps = {
  val: null,
  maxPropObjectKeys: 3,
  maxPropArrayLength: 3,
  maxPropStringLength: 50,
  maxPropsIntoLine: 3,
  level: 1
};

PropVal.propTypes = {
  val: PropTypes.any, // eslint-disable-line react/require-default-props
  maxPropObjectKeys: PropTypes.number,
  maxPropArrayLength: PropTypes.number,
  maxPropStringLength: PropTypes.number,
  maxPropsIntoLine: PropTypes.number,
  level: PropTypes.number
};

export default PropVal;
