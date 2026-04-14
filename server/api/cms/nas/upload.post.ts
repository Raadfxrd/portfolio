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

const normalizeNasBaseUrl = (rawUrl?: string) => {
    const trimmed = String(rawUrl || "").trim();
    if (!trimmed) return "";

    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    return withProtocol.replace(/\/+$/, "");
};

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const config = useRuntimeConfig(event);
    const privateSharePath = String(config.nasWindowsSharePath || "").trim();
    const publicNasBase = String(config.public?.nasBaseUrl || "").trim();
    const sharePath = isNasSharePath(privateSharePath)
        ? privateSharePath
        : isNasSharePath(publicNasBase)
            ? publicNasBase
            : "";

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

    if (!sharePath) {
        const remoteBaseUrl = normalizeNasBaseUrl(publicNasBase);
        if (!remoteBaseUrl) {
            throw createError({
                statusCode: 500,
                message:
                    "NAS is not configured. Set NAS_WINDOWS_SHARE_PATH, NUXT_PUBLIC_NAS_BASE_URL, or NAS_BASE_URL.",
            });
        }

        const proxyFormData = new FormData();
        const fileBytes = Uint8Array.from(filePart.data);
        proxyFormData.append(
            "file",
            new Blob([fileBytes], {type: filePart.type || "application/octet-stream"}),
            filePart.filename || filename,
        );

        const upstream = await fetch(`${remoteBaseUrl}/upload`, {
            method: "POST",
            body: proxyFormData,
        });

        if (!upstream.ok) {
            throw createError({
                statusCode: upstream.status || 502,
                message: "Remote NAS upload failed",
            });
        }

        const responseType = upstream.headers.get("content-type") || "";
        if (responseType.includes("application/json")) {
            return await upstream.json();
        }

        return {
            url: `${remoteBaseUrl}/download/${encodeURIComponent(filePart.filename || filename)}`,
        };
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

