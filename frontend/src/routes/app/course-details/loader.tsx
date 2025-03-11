export async function CourseDetailsLoader({
  params,
}: {
  params: { id: string }
}) {
  return params.id
}
