import VerificarCodigoForm from "./VerificarCodigoForm"

export default async function VerificarCodigoPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; flow?: string; tipo?: string; region?: string }>
}) {
  const { email, flow, tipo, region } = await searchParams

  return (
    <VerificarCodigoForm
      initialEmail={email ?? ""}
      flow={flow ?? "recovery"}
      initialTipo={tipo ?? ""}
      initialRegion={region ?? ""}
    />
  )
}
