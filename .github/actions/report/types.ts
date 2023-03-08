export interface JSONReport {
  stats: {
    suites: number
    tests: number
    passes: number
    pending: number
    failures: number
    duration: number
  },
  pending: JSONTest[]
  failures: JSONTest[]
  passes: JSONTest[]
}

export interface JSONTest {
  title: string
  fullTitle: string
  file: string
  duration: number
  err?: {
    message: string
    stack: string
  }
}
