//import { getServerSession } from "next-auth";
import { ReactNode } from "react";

import SideNav from "@/components/sidebar";
import { Suspense } from "react";

interface PrivateLayoutProps {
  children: ReactNode;
}

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <>
      {/*
      className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
      */}
      <div className="flex h-screen flex-col lg:flex-row">
        <aside>
          <Suspense>
            <SideNav />
          </Suspense>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/*
              # coloca uma borda 
              className="flex items-center justify-center rounded-lg border border-dashed shadow-sm"
            x-chunk="dashboard-02-chunk-1"
            */}
          <Suspense>{children}</Suspense>
        </main>

        {/*
         posso criar novas section aqui 
        */}
      </div>
    </>
  );
}

//olhar o projeto desenvolvido com Daniel sobre os elementos de uma pagina template com o projeto onFood ;
