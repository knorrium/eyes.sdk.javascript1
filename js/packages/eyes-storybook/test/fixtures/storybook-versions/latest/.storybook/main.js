module.exports = {
  "stories": [
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  framework: {
    options: {
      builder: 'webpack5'
    },
    name: '@storybook/react-webpack5',
  },
}