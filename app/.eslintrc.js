/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  parser: 'babel-eslint',
  extends: [
    'plugin:react/recommended',
    'standard',
    'eslint-config-fbcnms',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    "semi": 0,
    "object-curly-spacing": 0,
    "space-before-function-paren": 0,
  }
}
