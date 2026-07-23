import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

export interface ResourceItem {
  _id: string;
  title: string;
  fileUrl: string;
  resourceType: "pdf" | "link" | "poll";
  fileName?: string;
  fileType?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface ResourceListProps {
  resources: ResourceItem[];
  onDelete?: (resourceId: string) => void;
  title?: string;
}

const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const ResourceList = ({ resources, onDelete, title = "Resources" }: ResourceListProps) => {
  const previewModal = useDisclosure();
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const hasResources = useMemo(() => resources.length > 0, [resources.length]);

  const openResource = (resource: ResourceItem) => {
    if (resource.resourceType === "pdf") {
      setSelectedResource(resource);
      previewModal.onOpen();
      return;
    }

    if (resource.fileUrl) {
      openInNewTab(resource.fileUrl);
    }
  };

  const modalTitle = selectedResource?.fileName || selectedResource?.title || "PDF preview";

  return (
    <>
      <Box>
        <Heading size="md" mb={4}>
          {title}
        </Heading>
        {hasResources ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {resources.map((resource) => (
              <Card key={resource._id}>
                <CardBody>
                  <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="start" gap={4}>
                    <Box flex="1" minW={0}>
                      <Button
                        variant="link"
                        colorScheme="linkedin"
                        fontSize="md"
                        fontWeight="700"
                        onClick={() => openResource(resource)}
                        h="auto"
                        p={0}
                        justifyContent="flex-start"
                        whiteSpace="normal"
                        textAlign="left"
                        wordBreak="break-word"
                      >
                        {resource.title}
                      </Button>
                      <Text color="gray.500" mt={2} textTransform="capitalize" wordBreak="break-word">
                        {resource.resourceType}
                        {resource.fileName ? ` · ${resource.fileName}` : ""}
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        {resource.uploadedAt ? new Date(resource.uploadedAt).toLocaleString() : ""}
                      </Text>
                      <Flex mt={4} gap={3} wrap="wrap">
                        {resource.resourceType === "pdf" ? (
                          <>
                            <Button size="sm" colorScheme="linkedin" variant="solid" onClick={() => openResource(resource)} w={{ base: "full", sm: "auto" }}>
                              View PDF
                            </Button>
                            <Button as="a" href={resource.fileUrl} target="_blank" rel="noopener noreferrer" size="sm" variant="outline" w={{ base: "full", sm: "auto" }}>
                              Open PDF
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              as="a"
                              href={resource.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="sm"
                              colorScheme="linkedin"
                              variant="solid"
                              w={{ base: "full", sm: "auto" }}
                            >
                              {resource.resourceType === "poll" ? "Open Poll" : "Open Link"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openResource(resource)} w={{ base: "full", sm: "auto" }}>
                              {resource.resourceType === "poll" ? "Open Poll" : "Open Link"}
                            </Button>
                          </>
                        )}
                      </Flex>
                    </Box>
                    {onDelete ? (
                      <Button size="sm" colorScheme="red" variant="outline" onClick={() => onDelete(resource._id)} alignSelf={{ base: "flex-start", md: "start" }}>
                        Delete
                      </Button>
                    ) : null}
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Card>
            <CardBody>
              <Text color="gray.500">No resources available right now.</Text>
            </CardBody>
          </Card>
        )}
      </Box>

      <Modal isOpen={previewModal.isOpen} onClose={previewModal.onClose} size="6xl" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" maxW={{ base: "calc(100vw - 1rem)", md: "6xl" }}>
          <ModalHeader wordBreak="break-word">{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              {selectedResource?.fileUrl ? (
                <Box
                  as="object"
                  data={selectedResource.fileUrl}
                  type="application/pdf"
                  width="100%"
                  minH={{ base: "60vh", md: "70vh" }}
                  borderRadius="lg"
                  display="block"
                >
                  <Text color="gray.500">Your browser cannot display this PDF inline.</Text>
                  <Button
                    as="a"
                    href={selectedResource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    alignSelf="flex-start"
                    mt={3}
                    w={{ base: "full", sm: "auto" }}
                  >
                    Open PDF in new tab
                  </Button>
                </Box>
              ) : (
                <Text color="gray.500">No PDF file is available for preview.</Text>
              )}
              {selectedResource?.fileUrl ? (
                <Button
                  as="a"
                  href={selectedResource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  alignSelf="flex-start"
                  w={{ base: "full", sm: "auto" }}
                >
                  Open PDF in new tab
                </Button>
              ) : null}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
