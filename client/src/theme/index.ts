import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "linear-gradient(180deg, #eef4ff 0%, #f8f4ff 45%, #f1fff7 100%)",
        color: "gray.800"
      },
      "#root": {
        minHeight: "100vh"
      }
    }
  },
  fonts: {
    heading: "'Avenir Next', 'Trebuchet MS', sans-serif",
    body: "'Segoe UI', sans-serif"
  },
  colors: {
    brand: {
      50: "#eef4ff",
      100: "#d9e7ff",
      200: "#bdd5ff",
      300: "#9ec1ff",
      400: "#7fabff",
      500: "#5f95fb",
      600: "#4677d4",
      700: "#315ca4",
      800: "#223f74",
      900: "#132444"
    },
    mint: {
      50: "#effff8",
      100: "#cdf6e4",
      200: "#a7eccc",
      300: "#7ee2b4",
      400: "#59d89d",
      500: "#3cbe83"
    },
    lilac: {
      50: "#f6f1ff",
      100: "#e8dbff",
      200: "#d7c0ff",
      300: "#c3a2ff",
      400: "#ac82ff",
      500: "#9562f2"
    }
  },
  radii: {
    xl: "22px",
    "2xl": "28px"
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "700"
      }
    },
    Input: {
      defaultProps: {
        focusBorderColor: "brand.400"
      }
    },
    Select: {
      defaultProps: {
        focusBorderColor: "brand.400"
      }
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: "brand.400"
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "2xl",
          boxShadow: "0 18px 45px rgba(95, 149, 251, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.7)"
        }
      }
    }
  }
});
