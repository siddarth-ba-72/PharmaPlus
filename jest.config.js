module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/backend'],
    testMatch: ['**/test/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    verbose: true,
};