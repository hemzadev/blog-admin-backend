// jest.config.js
module.exports = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    roots: ['<rootDir>/test'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    testMatch: ['**/*.spec.ts']
};