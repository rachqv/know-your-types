import { Bricolage_Grotesque, Silkscreen } from "next/font/google";
import Hud from "@/components/Hud";
import FunEffects from "@/components/FunEffects";
import LevelUpToast from "@/components/LevelUpToast";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Know Your Types",
  description:
    "A beginner's adventure through the 18 Pokémon types. Explore the map, earn badges, and learn every matchup.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${silkscreen.variable}`}>
      <body>
        <Hud />
        {children}
        <LevelUpToast />
        <FunEffects />
      </body>
    </html>
  );
}
