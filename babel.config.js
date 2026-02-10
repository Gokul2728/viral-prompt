module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@store': './src/store',
            '@services': './src/services',
            '@theme': './src/theme',
            '@types': './src/types',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};
