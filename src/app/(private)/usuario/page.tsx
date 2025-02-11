"use client";

import { useServerAction } from "zsa-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { User } from "@/auth/types/user";
import { updateUser, deleteUser, getAllUsers } from "@/actions/actUsuario";
import { getAllEmpresaSimples } from "@/actions/actIntegracao";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companiesList, setCompaniesList] = useState<any[]>([]);

  const getHandleClick = async () => {
    const [data, err] = (await getAllUsers()) as any[];
    if (err) {
      console.log(err);
    } else {
      setUsers(data);
      setCompaniesList(await getAllEmpresaSimples());
    }
  };

  useEffect(() => {
    getHandleClick();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleDelete = async (id: string) => {
    const r: any = await deleteUser({ _id: id });
    if (r.err) {
      toast.error(r.err);
    } else {
      toast.success("Usuário deletado com sucesso ");
    }

    await getHandleClick();
  };

  const handleSave = async (user: User) => {
    if (user?._id) {
      user.id_empresa = Number(user.id_empresa);
      user._id = user._id ?? "";
      const [data, err] = await updateUser({
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: Number(user.isAdmin),
        active: Number(user.active),
        password: user.password,
        id_empresa: Number(user.id_empresa),
      });

      if (err) {
        toast.error(
          "Erro ao atualizar usuário" + JSON.stringify(err.fieldErrors)
        );
      } else {
        await getHandleClick();
        toast.success("Usuário atualizado com sucesso ");
      }
    }

    setEditingUser(null);
    setIsDialogOpen(false); // Close the dialog after saving
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Pesquisar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {/* <Button
              onClick={() => {
                setEditingUser({
                  email: "",
                  name: "",
                  active: 1,
                  isAdmin: 0,
                  password: "",
                  id_empresa: 0,
                });
                setIsDialogOpen(true);
              }}
            >
              Novo Usuário
            </Button> */}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser?._id ? "Editar Usuario" : "Novo Usuário"}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={editingUser}
              onSave={handleSave}
              companiesList={companiesList}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Cod.Loja</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user: any) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.active ? "Sim" : "Nao"}</TableCell>
              <TableCell>{user.isAdmin ? "Sim" : "Nao"}</TableCell>
              <TableCell>{user.id_empresa}</TableCell>
              <TableCell>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        handleEdit(user);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Alterando Usuário</DialogTitle>
                    </DialogHeader>
                    <UserForm
                      user={editingUser}
                      onSave={handleSave}
                      companiesList={companiesList}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user._id!)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface UserFormProps {
  user: User | null;
  onSave: (user: User) => void;
  companiesList: any[];
}

function UserForm({ user, onSave, companiesList }: UserFormProps) {
  const [formData, setFormData] = useState<User>(
    user || {
      email: "",
      name: "",
      active: 1,
      isAdmin: 0,
      password: "",
      id_empresa: 1,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
            ? 1
            : 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as User);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required={!user?.id}
        />
      </div>

      <div>
        <Label htmlFor="id_empresa">Cód.Loja</Label>
        <Select
          value={formData.id_empresa as any}
          onValueChange={(e) =>
            setFormData({ ...formData, id_empresa: Number(e) })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Selecione uma Empresa" />
          </SelectTrigger>
          <SelectContent>
            {companiesList.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.codigo + " - " + company.descricao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="active"
          name="active"
          checked={formData.active === 1}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, active: checked ? 1 : 0 }))
          }
        />
        <Label htmlFor="active">Active</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isAdmin"
          name="isAdmin"
          checked={formData.isAdmin === 1}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isAdmin: checked ? 1 : 0 }))
          }
        />
        <Label htmlFor="isAdmin">Admin</Label>
      </div>
      <Button type="submit">Gravar</Button>
    </form>
  );
}
