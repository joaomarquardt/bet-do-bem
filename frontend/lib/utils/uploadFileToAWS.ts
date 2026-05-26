import { Platform } from 'react-native';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';

export type UploadableFile = File | Blob | { uri: string; type?: string };

async function resolveWebBody(file: UploadableFile): Promise<Blob> {
  if (typeof File !== 'undefined' && file instanceof File) {
    return file;
  }
  if (file instanceof Blob) {
    return file;
  }
  if (
    file &&
    typeof file === 'object' &&
    'uri' in file &&
    typeof (file as { uri: string }).uri === 'string'
  ) {
    const res = await fetch((file as { uri: string }).uri);
    if (!res.ok) {
      throw new Error(`Não foi possível ler o arquivo local (${res.status})`);
    }
    const blob = await res.blob();
    if (blob.size === 0) {
      throw new Error('Arquivo vazio ou ilegível');
    }
    return blob;
  }
  throw new Error('Arquivo inválido para upload');
}

async function putToPresignedUrl(uploadUrl: string, body: Blob, contentType: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body,
  });
  if (!response.ok) {
    throw new Error(`Upload falhou: ${response.status}`);
  }
}

export async function uploadFileToAWS(
  uploadUrl: string,
  file: UploadableFile,
  contentType: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    const body = await resolveWebBody(file);
    await putToPresignedUrl(uploadUrl, body, contentType);
    return;
  }

  if (file && typeof file === 'object' && 'uri' in file && typeof file.uri === 'string') {
    const result = await uploadAsync(uploadUrl, file.uri, {
      httpMethod: 'PUT',
      uploadType: FileSystemUploadType.BINARY_CONTENT,
      headers: {
        'Content-Type': contentType,
      },
    });
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Upload falhou: ${result.status}`);
    }
    return;
  }

  if (file instanceof Blob) {
    await putToPresignedUrl(uploadUrl, file, contentType);
    return;
  }

  throw new Error('Arquivo inválido para upload');
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: UploadableFile,
  contentType: string,
): Promise<void> {
  await uploadFileToAWS(uploadUrl, file, contentType);
}

export default uploadFileToAWS;
