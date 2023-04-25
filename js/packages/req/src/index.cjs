export function makeReq(baseOption) {
  return async (input, ...options) => {
    const {req} = await import('./index.js')
    return req(input, baseOption, ...options)
  }
}

export async function req(input, ...options) {
  const {req} = await import('./index.js')
  return req(input, ...options)
}

export default req
