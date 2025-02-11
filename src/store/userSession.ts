import { create } from "zustand";

export const useSessionStore = create((set) => ({
  id_empresa: 0,
  id_usuario: 0,
  id_tenant: 0,
  token: "",
  session: {},

  setIdempresa: (id: any) => set((state: any) => ({ id_empresa: id })),
  setIdusuario: (id: any) => set((state: any) => ({ id_usuario: id })),
  setIdtenant: (id: any) => set((state: any) => ({ id_tenant: id })),
  setToken: (token: any) => set((state: any) => ({ token: token })),
  setSession: (session: any) => set((state: any) => ({ session: session })),
}));
