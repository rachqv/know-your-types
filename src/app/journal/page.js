import PageTitle from "@/components/PageTitle";
import MatchupChart from "@/components/MatchupChart";

export const metadata = { title: "Journal · Know Your Types" };

export default function JournalPage() {
  return (
    <main className="page wide">
      <MatchupChart
        header={
          <PageTitle emoji="📖" title="Trainer's Journal">
            Rows are the <strong>attacking</strong> move, columns are the <strong>defending</strong>{" "}
            Pokémon. Tap or hover any square.
          </PageTitle>
        }
        footer={
          <p className="credits">
            Fan project. Pokémon and its artwork belong to Nintendo, Game Freak and The Pokémon
            Company. Artwork from{" "}
            <a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noopener noreferrer">
              PokéAPI sprites
            </a>
            .
          </p>
        }
      />
    </main>
  );
}
