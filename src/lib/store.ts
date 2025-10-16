import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readJson<T>(fileName: string, fallback: T): T {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function writeJson<T>(fileName: string, data: T): void {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function generateId(prefix: string = "id"): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}


