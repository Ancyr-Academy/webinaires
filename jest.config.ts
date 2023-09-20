export default {
  collectCoverage: false,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '^((?!int|e2e).)*.test.ts$',
  coverageDirectory: '../coverage',
  coverageProvider: 'v8',
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  rootDir: 'src',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
        isolatedModules: true,
        jsx: 'react',
        target: 'es2017',
        allowJs: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@ancyr/(.*)$': '<rootDir>/modules/$1',
    '^src/(.*)$': '<rootDir>/$1',
  },
};
