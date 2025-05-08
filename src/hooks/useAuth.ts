"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/signin');
    }
  }, [router]);
};

export default useAuth;
