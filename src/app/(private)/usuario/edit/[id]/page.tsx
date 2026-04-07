import UsuarioForm from "@/components/usuario/UsuarioForm";
import { getUsuarioById } from "@/actions/usuarioAction";

interface EditUsuarioPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUsuarioPage({ params }: EditUsuarioPageProps) {
  const { id } = await params;
  const usuario = await getUsuarioById(id);

  if (!usuario) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <UsuarioForm isEdit usuario={usuario as any} />
    </div>
  );
}
