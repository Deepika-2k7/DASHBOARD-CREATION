import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  IconButton,
  Text,
  VStack,
  useDisclosure
} from "@chakra-ui/react";
import { PropsWithChildren, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface MenuItem {
  key: string;
  label: string;
}

interface ShellProps extends PropsWithChildren {
  menuItems: MenuItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const Shell = ({ children, menuItems, activeKey, onSelect, title, subtitle, actions }: ShellProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menu = useDisclosure();
  const displayName = user?.username?.toUpperCase() || "STUDENT";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sidebarContent = (
    <VStack align="stretch" spacing={2} h="full">
      {menuItems.map((item) => (
        <Button
          key={item.key}
          justifyContent="flex-start"
          variant={item.key === activeKey ? "solid" : "ghost"}
          colorScheme={item.key === activeKey ? "purple" : "gray"}
          borderRadius="xl"
          onClick={() => {
            onSelect(item.key);
            menu.onClose();
          }}
        >
          {item.label}
        </Button>
      ))}
      <Box flex="1" />
      <Button justifyContent="flex-start" variant="outline" colorScheme="red" borderRadius="xl" onClick={handleLogout}>
        Logout
      </Button>
    </VStack>
  );

  return (
    <Box minH="100vh" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }} bgGradient="linear(to-b, whiteAlpha.500, transparent)">
      <Flex
        align="center"
        justify="space-between"
        mb={6}
        px={{ base: 3, md: 5 }}
        py={4}
        bg="whiteAlpha.900"
        border="1px solid"
        borderColor="whiteAlpha.700"
        borderRadius="28px"
        boxShadow="0 18px 40px rgba(95, 149, 251, 0.12)"
      >
        <HStack spacing={3}>
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            variant="outline"
            borderRadius="full"
            display={{ base: "inline-flex", md: "none" }}
            onClick={menu.onOpen}
          />
          <Box>
            <Heading size="md">{title || "Task Glow"}</Heading>
            <Text color="gray.500" fontSize="sm">
              Welcome, {displayName} 👋
            </Text>
          </Box>
        </HStack>

        <HStack spacing={3}>
          {actions}
          <Avatar name={user?.name || user?.username} bg="brand.500" color="white" />
          <Box display={{ base: "none", md: "block" }}>
            <Text fontWeight="700">{displayName}</Text>
            <Text fontSize="sm" color="gray.500" textTransform="capitalize">
              {subtitle || user?.role}
            </Text>
          </Box>
        </HStack>
      </Flex>

      <Flex gap={6} align="start">
        <Box
          display={{ base: "none", md: "block" }}
          w="280px"
          position="sticky"
          top="24px"
          bg="whiteAlpha.900"
          border="1px solid"
          borderColor="whiteAlpha.700"
          borderRadius="28px"
          p={4}
          boxShadow="0 18px 40px rgba(95, 149, 251, 0.12)"
          minH="calc(100vh - 140px)"
        >
          <Text fontSize="sm" fontWeight="800" color="brand.600" letterSpacing="widest" mb={4}>
            MENU
          </Text>
          {sidebarContent}
        </Box>

        <Box flex="1" minW={0}>
          {children}
        </Box>
      </Flex>

      <Drawer isOpen={menu.isOpen} placement="left" onClose={menu.onClose}>
        <DrawerOverlay />
        <DrawerContent borderTopRightRadius="24px" borderBottomRightRadius="24px">
          <DrawerBody pt={8}>
            <Text fontSize="sm" fontWeight="800" color="brand.600" letterSpacing="widest" mb={4}>
              MENU
            </Text>
            {sidebarContent}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
