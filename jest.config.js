module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { isolatedModules: true, diagnostics: false },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-modules-core|@unimodules/.*|unimodules|@react-navigation)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
