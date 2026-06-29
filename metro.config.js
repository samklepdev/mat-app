const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude web-only modules from native bundling
config.resolver.blockList = [/expo-sqlite\/web\/.*/];

module.exports = config;
