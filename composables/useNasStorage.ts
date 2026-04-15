type NasUploadResponse = {
    url?: string;
    filename?: string;
    path?: string;
    [key: string]: any;
};

export const useNasStorage = () => {
    const config = useRuntimeConfig();
    const nasShareEnabled = Boolean(config.public.nasShareEnabled);

    const assertNasEnabled = () => {
        if (!nasShareEnabled) {
            throw new Error("NAS share path is not configured");
        }
    };

    const uploadFile = async (file: File): Promise<NasUploadResponse> => {
        assertNasEnabled();

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
        assertNasEnabled();
        const downloadUrl = `/api/cms/nas/file/${encodeURIComponent(filename)}`;

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
