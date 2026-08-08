import localFont from "next/font/local";

export const uncutSans = localFont({
  src: [
    {
      path: "../../public/fonts/uncut-sans/UncutSans-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/uncut-sans/UncutSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/uncut-sans/UncutSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/uncut-sans/UncutSans-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/uncut-sans/UncutSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const cormorantGaramond = localFont({
  src: [
    {
      path: "../../public/fonts/cormorant-garamond/CormorantGaramond-Variable.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/cormorant-garamond/CormorantGaramond-Italic-Variable.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});
