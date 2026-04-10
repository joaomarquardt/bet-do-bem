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

export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File | Blob | { uri: string; type?: string },
  contentType: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    let body: Blob;
    if (typeof File !== 'undefined' && file instanceof File) {
      body = file;
    } else if (file instanceof Blob) {
      body = file;
    } else if (
      file &&
      typeof file === 'object' &&
      'uri' in file &&
      typeof (file as { uri: string }).uri === 'string'
    ) {
      const res = await fetch((file as { uri: string }).uri);
      body = await res.blob();
    } else {
      throw new Error('Arquivo inválido para upload');
    }
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body,
    });
    return;
  }
  await uploadFileToAWS(uploadUrl, file as { uri: string; type?: string }, contentType);
}

export default uploadFileToAWS;
