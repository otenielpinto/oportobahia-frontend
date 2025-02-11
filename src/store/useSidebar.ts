import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSidebarStore = create(
  persist(
    (set) => ({
      data: {},
      setData: (value: any) =>
        set((state: any) => ({ data: { ...state.data, ...value } })),
    }),

    {
      name: "useSidebarStore", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
