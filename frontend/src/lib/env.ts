import { z } from 'zod'

const envSchema = z.object({
  REACT_APP_API_URL: z.string().url(),
})

const parsedEnv = envSchema.safeParse({
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
})

if (!parsedEnv.success) {
  console.log('Invalid env variables', parsedEnv.error.flatten().fieldErrors)

  throw new Error('Invalid env variables')
}

export const env = parsedEnv.data
