
import { google } from 'googleapis';

const DRIVE_FOLDER_NAME = 'Brain Hub Data';

// Google Drive Clientの初期化
export const getDriveClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    return google.drive({ version: 'v3', auth });
};

// 専用フォルダの検索または作成
export const getOrCreateBrainHubFolder = async (drive: any) => {
    try {
        // フォルダを検索
        const res = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${DRIVE_FOLDER_NAME}' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id;
        }

        // フォルダが存在しない場合は作成
        const fileMetadata = {
            name: DRIVE_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
        };

        const folder = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
        });

        return folder.data.id;
    } catch (error) {
        console.error('Error getting/creating folder:', error);
        throw error;
    }
};

// コンテンツのアップロード (Markdown)
export const uploadLogToDrive = async (accessToken: string, title: string, content: string, date: string) => {
    const drive = getDriveClient(accessToken);
    const folderId = await getOrCreateBrainHubFolder(drive);

    const fileMetadata = {
        name: `${date}_${title}.md`,
        parents: [folderId],
        mimeType: 'text/markdown',
    };

    const media = {
        mimeType: 'text/markdown',
        body: content,
    };

    const res = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
    });

    return res.data;
};
