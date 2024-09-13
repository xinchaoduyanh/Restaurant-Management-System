import { config } from 'dotenv'
config()
export const envConfig = {
  port: process.env.PORT ? process.env.PORT : 4000,
  host: process.env.HOST as string,
  clientUrl: process.env.CLIENT_URL as string,
  mongodbUri: process.env.MONGODB_URI as string
}
