import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteDoctor, toggleDoctorStatus } from "@/lib/supabase/admin-actions";
import { DeleteButton } from "@/components/DeleteButton";
import { ToggleStatus } from "@/components/ToggleStatus";
import { ListFilters } from "@/components/ListFilters";

export default async function AdminDoctoresPage(props: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  let query = supabase.from("doctores").select("*");

  const status = searchParams?.status;
  if (status === "published") query = query.eq("publicado", true);
  else if (status === "draft") query = query.eq("publicado", false);

  const sort = searchParams?.sort ?? "newest";
  query = query.order("created_at", { ascending: sort === "oldest" });

  const { data: doctores } = await query;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Doctors
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage doctor profiles
          </p>
        </div>
        <Link
          href="/admin/doctores/nuevo"
          className="bg-primary text-on-primary font-label-bold text-label-bold px-5 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span> New
          Doctor
        </Link>
      </div>

      <div className="mb-4">
        <ListFilters />
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">
                Name
              </th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                Specialty
              </th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden sm:table-cell">
                Status
              </th>
              <th className="text-right font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {doctores?.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center font-body-md text-body-md text-on-surface-variant"
                >
                  No doctors yet.
                </td>
              </tr>
            )}
            {doctores?.map((d) => (
              <tr
                key={d.id}
                className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="font-body-md text-body-md text-on-surface">
                    {d.nombre}
                  </p>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-2.5 py-1 rounded-full">
                    {d.especialidad_principal}
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <ToggleStatus
                    id={String(d.id)}
                    published={d.publicado}
                    toggleAction={toggleDoctorStatus}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/doctores/${d.id}/editar`}
                      className="text-primary hover:text-primary-fixed-dim p-1.5"
                    >
                      <span className="material-symbols-outlined text-lg">
                        edit
                      </span>
                    </Link>
                    <DeleteButton
                      action={deleteDoctor.bind(null, String(d.id))}
                      label="Doctor"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
