import { PrismaClient, ReviewStatus } from "../src/generated/prisma/index.js";
import * as dotenv from "dotenv";
dotenv.config();
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

type CsvRow = {
  Name: string;
  Rating: string;
  "Steam Tags": string;
  "Release Date": string;
  "Game Page": string;
  Completed: string;
  Purchased: string;
  "Video URL": string;
};

const prisma = new PrismaClient();

const ratingMap: Record<
  string,
  "FANTASTIC" | "PRETTY_GOOD" | "NOTABLE" | "YOU_MIGHT_LIKE"
> = {
  FANTASTIC: "FANTASTIC",
  "Pretty Good!": "PRETTY_GOOD",
  Notable: "NOTABLE",
  "I Don't Like But You Might": "YOU_MIGHT_LIKE",
};

async function seedFromNotionDatabaseAsCSVFile() {
  const RAWG_API_KEY = process.env.RAWG_API_KEY || "";
  const pathToNotionCSV = path.resolve(
    process.cwd(),
    "prisma/Notion_Games.csv"
  );
  const fileContent = fs.readFileSync(pathToNotionCSV, "utf-8");
  const csv_file_rows = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvRow[];

  const totalRows = csv_file_rows.length;
  console.log(
    `Starting database seeding from Notion_Games.csv (${totalRows} rows)...`
  );
  for (const [i, originalGame] of csv_file_rows.entries()) {
    const game: Record<string, string> = getGameFromCSV(originalGame);
    console.log(`[${i + 1}/${totalRows}] Processing game: ${game["Name"]}`);
    if (invalidGame(game)) {
      continue;
    }

    const meta = await fetchGameMetadata(game["Name"], RAWG_API_KEY);
    if (!meta) {
      console.warn(
        `[${i + 1}/${totalRows}] No metadata found for game: ${game["Name"]}`
      );
      continue;
    }

    const genreNames = constructGenreNames(meta);
    const genreIds: number[] = await constructGenreIds(genreNames);
    const faisalRating = ratingMap[game["Rating"]?.trim()] || null;
    const reviewText = "";
    const review = await prisma.review.create({
      data: {
        reviewText,
        faisalRating,
      },
    });

    const releaseDate =
      meta.releaseDate ||
      (game["Release Date"] ? new Date(game["Release Date"]) : new Date());
    const description = meta.description || "";
    const developer = meta.developer || "";
    const thumbnailUrl = meta.thumbnailUrl || "";
    const title = meta.title || game["Name"];
    const prismaGameData = {
      title,
      thumbnailUrl,
      description,
      releaseDate,
      developer,
      gamePage: game["Game Page"],
      videoUrl: game["Video URL"],
      genres:
        genreIds.length > 0
          ? { connect: genreIds.map((id) => ({ id })) }
          : undefined,
      review: { connect: { id: review.id } },
      reviewStatus: ReviewStatus.DONE,
      opencriticAvg: null,
    };

    if (await gameExists(title)) {
      console.log(`[${i + 1}/${totalRows}] Skipped (already exists): ${title}`);
      continue;
    }

    await prisma.game.create({ data: prismaGameData });
    console.log(`[${i + 1}/${totalRows}] Seeded game: ${title}`);
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log(
    `Finished seeding database from Notion_Games.csv (${totalRows} rows).`
  );
}

async function gameExists(title: string) {
  return await prisma.game.findUnique({ where: { title } });
}

async function fetchGameMetadata(gameName: string, apiKey: string) {
  const searchUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(
    gameName
  )}&key=${apiKey}`;
  try {
    const gameDetails = await getGameDetailsFromRAWG(searchUrl);
    const gameExtraDetails = await getExtraGameDetailsFromRAWG(
      gameDetails,
      apiKey
    );

    return {
      genres: gameDetails.genres?.map((g: { name: string }) => g.name) || [],
      releaseDate: gameDetails.released ? new Date(gameDetails.released) : null,
      description:
        gameExtraDetails["description_raw"] ||
        gameExtraDetails["description"] ||
        "",
      developer:
        (gameExtraDetails["developers"] &&
          gameExtraDetails["developers"][0]?.name) ||
        "",
      thumbnailUrl: gameDetails.background_image || "",
      title: gameDetails.name || gameName,
    };
  } catch (err) {
    console.error(`Error fetching metadata for ${gameName}:`, err);
    return null;
  }
}

async function constructGenreIds(genreNames: string[]) {
  const genreIds: number[] = [];
  for (const name of genreNames) {
    if (!name) continue;
    let genre = await prisma.genre.findUnique({ where: { name } });
    if (!genre) {
      genre = await prisma.genre.create({ data: { name } });
    }
    genreIds.push(genre.id);
  }
  return genreIds;
}

function constructGenreNames(meta: {
  genres: string[];
  releaseDate: Date | null;
  description: string;
  developer: string;
  thumbnailUrl: string | null;
  title: string;
}) {
  return meta.genres && Array.isArray(meta.genres) ? meta.genres : [];
}

function invalidGame(game: Record<string, string>) {
  return (
    !game["Name"] || typeof game["Name"] !== "string" || !game["Name"].trim()
  );
}

function getGameFromCSV(originalGame: CsvRow) {
  const game: Record<string, string> = {};
  Object.keys(originalGame).forEach((key) => {
    const cleanKey = key.replace(/^\uFEFF/, "").trim();
    game[cleanKey] = originalGame[key];
  });
  return game;
}

async function getGameDetailsFromRAWG(searchUrl: string) {
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return null;

  const searchData = await searchRes.json();
  if (!searchData.results || searchData.results.length === 0) return null;

  return searchData.results[0];
}

async function getExtraGameDetailsFromRAWG(
  game: { id: number },
  apiKey: string
) {
  const detailsUrl = `https://api.rawg.io/api/games/${game.id}?key=${apiKey}`;
  const detailsRes = await fetch(detailsUrl);
  let detailedResponse = {};
  if (detailsRes.ok) {
    detailedResponse = await detailsRes.json();
  }
  return detailedResponse;
}

seedFromNotionDatabaseAsCSVFile()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
