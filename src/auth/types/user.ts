export type User = {
  _id?: string | undefined;
  id?: string;
  email: string;
  password: string;
  name: string;
  isAdmin?: Number | 0 | 1;
  active?: Number | 0 | 1;
  id_empresa?: Number;
};
