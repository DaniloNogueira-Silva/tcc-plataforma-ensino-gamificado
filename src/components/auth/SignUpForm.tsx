"use client";

import { HttpRequest } from "@/utils/http-request";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Link from "next/link";
import Notification from "@/components/ui/notification/Notification";
import React from "react";
import Select from "../form/Select";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUpForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [notification, setNotification] = React.useState<{
    variant: "error" | "success";
    title: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const options = [
    { value: "TEACHER", label: "Professor" },
    { value: "STUDENT", label: "Aluno" },
  ];

  const handleSelectChange = (value: string) => {
    setRole(value);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const httpRequest = new HttpRequest();

    try {
      await httpRequest.createUser(email, password, name, role);
      await httpRequest.login(email, password);

      setNotification({
        variant: "success",
        title: "Usuário criado com sucesso! Redirecionando...",
      });
      router.push(redirect || "/lesson-plan");

    } catch (error) {
      console.error("Criação de usuário falhou:", error);
      setNotification({
        variant: "error",
        title: "Erro ao criar usuário. Verifique suas credenciais.",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Criar conta
            </h1>
          </div>
          <div>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Nome<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Nome do usuário"
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>Selecione sua posição</Label>
                    <Select
                      options={options}
                      placeholder="Escolha..."
                      onChange={handleSelectChange}
                      className="dark:bg-dark-900"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>
                  Email<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Insira seu email"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div>
                <Label>
                  Senha<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Insira sua senha"
                    type={"password"}
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
              </div>
              <div className="mt-5">
                <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                  Cadastrar
                </button>
              </div>
            </form>
            
            {notification && (
              <Notification variant={notification.variant} title={notification.title} />
            )}

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Já possui uma conta?
                <Link
                  href={
                    redirect
                      ? `/signin?redirect=${encodeURIComponent(redirect)}`
                      : "/signin"
                  }
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
