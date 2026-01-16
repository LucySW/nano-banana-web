
async function getOrCreateFolder(accessToken: string, folderName: string): Promise<string> {
    // 1. Search for existing folder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false&fields=files(id)`;
    const searchRes = await fetch(searchUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
    }

    // 2. Create if not exists
    const metadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
    };
    
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
    });
    const createData = await createRes.json();
    return createData.id;
}

export async function uploadImageToDrive(accessToken: string, base64Image: string, filename: string, folderName?: string): Promise<{ id: string, webViewLink: string | null }> {
    try {
        let parentId: string | undefined;

        if (folderName) {
            try {
                parentId = await getOrCreateFolder(accessToken, folderName);
            } catch (e) {
                console.warn("Failed to get/create folder, uploading to root", e);
            }
        }

        const metadata: any = {
            name: filename,
            mimeType: 'image/png',
        };
        
        if (parentId) {
            metadata.parents = [parentId];
        }

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        
        const byteCharacters = atob(base64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        form.append('file', blob);

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
