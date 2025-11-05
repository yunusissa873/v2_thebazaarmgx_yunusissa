/**
 * The Bazaar Brand Kit v2.1
 * Theme tokens for Light Grey & Red / Grey & Red color scheme
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

export const brandKit = {
  colors: {
    primary: "#E50914", // Netflix red - main accent
    secondary: "#808080", // Light grey - secondary elements
    dark: "#1F1F1F", // Dark grey - backgrounds
    medium: "#2F2F2F", // Medium grey - cards/borders
    black: "#141414", // Almost black - main background
    light: "#F5F5F5", // Light grey - light backgrounds
    white: "#FFFFFF", // White - text on dark
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
} as const;

export type BrandKit = typeof brandKit;
