import React from 'react';
import nestedObjectAssign from 'nested-object-assign';
import PropTypes from 'prop-types';
import addons from '@storybook/addons';

import PropTable from './Components/PropTable';
import makeTableComponent from './Components/makeTableComponent';
import Story from './Components/Story';

const defaultOptions = {
  propTables: [],
  TableComponent: PropTable,
  maxPropsIntoLine: 3,
  maxPropObjectKeys: 3,
  maxPropArrayLength: 3,
  maxPropStringLength: 50
};
export class PropsTable extends React.Component {
  constructor(...args) {
    super(...args);
    console.log('props table');
    this.state = { text: '' };
    this.onAddPropsTable = this.onAddPropsTable.bind(this);
  }

  componentDidMount() {
    const { channel, api } = this.props;
    // Listen to the PropsTable and render it.
    channel.on('storybook/PropsTable/add_PropsTable', this.onAddPropsTable);

    // Clear the current PropsTable on every story change.
    this.stopListeningOnStory = api.onStory(() => {
      this.onAddPropsTable('');
    });
  }

  // This is some cleanup tasks when the PropsTable panel is unmounting.
  componentWillUnmount() {
    if (this.stopListeningOnStory) {
      this.stopListeningOnStory();
    }

    this.unmounted = true;
    const { channel } = this.props;
    channel.removeListener(
      'storybook/PropsTable/add_PropsTable',
      this.onAddPropsTable
    );
  }

  onAddPropsTable(text) {
    this.setState({ text });
  }

  render() {
    const { active } = this.props;
    const { text } = this.state;

    console.log({ text });
    return active ? (
      <div
        style={{ padding: 10, boxSizing: 'border-box', width: '100%' }}
        className="addon-PropsTable-container"
      >
        {text && text}
      </div>
    ) : null;
  }
}

PropsTable.propTypes = {
  active: PropTypes.bool.isRequired,
  channel: PropTypes.shape({
    on: PropTypes.func,
    emit: PropTypes.func,
    removeListener: PropTypes.func
  }).isRequired,
  api: PropTypes.shape({
    onStory: PropTypes.func,
    getQueryParam: PropTypes.func,
    setQueryParams: PropTypes.func
  }).isRequired
};

addons.register('storybook/props', api => {
  const channel = addons.getChannel();
  console.log('here');
  addons.addPanel('storybook/props/panel', {
    title: 'Props',
    // eslint-disable-next-line react/prop-types
    render: ({ active }) => (
      <PropsTable channel={channel} api={api} active={active} />
    )
  });
});
