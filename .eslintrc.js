module.exports = {
  extends: "universe/native",
  rules: {
    "react/jsx-no-bind": [
      0,
      {
        ignoreDOMComponents: false,
        ignoreRefs: false,
        allowArrowFunctions: true,
        allowFunctions: true,
        allowBind: true,
      },
    ],
  },
};
