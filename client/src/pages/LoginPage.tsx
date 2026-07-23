import { Box, Button, FormControl, FormLabel, Input, Link, Text, VStack } from "@chakra-ui/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { useToastMessage } from "../hooks/useToastMessage";

export const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const toast = useToastMessage();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    let cancelled = false;
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;

    const initGoogle = () => {
      if (cancelled || !googleButtonRef.current || !window.google) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          try {
            const role = await googleLogin(credential);
            toast.success("Welcome back!", "Google sign-in completed.");
            navigate(role === "admin" ? "/admin" : "/", { replace: true });
          } catch (error: any) {
            toast.error("Couldn't sign you in with Google", error.response?.data?.message || "Please try again.");
          }
        }
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "pill"
      });
    };

    if (window.google) {
      initGoogle();
      return () => {
        cancelled = true;
      };
    }

    const script = existingScript || document.createElement("script");
    if (!existingScript) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else if (existingScript.dataset.loaded === "true") {
      initGoogle();
    } else {
      existingScript.addEventListener("load", initGoogle, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, [googleClientId, googleLogin, navigate, toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    console.log("[LOGIN PAGE] Form submitted");
    console.log("[LOGIN PAGE] Username:", username);
    console.log("[LOGIN PAGE] Password:", password ? "[PRESENT]" : "[MISSING]");
    
    setSubmitting(true);

    try {
      console.log("[LOGIN PAGE] Calling login function...");
      const role = await login(username, password);
      console.log("[LOGIN PAGE] ✓ Login successful, role:", role);
      toast.success("Welcome back!", "Your dashboard is ready.");
      navigate(role === "admin" ? "/admin" : "/", { replace: true });
    } catch (error: any) {
      console.error("[LOGIN PAGE] ✗ Login failed:", error);
      toast.error("Couldn't log you in", error.response?.data?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow="STUDENT TASK DASHBOARD" title="Login" subtitle="Welcome back. Enter your details to continue.">
      <VStack as="form" spacing={5} align="stretch" onSubmit={handleSubmit}>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. maya"
            size="lg"
            bg="gray.50"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            size="lg"
            bg="gray.50"
          />
        </FormControl>

        <Button type="submit" colorScheme="linkedin" size="lg" isLoading={submitting} w="full">
          Login
        </Button>

        <Box ref={googleButtonRef} minH="48px" w="full" />

        {!googleClientId ? (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Google sign-in is not configured.
          </Text>
        ) : null}

        <Text fontSize="sm" color="gray.500" textAlign="center">
          New user?{" "}
          <Link as={RouterLink} to="/signup" color="brand.600" fontWeight="700">
            Sign up
          </Link>
        </Text>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          Demo users: ava, liam, maya, noah with password password123
        </Text>
      </VStack>
    </AuthShell>
  );
};
