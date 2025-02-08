import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
const storageKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  storageKey
);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

export const uploadFile = async (file: fileUpload.UploadedFile) => {
  const containerName = 'images';
  const blobName = uuidv4();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const response = await blockBlobClient.uploadData(await file.data);
  return { blockBlobClient, response };
};
