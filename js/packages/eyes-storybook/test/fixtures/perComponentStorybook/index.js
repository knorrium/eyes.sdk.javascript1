import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Single category', module).add(
  'Story with local browser config',
  () => {
    return <div style={{width: 50, height: 50}}>single story</div>;
  },
  {eyes: {browser: [{name: 'chrome', width: 1024, height: 600}]}},
);
