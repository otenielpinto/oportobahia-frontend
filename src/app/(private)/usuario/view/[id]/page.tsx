import UsuarioView from "@/components/usuario/UsuarioView";
import { getUsuarioById } from "@/actions/usuarioAction";

interface ViewUsuarioPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewUsuarioPage({
  params,
}: ViewUsuarioPageProps) {
  const { id } = await params;
  const usuario = await getUsuarioById(id);

  if (!usuario) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <UsuarioView usuario={usuario as any} />
    </div>
  );
}
