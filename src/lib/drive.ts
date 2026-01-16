
export async function uploadImageToDrive(accessToken: string, base64Image: string, filename: string): Promise<{ id: string, webViewLink: string | null }> {
    const metadata = {
        name: filename,
        mimeType: 'image/png',
        // Parents can be specified here if we want a specific folder, e.g. "parents": ["folder_id"]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    
    // Convert base64 to Blob
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    form.append('file', blob);

    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: form
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Drive Upload Failed');
        }

        const data = await response.json();
        return { id: data.id, webViewLink: data.webViewLink };
    } catch (error) {
        console.error("Drive Upload Error:", error);
        throw error;
    }
}
