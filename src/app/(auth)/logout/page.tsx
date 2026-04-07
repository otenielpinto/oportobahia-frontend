"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Página de logout com design minimalista e mensagem positiva
 * Aguarda 1 segundo e automaticamente finaliza a sessão do usuário
 */
export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const router = useRouter();

  useEffect(() => {
    /**
     * Aguarda 1 segundo e depois destroi a sessão do usuário via API route
     */
    const controller = new AbortController();
    let isMounted = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        // Finaliza a sessão do usuário via API route
        const response = await fetch("/api/logout", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Falha ao finalizar sessão: ${response.status}`);
        }

        if (isMounted) {
          setIsLoggingOut(false);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Erro ao finalizar sessão:", error);

        if (isMounted) {
          setIsLoggingOut(false);
          // Mesmo com erro, redireciona para o login por segurança
          router.push("/sign-in");
        }
      }
    }, 1000);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Ícone de sucesso */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Mensagem principal */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {isLoggingOut
              ? "Finalizando sessão..."
              : "Logout realizado com sucesso!"}
          </h1>

          <p className="text-slate-600 text-lg">
            Obrigado por usar nossa plataforma. Esperamos vê-lo novamente em
            breve! 🚛
          </p>

          <p className="text-sm text-slate-500">
            {isLoggingOut
              ? "Aguarde enquanto finalizamos sua sessão com segurança..."
              : "Sua sessão foi encerrada com segurança."}
          </p>

          {/* Indicador de loading */}
          {isLoggingOut && (
            <div className="flex justify-center pt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Botões de ação - só aparecem após finalizar o logout */}
        {!isLoggingOut && (
          <div className="space-y-3 pt-6">
            <Link
              href="/sign-in"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Fazer login novamente
            </Link>

            <Link
              href="/"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Voltar ao início
            </Link>
          </div>
        )}

        {/* Mensagem adicional */}
        <div className="pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400">Tenha um ótimo dia! ✨</p>
        </div>
      </div>
    </div>
  );
}
