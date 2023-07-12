/** @type {import('jest').Config} */
module.exports = {
  rootDir: ".",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // TODO: should we change the TS errors to warnOnly?
        // diagnostics: {
        //   warnOnly: true
        // }
      },
    ],
    "^.+\\.jsx?$": "babel-jest",
  },
  // config for moduleNameMapper based on paths configured in tsconfig.paths.json
  moduleNameMapper: {
    "^libs/(.*)$": "<rootDir>/libs/$1",
    "^services/(.*)$": "<rootDir>/services/$1",
    "^infra-assets/(.*)$": "<rootDir>/infra-assets/$1",
    "^external-infra/(.*)$": "<rootDir>/external-infra/$1",
  },
};
