import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Fake auth story', module).add('Story with fake auth', () => {
  return (
    <div id="div1">
      <iframe src="http://localhost:7272"></iframe>
    </div>
  );
});
