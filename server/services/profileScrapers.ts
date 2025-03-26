import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

interface HackerRankProfile {
  starScore: number;
  totalSolved: number;
  contests: number;
  stars: number;
}

interface LeetCodeProfile {
  easy: number;
  medium: number;
  hard: number;
  rank: number;
}

interface CodeChefProfile {
  totalSolved: number;
  contests: number;
  stars: number;
}

interface GFGProfile {
  school: number;
  basic: number;
  medium: number;
  hard: number;
  score: number;
}

async function runPythonScraper(excelPath: string): Promise<any> {
  try {
    await execAsync(
      `. attached_assets/venv/bin/activate && python3 attached_assets/extractData_copy.py "${excelPath}"`,
    );
    const data = await fs.readFile("students_profiles.json", "utf-8");
    return JSON.parse(data).Profiles;
  } catch (error) {
    console.error("Error running Python scraper:", error);
    throw error;
  }
}

export async function scrapeProfiles(excelPath: string) {
  try {
    const profiles = await runPythonScraper(excelPath);
    return { success: true, data: profiles };
  } catch (error) {
    console.error("Error scraping profiles:", error);
    return { success: false, error: "Failed to scrape profiles" };
  }
}
