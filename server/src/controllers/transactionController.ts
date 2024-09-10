import { Request, Response } from 'express';

import { saveTransaction } from '../utils/transactions';

export const save = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [transaction] = await Promise.all([
      saveTransaction({
        ...req.body.transaction,
        userId,
      }),
    ]);
    res.status(200).send({ transaction });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error getting linked items' });
  }
};
