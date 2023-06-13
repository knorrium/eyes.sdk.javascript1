import React from 'react';
import { within, userEvent } from '@storybook/testing-library';

import { LoginForm } from './LoginForm';
import {Theme} from './Theme';

// Function to emulate pausing between interactions
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const clickSubmitDelay = 1000;
const sbVersion = process.env.APPLITOOLS_FRAMEWORK_VERSION || 'latest';
const isInteractionsCompetiable = sbVersion === 'latest' || sbVersion === 'next' || (parseFloat(sbVersion) >= 6.4);
const exports = {
  title: 'Examples/Login',
  component: LoginForm,
  args: {
    clickSubmitDelay,
    sbVersion,
  },
}
if(parseFloat(sbVersion) < 6.4) {
  exports.excludeStories = ['FilledForm']
}
export default exports
const Template = (args) => <LoginForm {...args} />;
export const EmptyForm = Template.bind({});
export const FilledForm = Template.bind({});
const themeTemplate = (args) => <Theme {...args} />;
export const MyTheme =  themeTemplate.bind({});
if (isInteractionsCompetiable){
  FilledForm.play = async ({ canvasElement }) => {
    // Starts querying the component from its root element
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByTestId('email'), 'email@example.com', {
      delay: 100,
    });
    await userEvent.type(canvas.getByTestId('password'), '12345678', {
      delay: 100,
    });
    await sleep(clickSubmitDelay);
    // See https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args to learn how to setup logging in the Actions panel
    await userEvent.click(canvas.getByRole('button'));
  };
}

