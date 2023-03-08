import React from 'react';
import { within, userEvent } from '@storybook/testing-library';

import { LoginForm } from './LoginForm';

const exports = {
  title: 'Examples/:Exception in play function',
  component: LoginForm,
}

export default exports
export const Form = () => <LoginForm />;

Form.play = async ({ canvasElement }) => {
  // Starts querying the component from its root element
  const canvas = within(canvasElement);

  await userEvent.type(canvas.getByTestId('wrong-selector'), 'bla', {
    delay: 100,
  });
};


 