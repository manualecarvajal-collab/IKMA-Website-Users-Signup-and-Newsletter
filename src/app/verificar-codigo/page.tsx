import VerificarCodigoForm from "./VerificarCodigoForm"

export default async function VerificarCodigoPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return <VerificarCodigoForm initialEmail={email ?? ""} />
}
