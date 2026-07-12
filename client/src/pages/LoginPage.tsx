import { Button, FormControl, FormLabel, Input, Link, Text, VStack } from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { useToastMessage } from "../hooks/useToastMessage";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToastMessage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

        <Button type="submit" colorScheme="linkedin" size="lg" isLoading={submitting}>
          Login
        </Button>

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
