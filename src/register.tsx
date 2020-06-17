/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import addons from '@storybook/addons';
import { STORY_CHANGED } from '@storybook/core-events';
import { Channel } from '@storybook/channels';
import { API } from '@storybook/api';
import Story from './Components/Story';

interface PropsTableProps {
  active: boolean;
  channel: Channel;
  api: API;
  legacy: string;
}

export const PropsTable = (props: PropsTableProps) => {
  const [data, dataSet] = React.useState<any>(null);

  React.useEffect(() => {
    const { channel, api } = props;

    // Listen to the PropsTable and render it.
    channel.on('storybook/PropsTable/add_PropsTable', dataSet);

    // Clear the current PropsTable on every story change.
    api.on(STORY_CHANGED, dataSet);

    return () => {
      const { channel, api } = props;
      api.off(STORY_CHANGED, dataSet);

      channel.removeListener(
        'storybook/PropsTable/add_PropsTable',
        dataSet
      );
    };
  });

  const { active, legacy } = props;

  if (legacy) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{legacy}</>;
  }

  return active && data && typeof data !== 'string' ? (
    <div
      style={{ padding: 10, boxSizing: 'border-box', width: '100%' }}
      className="addon-PropsTable-container"
    >
      <Story {...data} />
    </div>
  ) : null;
};

PropsTable.defaultProps = {
  legacy: ''
};

addons.register('storybook/props', api => {
  const channel = addons.getChannel();

  addons.addPanel('storybook/props/panel', {
    title: 'Props',
    render: ({ active }) => (
      <PropsTable
        key="storybook-addon-react-docgen"
        channel={channel}
        api={api}
        active={active}
      />
    )
  });
});
