// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 👇 source map 꺼버림
config.transformer = {
  ...config.transformer,
  enableBabelRCLookup: false,
  sourceMap: false,
};

module.exports = config;
