
export const development = typeof process === 'object' && process.env.NODE_ENV === 'development'

export const test = typeof process === 'object' && process.env.NODE_ENV === 'test'
