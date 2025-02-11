import { z } from "zod";

const userSchema = z.object({
  _id: z.string(),
  email: z.string(),
  name: z.string(),
  active: z.number(),
  isAdmin: z.number(),
  password: z.string(),
  id_empresa: z.number(),
});
export type User = z.infer<typeof userSchema>;
