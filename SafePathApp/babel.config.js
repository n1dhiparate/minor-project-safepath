module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "@babel/plugin-transform-template-literals",
      "@babel/plugin-transform-optional-chaining",
      "@babel/plugin-transform-nullish-coalescing-operator",
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
