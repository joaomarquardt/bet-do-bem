import { Platform } from 'react-native';

export async function uploadFileToAWS(uploadUrl: string, file: File | Blob | { uri: string; type?: string }, contentType: string): Promise<void> {
  if (Platform.OS === 'web') {
    const webFile = file as File;
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: webFile,
    });
    return;
  }

  if ((file as Blob).size !== undefined && (file as any).type !== undefined) {
    const blob = file as Blob;
    await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': (blob as any).type || 'application/octet-stream' }, body: blob });
    return;
  }

  const f = file as { uri: string; type?: string };
  const res = await fetch(f.uri);
  const blob = await res.blob();
  await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
}

export default uploadFileToAWS;
