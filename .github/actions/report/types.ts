export interface Report {
  title?: string
  duration: number
  failed: Test[]
  skipped: Test[]
  passed: Test[]
}

export interface Test {
  title: string
  url: string
  path: string
  duration: number
  error?: {
    message: string
    stack: string
  }
}

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
