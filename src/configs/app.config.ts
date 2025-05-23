export type AppConfig = {
  appName: string
  locale: string
  baseUrl: string
  authSecret: string
  authJwtAge: number
  backendApiUrl: string
  // backendApiKey: string
  persistKey: string
  bmkgApiUrl: string
}

const appConfig: AppConfig = {
  appName: 'ClimateSmart Indonesia',
  locale: 'en',
  baseUrl: 'http://localhost:3000',
  authSecret: 'IAADLu2Qu+xC4kteZfSUNOi5s/M6zSi7Z6tP85h4GBY=',
  authJwtAge: 1209600,
  backendApiUrl: 'http://localhost:5000',
  // backendApiKey: 'Yo5x0ZoGgqLOAZTJgDbIirbuNe2QBhnqVHnIOQT3JtxwMWDlJU1qDbmskAcpNMpg',
  persistKey: 'root',
  bmkgApiUrl: 'https://api.bmkg.go.id',
}

export default appConfig