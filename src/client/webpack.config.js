const webpack = require('webpack');
const webpackConfig = require('@ionic/app-scripts/config/webpack.config');

const ionicEnv = ['prod', 'dev'];

const addPluginToWebpackConfig = (config, env) => {
  const plugins = config[env].plugins || [];

  config[env].plugins = [
    ...plugins,
    new webpack.EnvironmentPlugin({
      NODE_ENV: undefined
    }),
    new webpack.NormalModuleReplacementPlugin(/\.\/environments\/environment\.default/, function (resource) {
      if (process.env.NODE_ENV !== undefined) {
        var env = process.env.NODE_ENV;
        // console.log('Rewriting ', resource.request);
        resource.request = resource.request.replace(/\.\/environments\/environment\.default/, '\.\/environments/environment.' + env);
        // console.log('to        ', resource.request);
      } else {
        console.log('No environment specified. Using `default`');
      }
    })
  ];

  return config;
};

module.exports = () => {
  return ionicEnv.reduce(addPluginToWebpackConfig, webpackConfig);
};
