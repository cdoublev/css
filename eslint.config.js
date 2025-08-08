
import base from '@cdoublev/eslint-config'
import jest from '@cdoublev/eslint-config/jest'
import node from '@cdoublev/eslint-config/node'

export default [base, jest, node, { ignores: ['lib/cssom/*.js', '!lib/cssom/*-impl.js'] }]
