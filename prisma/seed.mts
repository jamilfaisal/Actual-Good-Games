import {
  PrismaClient,
  ReviewStatus,
  $Enums,
} from "../src/generated/prisma/index.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

dotenv.config();

const OPENCRITIC_API_BASE = "https://api.opencritic.com/api";

type NotionCSVRow = {
  Name: string;
  Rating: string;
  SteamTags: string;
  ReleaseDate: string;
  GamePage: string;
  Completed: string;
  Purchased: string;
  VideoURL: string;
};

const prisma = new PrismaClient();

const ratingMap: Record<string, $Enums.FaisalRating> = {
  FANTASTIC: "FANTASTIC",
  "Pretty Good!": "PRETTY_GOOD",
  Notable: "NOTABLE",
  "I Don't Like But You Might": "YOU_MIGHT_LIKE",
};

async function seedFromNotionDatabaseAsCSVFile(): Promise<void> {
  const RAWG_API_KEY = process.env.RAWG_API_KEY || "";
  const csvRows = readNotionDatabaseCSVFile();
  const totalRows = csvRows.length;

  console.log(
    `Starting database seeding from Notion_Games.csv (${totalRows} rows)...`
  );
  for (const [i, originalGame] of csvRows.entries()) {
    const game = normalizeCSVRow(originalGame);
    console.log(`[${i + 1}/${totalRows}] Processing game: ${game.Name}`);
    if (isInvalidGame(game)) {
      console.warn(
        `[${i + 1}/${totalRows}] Skipped (invalid data): ${game.Name}`
      );
      continue;
    }

    const meta = await fetchGameMetadata(game.Name, RAWG_API_KEY);
    if (!meta) {
      console.warn(
        `[${i + 1}/${totalRows}] No metadata found for game: ${game.Name}`
      );
      continue;
    }

    const genreIds = await persistNewGenresToDB(meta);
    const review = await persistGameReviewToDB(game);
    await persistGameToDB(meta, game, genreIds, review, i, totalRows);

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.log(
    `Finished seeding database from Notion_Games.csv (${totalRows} rows).`
  );
}

async function persistGameToDB(
  meta: GenreMeta,
  game: NotionCSVRow,
  genreIds: number[],
  review: Review,
  i: number,
  totalRows: number
): Promise<void> {
  const releaseDate =
    meta.releaseDate ||
    (game.ReleaseDate ? new Date(game.ReleaseDate) : new Date());

  let opencriticAvg: number | null = null;
  const openCriticGameId = await getOpenCriticGameId(meta.title || game.Name);
  if (openCriticGameId) {
    opencriticAvg = await getOpenCriticAvgScore(openCriticGameId);
  }

  const prismaGameData = {
    title: meta.title || game.Name,
    thumbnailUrl: meta.thumbnailUrl || "",
    description: meta.description || "",
    releaseDate,
    developer: meta.developer || "",
    gamePage: game.GamePage,
    videoUrl: game.VideoURL,
    genres:
      genreIds.length > 0
        ? { connect: genreIds.map((id) => ({ id })) }
        : undefined,
    review: { connect: { id: review.id } },
    reviewStatus: ReviewStatus.DONE,
    opencriticAvg,
  };

  if (await gameExists(prismaGameData.title)) {
    console.log(
      `[${i + 1}/${totalRows}] Skipped (already exists): ${
        prismaGameData.title
      }`
    );
    return;
  }

  await prisma.game.create({ data: prismaGameData });
  console.log(
    `[${i + 1}/${totalRows}] Seeded game: ${prismaGameData.title}` +
      (opencriticAvg !== null ? ` (OpenCritic Avg: ${opencriticAvg})` : "")
  );
}

async function persistGameReviewToDB(game: NotionCSVRow): Promise<Review> {
  const faisalRating = ratingMap[game.Rating?.trim()] || null;
  return await prisma.review.create({
    data: {
      reviewText: "",
      faisalRating,
    },
  });
}

function readNotionDatabaseCSVFile(): NotionCSVRow[] {
  const pathToNotionCSV = path.resolve(
    process.cwd(),
    "prisma/Notion_Games.csv"
  );
  const fileContent = fs.readFileSync(pathToNotionCSV, "utf-8");
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as NotionCSVRow[];
}

async function gameExists(title: string): Promise<boolean> {
  return Boolean(await prisma.game.findUnique({ where: { title } }));
}

async function fetchGameMetadata(
  gameName: string,
  apiKey: string
): Promise<GenreMeta | null> {
  const searchUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(
    gameName
  )}&key=${apiKey}`;
  try {
    const gameDetails = await getGameDetailsFromRAWG(searchUrl);
    if (!gameDetails) return null;

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

interface GenreMeta {
  genres: string[];
  releaseDate: Date | null;
  description: string;
  developer: string;
  thumbnailUrl: string | null;
  title: string;
}

interface Review {
  reviewText: string;
  faisalRating: $Enums.FaisalRating | null;
  createdAt: Date;
  updatedAt: Date;
  id: number;
}

async function persistNewGenresToDB(meta: GenreMeta): Promise<number[]> {
  const genreNames =
    meta.genres && Array.isArray(meta.genres) ? meta.genres : [];
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

function isInvalidGame(game: NotionCSVRow): boolean {
  return !game.Name || typeof game.Name !== "string" || !game.Name.trim();
}

function normalizeCSVRow(originalGame: NotionCSVRow): NotionCSVRow {
  return {
    Name: originalGame["Name"],
    Rating: originalGame["Rating"],
    SteamTags: originalGame["Steam Tags"],
    ReleaseDate: originalGame["Release Date"],
    GamePage: originalGame["Game Page"],
    Completed: originalGame["Completed"],
    Purchased: originalGame["Purchased"],
    VideoURL: originalGame["Video URL"],
  };
}

type RawgGameDetails = {
  id: number;
  name: string;
  genres?: { name: string }[];
  released?: string;
  background_image?: string;
};

async function getOpenCriticGameId(gameName: string): Promise<number | null> {
  const searchUrl = `${OPENCRITIC_API_BASE}/game/search?criteria=${encodeURIComponent(
    gameName
  )}`;
  try {
    const res = await fetch(searchUrl);
    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data[0].id;
  } catch (err) {
    console.error(`Error searching OpenCritic for ${gameName}:`, err);
    return null;
  }
}

async function getOpenCriticAvgScore(gameId: number): Promise<number | null> {
  const detailsUrl = `${OPENCRITIC_API_BASE}/game/${gameId}`;
  try {
    const res = await fetch(detailsUrl);
    if (!res.ok) return null;
    const data = await res.json();

    return typeof data.averageScore === "number" ? data.averageScore : null;
  } catch (err) {
    console.error(
      `Error fetching OpenCritic details for game ID ${gameId}:`,
      err
    );
    return null;
  }
}

async function getGameDetailsFromRAWG(
  searchUrl: string
): Promise<RawgGameDetails | null> {
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return null;

  const searchData = await searchRes.json();
  if (!searchData.results || searchData.results.length === 0) return null;

  return searchData.results[0] as RawgGameDetails;
}

type RawgExtraDetails = {
  description_raw?: string;
  description?: string;
  developers?: { name: string }[];
};

async function getExtraGameDetailsFromRAWG(
  game: { id: number },
  apiKey: string
): Promise<RawgExtraDetails> {
  const detailsUrl = `https://api.rawg.io/api/games/${game.id}?key=${apiKey}`;
  const detailsRes = await fetch(detailsUrl);
  if (detailsRes.ok) {
    return (await detailsRes.json()) as RawgExtraDetails;
  }
  return {};
}

seedFromNotionDatabaseAsCSVFile()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
