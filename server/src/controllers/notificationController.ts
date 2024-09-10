import { Request, Response } from 'express';

import { User } from '../types/user';
import db from '../utils/db';
import { sendNotification } from '../utils/notifications';

export const sendHelloMessage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const results = await sendNotification('Hello', 'Hello from the server!');
    res.status(200).send(results);
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

export const registerDeviceToken = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { token } = req.body;

    await db.userProfile.update({
      where: { userId: user.oid },
      data: { notificationToken: token },
    });

    res.status(200).send({ message: 'Token saved' });
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};
