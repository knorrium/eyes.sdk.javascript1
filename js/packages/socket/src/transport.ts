export interface Transport<TSocket, TConnectOptions = never> {
  onReady(socket: TSocket, callback: () => void): void
  onMessage(socket: TSocket, callback: (data: Uint8Array | string) => void): void
  onError(socket: TSocket, callback: (reason: any) => void): void
  onClose(socket: TSocket, callback: () => void): void
  isReady(socket: TSocket): boolean
  send(socket: TSocket, data: Uint8Array | string): void
  format(data: Uint8Array | string): Uint8Array | string
  connect?(options: TConnectOptions): TSocket
  destroy?(socket: TSocket): void
  ref?(socket: TSocket): void
  unref?(socket: TSocket): void
}
