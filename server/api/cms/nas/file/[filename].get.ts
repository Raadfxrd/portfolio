import {readFile} from "node:fs/promises";
import {extname, join} from "node:path";

const isNasSharePath = (rawPath?: string) => {
    const trimmed = String(rawPath || "").trim();
    return /^\\\\/.test(trimmed) || /^[a-zA-Z]:[\\/]/.test(trimmed);
};

const sanitizeFileName = (name: string) => {
    const decoded = decodeURIComponent(name || "");
    return decoded.replace(/[^a-zA-Z0-9._-]/g, "");
};

const getContentType = (filename: string) => {
    switch (extname(filename).toLowerCase()) {
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".webp":
            return "image/webp";
        case ".gif":
            return "image/gif";
        case ".svg":
            return "image/svg+xml";
        default:
            return "application/octet-stream";
    }
};

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const sharePath = String(config.nasWindowsSharePath || "").trim();
    if (!isNasSharePath(sharePath)) {
        throw createError({
            statusCode: 404,
            message: "NAS_WINDOWS_SHARE_PATH is not configured",
        });
    }

    const rawFileName = getRouterParam(event, "filename") || "";
    const filename = sanitizeFileName(rawFileName);

    if (!filename) {
        throw createError({
            statusCode: 400,
            message: "Invalid filename",
        });
    }

    const fullPath = join(sharePath, filename);

    try {
        const data = await readFile(fullPath);
        setHeader(event, "Content-Type", getContentType(filename));
        setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
        return data;
    } catch {
        throw createError({
            statusCode: 404,
            message: "File not found",
        });
    }
});

