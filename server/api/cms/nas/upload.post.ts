import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {requireAuth} from "~/server/utils/auth";

const isNasSharePath = (rawPath?: string) => {
    const trimmed = String(rawPath || "").trim();
    return /^\\\\/.test(trimmed) || /^[a-zA-Z]:[\\/]/.test(trimmed);
};

const sanitizeFileName = (name: string) =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-");

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const config = useRuntimeConfig(event);
    const sharePath = String(config.nasWindowsSharePath || "").trim();

    const parts = await readMultipartFormData(event);
    const filePart = parts?.find((part) => part.name === "file" && part.filename);

    if (!filePart || !filePart.data) {
        throw createError({
            statusCode: 400,
            message: "No file uploaded",
        });
    }

    const safeOriginal = sanitizeFileName(filePart.filename || "upload.bin");
    const filename = `${Date.now()}-${safeOriginal}`;

    if (!isNasSharePath(sharePath)) {
        throw createError({
            statusCode: 500,
            message: "NAS_WINDOWS_SHARE_PATH is not configured",
        });
    }

    await mkdir(sharePath, {recursive: true});
    const fullPath = join(sharePath, filename);
    await writeFile(fullPath, filePart.data);

    return {
        filename,
        path: filename,
        // Served by Nuxt so markdown links stay HTTP-accessible.
        url: `/api/cms/nas/file/${encodeURIComponent(filename)}`,
    };
});

