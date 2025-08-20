"use client";

import { accessiblePath } from "@/shared/accessible-path";
import { FormDataSignUp } from "@/shared/interfaces/ISignUp";
import { usePathname, useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";
import { tokenValidator } from "@/utils/token-validator";

type AuthContextType = {
  accessToken: string | null;
  user: any | null;
  fetchDataUserInProgress: boolean;
  setAccessToken: (token: string | null) => void;
  fetcher: (input: RequestInfo, init?: RequestInit) => Promise<any>;
  refreshAccessToken: () => Promise<string | null>;
  fetchDataUser: () => Promise<boolean>;
  validateFormSignUp: (formData: FormDataSignUp) => string | null;
  validPassword: (pwd: string, confirmPwd: string) => string | null;
  verifyToken: (token: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [fetchDataUserInProgress, setFetchDataUserInProgress] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Verrou pour éviter les refresh multiples simultanés
  const isRefreshing = useRef(false);
  const refreshPromise = useRef<Promise<string | null> | null>(null);

  // Vérifie l'état de l'authentification au chargement
  const checkAuth = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        
        // Debug: Vérifier les cookies côté client
        // if (typeof document !== "undefined") {
        //   const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        //     const [key, value] = cookie.trim().split('=');
        //     acc[key] = value;
        //     return acc;
        //   }, {} as Record<string, string>);
          
        // }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const isJwtValid = (token: string) => {
    return tokenValidator.isValid(token);
  };

  const refreshAccessToken = useCallback(async () => {
    // Si un refresh est déjà en cours, attendre qu'il se termine
    if (isRefreshing.current && refreshPromise.current) {
      return await refreshPromise.current;
    }

    // Démarrer un nouveau refresh
    isRefreshing.current = true;
    const promise = (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-call": "true",
            },
            credentials: "include",
          }
        );

        if (!res.ok && !pathname.split("/").includes("sign-in")) {
          toast.error("Votre accès a expiré, veuillez vous reconnecter.", {
            position: "top-center",
          });

          if (typeof window !== "undefined") {
            setTimeout(() => {
              router.push("/sign-in");
            }, 4000);
          }
          throw new Error("Refresh failed");
        }

        const data = await res.json();
                
        setAccessToken(data.access_token);
        return data.access_token;
      } catch (err) {
        setAccessToken(null);
        return null;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    refreshPromise.current = promise;
    return await promise;
  }, [pathname, router]);

  const fetcher = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      let token = accessToken;
      if (!token || !isJwtValid(token)) {
        token = await refreshAccessToken();
        if (!token) {
          if (!pathname.split("/").includes("sign-in")) {
            toast.error("Votre session a expiré, veuillez vous reconnecter.", {
              position: "top-center",
            });

            if (typeof window !== "undefined") {
              setTimeout(() => {
                router.push("/sign-in");
              }, 4000);
            }
          }
        }
      }

      const res = await fetch(input, {
        ...init,
        headers: {
          ...(init.headers || {}),
        },
        credentials: "include",
      });

      // Créer un objet qui simule la Response avec les données
      const responseWrapper = {
        status: res.status,
        headers: res.headers,
        ok: res.ok,
        data: null as any,
      };

      // Gérer les erreurs d'authentification
      if (res.status === 401 || res.status === 403) {
        // Essayer de rafraîchir le token et retenter
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retenter la requête avec le nouveau token
          const retryRes = await fetch(input, {
            ...init,
            headers: {
              ...(init.headers || {}),
            },
            credentials: "include",
          });
          
          if (retryRes.ok) {
            try {
              const text = await retryRes.text();
              if (!text || text.trim() === "") {
                return responseWrapper;
              }
              responseWrapper.data = JSON.parse(text);
              responseWrapper.status = retryRes.status;
              responseWrapper.ok = retryRes.ok;
              return responseWrapper;
            } catch (parseError) {
              throw new Error("Invalid JSON response from server");
            }
          }
        }
        
        toast.error("Votre session a expiré, veuillez vous reconnecter.", {
          position: "top-center",
        });
        if (typeof window !== "undefined") {
          setTimeout(() => {
            router.push("/sign-in");
          }, 4000);
        }
        throw new Error("Authentication failed");
      }

      if (!res.ok) {
        throw new Error("Failed. Please try again.");
      }

      // Essayer de parser le JSON directement
      try {
        const text = await res.text();

        if (!text || text.trim() === "") {
          return responseWrapper;
        }

        responseWrapper.data = JSON.parse(text);
        return responseWrapper;
      } catch (parseError) {
        throw new Error("Invalid JSON response from server");
      }
    },
    [accessToken, refreshAccessToken, pathname, router]
  );

  const fetchDataUser = async () => {
    try {
      setFetchDataUserInProgress(true);
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
        {
          method: "GET",
        }
      );

      if (response.data?.user) {
        setUser(response.data.user);
        setFetchDataUserInProgress(false);
        return true;
      } else {
        console.error("No user data in response:", response);
        setFetchDataUserInProgress(false);
        return false;
      }
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setFetchDataUserInProgress(false);
      throw new Error(err.message || "An unexpected error occurred.");
    }
  };
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ token: token }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed. Please try again.");
      }
      return true;
    } catch (err: any) {
      throw new Error(err.message || "An unexpected error occurred.");
    }
  };
  const validateFormSignUp = (formData: FormDataSignUp) => {
    const {
      gender,
      firstname,
      lastname,
      pseudo,
      email,
      age,
      password,
      confirmPwd,
    } = formData;
    if (
      gender == undefined ||
      !firstname ||
      !lastname ||
      !pseudo ||
      !email ||
      !age ||
      !password ||
      !confirmPwd
    ) {
      return "All fields are required.";
    }
    validPassword(password, confirmPwd);
    return null;
  };
  const validPassword = (pwd: string, confirmPwd: string) => {
    if (!pwd) {
      return "Password is empty";
    }
    if (!confirmPwd) {
      return "Confirm password is empty";
    }
    if (pwd.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (pwd !== confirmPwd) {
      return "Passwords do not match.";
    }
    return null;
  };

  useEffect(() => {
    if (!accessiblePath.some((val) => pathname.split("/").includes(val))) {
      if (!(pathname.split("/").length > 2)) {
        if (!accessToken) {
          checkAuth();
        }
      }
    }
  }, []);

  // Nettoyer le cache des tokens périodiquement
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      tokenValidator.cleanupCache();
    }, 5 * 60 * 1000); // Toutes les 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        fetchDataUserInProgress,
        setAccessToken,
        fetcher,
        fetchDataUser,
        refreshAccessToken,
        validateFormSignUp,
        validPassword,
        verifyToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
