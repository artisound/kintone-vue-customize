export const GOOGLE_API = {
  authAPIEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  analyticsAPIEndpoint: 'https://www.googleapis.com/analytics/v3/data/realtime',
  apyKey: process.env.GCP_API_KEY,
  clientId: process.env.GCP_CLIENT_ID,
  scope: 'https://www.googleapis.com/auth/analytics.readonly',
}