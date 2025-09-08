"use client";

import { useEffect, useMemo } from "react";
import { HttpRequest } from "@/utils/http-request";
import { jwtDecode } from "jwt-decode";
import { useParams, useRouter } from "next/navigation";

interface TokenPayload {
  _id: string;
}

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const httpRequest = useMemo(() => new HttpRequest(), []);

  useEffect(() => {
    const joinLessonPlan = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace(`/signin?redirect=/lesson-plan/invite/${id}`);
        return;
      }
      const decoded = jwtDecode<TokenPayload>(token);
      await httpRequest.inviteUserToLessonPlan(id, decoded._id);
      router.replace(`/lesson-plan/details/${id}`);
    };
    if (id) {
      joinLessonPlan();
    }
  }, [id, httpRequest, router]);

  return null;
}
