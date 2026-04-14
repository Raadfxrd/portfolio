type NasUploadResponse = {
    url?: string;
    filename?: string;
    path?: string;
    [key: string]: any;
};

export const isNasSharePath = (rawPath?: string) => {
    const trimmed = String(rawPath || "").trim();
    return /^\\\\/.test(trimmed) || /^[a-zA-Z]:[\\/]/.test(trimmed);
};

export const normalizeNasBaseUrl = (rawUrl?: string) => {
    const trimmed = String(rawUrl || "").trim();
    if (!trimmed) return "";

    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    return withProtocol.replace(/\/+$/, "");
};

export const useNasStorage = () => {
    const config = useRuntimeConfig();
    const rawNasValue = String(config.public.nasBaseUrl || "").trim();
    const useServerShareProxy = isNasSharePath(rawNasValue);
    const baseUrl = normalizeNasBaseUrl(rawNasValue);

    const assertBaseUrl = () => {
        if (!useServerShareProxy && !baseUrl) {
            throw new Error("NAS base URL is not configured");
        }
    };

    const uploadFile = async (file: File): Promise<NasUploadResponse> => {
        assertBaseUrl();

        const formData = new FormData();
        formData.append("file", file);

        // Always upload through same-origin API to avoid browser CORS issues.
        const response = await fetch("/api/cms/nas/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("NAS upload failed");
        }

        return await response.json();
    };

    const downloadFile = async (filename: string) => {
        assertBaseUrl();

        const downloadUrl = useServerShareProxy
            ? `/api/cms/nas/file/${encodeURIComponent(filename)}`
            : `${baseUrl}/download/${filename}`;

        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error("NAS download failed");
        }

        return await response.blob();
    };

    return {
        uploadFile,
        downloadFile,
    };
};
