import VerificarCodigoForm from "./VerificarCodigoForm"

export default async function VerificarCodigoPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; flow?: string }>
}) {
  const { email, flow } = await searchParams

  return <VerificarCodigoForm initialEmail={email ?? ""} flow={flow ?? "recovery"} />
}
