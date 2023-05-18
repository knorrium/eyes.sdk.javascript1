import {req} from '@applitools/req'

export async function fetchResource({resourceUrl}: {resourceUrl: string}): Promise<Buffer> {
  const response = await req(resourceUrl)
  return Buffer.from(await response.arrayBuffer())
}
