"use client";

import Button from "@/components/ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Link from "next/link";
import Notification from "@/components/ui/notification/Notification";
import React from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();
  const [notification, setNotification] = React.useState<{
    variant: "error" | "success";
    title: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const httpRequest = new HttpRequest();

    try {
      const login = await httpRequest.login(email, password);

      if (login) {
        setNotification({
          variant: "success",
          title: "Login bem-sucedido! Redirecionando...",
        });
        router.push("/lesson-plan");
      }
    } catch (error) {
      console.error("Login falhou:", error);
      setNotification({
        variant: "error",
        title: "Erro ao realizar login. Verifique suas credenciais.",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Fazer login na plataforma
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Insira seu email e senha para entrar!
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Senha <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={"password"}
                      placeholder="Insira sua senha"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Entrar
                  </Button>
                </div>
              </div>
            </form>

            {notification && (
              <Notification variant={notification.variant} title={notification.title} />
            )}

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Não possui uma conta? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
