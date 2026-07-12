import { Button, FormControl, FormLabel, Input, Link, Select, Text, VStack } from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { useToastMessage } from "../hooks/useToastMessage";

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToastMessage();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "student">("student");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    console.log("[SIGNUP PAGE] Form submitted");
    console.log("[SIGNUP PAGE] Form data:", {
      name: name ? `[${name}]` : "[EMPTY]",
      username: username ? `[${username}]` : "[EMPTY]",
      registerNumber: registerNumber ? `[${registerNumber}]` : "[EMPTY]",
      password: password ? "[PRESENT]" : "[MISSING]",
      role: `[${role}]`
    });
    
    setSubmitting(true);

    try {
      console.log("[SIGNUP PAGE] Calling signup function...");
      await signup({ name, username, registerNumber, password, role });
      console.log("[SIGNUP PAGE] ✓ Signup successful");
      toast.success("Account created", "You can log in now.");
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("[SIGNUP PAGE] ✗ Signup failed:", error);
      console.error("[SIGNUP PAGE] Error status:", error.response?.status);
      console.error("[SIGNUP PAGE] Error message:", error.response?.data?.message || "Unknown error");
      toast.error("Couldn't create your account", error.response?.data?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow="CREATE ACCOUNT" title="Sign up" subtitle="Create your account and choose the role you need.">
      <VStack as="form" spacing={5} align="stretch" onSubmit={handleSubmit}>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" size="lg" bg="gray.50" />
        </FormControl>

        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" size="lg" bg="gray.50" />
        </FormControl>

        <FormControl>
          <FormLabel>Register Number</FormLabel>
          <Input
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
            placeholder="e.g. STU102"
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
            placeholder="At least 6 characters"
            size="lg"
            bg="gray.50"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Role</FormLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value as "admin" | "student")} size="lg" bg="gray.50">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </Select>
        </FormControl>

        <Button type="submit" colorScheme="purple" size="lg" isLoading={submitting}>
          Create Account
        </Button>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          Already have an account?{" "}
          <Link as={RouterLink} to="/login" color="brand.600" fontWeight="700">
            Login
          </Link>
        </Text>
      </VStack>
    </AuthShell>
  );
};
