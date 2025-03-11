export async function ExtraDetailsLoader({
  params,
}: {
  params: { id: string }
}) {
  return params.id
}
