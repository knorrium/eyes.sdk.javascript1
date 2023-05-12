import forge from 'node-forge'
import crypto from 'crypto'

export async function generateCertificate({days = 1}: {days?: number} = {}): Promise<{key: string; cert: string}> {
  const keys = forge.pki.rsa.generateKeyPair(2048)
  const cert = forge.pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = '01' + crypto.randomBytes(19).toString('hex') // 1 octet = 8 bits = 1 byte = 2 hex chars
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * days)

  const attrs = [
    {name: 'countryName', value: 'AU'},
    {shortName: 'ST', value: 'Some-State'},
    {name: 'organizationName', value: 'Internet Widgits Pty Ltd'},
  ]
  cert.setSubject(attrs)
  cert.setIssuer(attrs)
  cert.setExtensions([{name: 'subjectAltName', altNames: []}])

  cert.sign(keys.privateKey)

  return {
    key: forge.pki.privateKeyToPem(keys.privateKey),
    cert: forge.pki.certificateToPem(cert),
  }
}
