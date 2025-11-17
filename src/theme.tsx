import { extendTheme } from "@mui/joy/styles";

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          50: "#d4e1eeff",
          100: "#A5B8CF",
          200: "#6A96CA",
          300: "#4886D0",
          400: "#2178DD",
          500: "#096BDE",
          600: "#1B62B5",
          700: "#265995",
          800: "#2F4968",
          900: "#2F3C4C",
        },
        neutral: {
          50: "#D3D4D8",
          100: "#B7B8BD",
          200: "#8E8F95",
          300: "#6C6D73",
          400: "#4D4E55",
          500: "#33343A",
          600: "#27282E",
          700: "#1C1D22",
          800: "#121217",
          900: "#0A0A0D",
        },
      },
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState, theme }: any) => {
          if (ownerState?.variant === "solid") {
            return {
              backgroundColor: "#ffffff",
              color: theme?.vars?.palette?.primary?.[600] ?? "#000",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#f2f2f2",
              },
            };
          }
          if (ownerState?.variant === "outlined") {
            return {
              color: "#ffffff",
              border: `1px solid #ffffff`,
              borderColor: "#ffffffa2",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#ffffff57",
              },
            };
          }
          if (ownerState?.variant === "plain") {
            return {
              backgroundColor: "#ffffff",
              color: theme?.vars?.palette?.neutral?.[900] ?? "#000",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#f2f2f2",
              },
            };
          }
          return {};
        },
      },
    },
  },
});

export default theme;
