module.exports = {
  preset: "jest-expo",

  testEnvironmentOptions: {
    customExportConditions: ["node"],
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|msw|@mswjs|until-async|strict-event-emitter|headers-polyfill|outvariant|is-node-process|@open-draft))",
  ],

  collectCoverageFrom: [
    "src/modules/auth/viewmodels/auth-validation.ts",
    "src/modules/productos/viewmodels/product-filters.ts",
    "src/shared/adapters/validation.ts",
    "src/utils/format-price.ts",
    "src/utils/format-calendar-date.ts",
  ],

  coverageDirectory: "coverage",

  coverageReporters: ["text", "lcov"],
};
