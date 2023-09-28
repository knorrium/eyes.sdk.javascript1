import React from 'react';
import { storiesOf } from '@storybook/react';

// the contents of this page are for demonstration purposes
storiesOf('dom-mapping', module).add('dom-mapping page', () => {
  const styles = `
    .qwerty {
      --zxcv: blue;
    }
    .abcd {
      padding: 60px;
      background: var(--zxcv);
    }
  `
  return <>
    <div class="abcd qwerty">hi there</div>
    <style>
      {styles}
    </style>
  </>
})
