import { env } from '@/lib/env'
import axios from 'axios'

export const api = axios.create({
  baseURL: env.REACT_APP_API_URL,
})
