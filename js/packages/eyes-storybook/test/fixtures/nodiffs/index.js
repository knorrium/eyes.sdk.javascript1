import React from 'react';
import { storiesOf } from '@storybook/react';
const randomNumber = Math.floor(Math.random() * 100);

storiesOf('NoDiff category', module)
  .add('NoDiff story - existing unresolved', () => <div>random content {randomNumber}</div>)