import {req} from '@applitools/req'

export async function fetchResource({resourceUrl}: {resourceUrl: string}): Promise<string> {
  const response = await req(resourceUrl)
  return Buffer.from(await response.arrayBuffer()).toString('base64')
}
