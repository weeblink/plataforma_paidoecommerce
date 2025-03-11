import { api } from '@/services/api'
import { json, type Params } from 'react-router-dom'

export default async function ResetPasswordLoader({
  params,
}: {
  params: Params<string>
}) {

  try{

    await api.post("/password/reset/is-valid-token", { token: params.token });

    return json({ token: params.token }, { status: 200 })

  }catch( err: any ){
    throw new Response('Link inválido', { status: 403 })
  }
}
