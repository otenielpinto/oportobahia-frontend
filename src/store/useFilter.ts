import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useFilterStore = create(
  persist(
    (set) => ({
      formData: {},
      setFormData: (data: any) =>
        set((state: any) => ({ formData: { ...state.formData, ...data } })),
    }),

    {
      name: "useFilterStore", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

//https://github.com/pmndrs/zustand#middleware
