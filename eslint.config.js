
import base from '@cdoublev/eslint-config'
import node from '@cdoublev/eslint-config/node'

export default [base, node, { ignores: ['lib/cssom/*.js', '!lib/cssom/*-impl.js'] }]
