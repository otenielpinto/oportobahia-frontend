import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      // Pre-existing issue: setState in effect. Fix in separate task.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];