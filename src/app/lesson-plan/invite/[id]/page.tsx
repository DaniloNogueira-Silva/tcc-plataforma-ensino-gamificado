"use client";

import { useEffect, useState, useMemo } from "react";
import { HttpRequest } from "@/utils/http-request";
import useAuth from "@/hooks/useAuth";
import Button from "@/components/ui/button/Button";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface TokenPayload {
  _id: string;
}

export default function InvitePage({ params }: { params: { id: string } }) {
  useAuth();
  const router = useRouter();
  const { id } = params;
  const [planName, setPlanName] = useState<string>("");

  const httpRequest = useMemo(() => new HttpRequest(), []);

  useEffect(() => {
    const fetchPlan = async () => {
      const plan = await httpRequest.getLessonPlanById(id);
      setPlanName(plan?.name || "");
    };
    if (id) {
      fetchPlan();
    }
  }, [id, httpRequest]);

  const handleJoin = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwtDecode<TokenPayload>(token);
    await httpRequest.inviteUserToLessonPlan(id, decoded._id);
    router.push(`/lesson-plan/details/${id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-xl font-semibold">{planName}</h1>
      <Button onClick={handleJoin}>Entrar</Button>
    </div>
  );
}
