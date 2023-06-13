import React from 'react';
import { LoginForm } from './LoginForm';
import { storiesOf } from '@storybook/react';

storiesOf('Login', module).add('EmptyForm', () => <LoginForm sbVersion={process.env.APPLITOOLS_FRAMEWORK_VERSION}/>);
