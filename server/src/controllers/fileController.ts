import { Request, Response } from 'express';
import fileUpload from 'express-fileupload';

import { appInsightsClient } from '../utils/appInsights';
import { uploadFile } from '../utils/storage';

export const saveImage = async (req: Request, res: Response) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).send('No files were uploaded.');
      return;
    }
    const image = req.files.file;
    if (image) {
      const { blockBlobClient } = await uploadFile(
        image as fileUpload.UploadedFile
      );
      res.status(200).send({ imagePath: blockBlobClient.url });
    } else {
      res.status(400).send('image not found.');
    }
  } catch (err: any) {
    if (appInsightsClient) appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error saving image' });
  }
};
