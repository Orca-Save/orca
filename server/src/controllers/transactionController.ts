import { Request, Response } from 'express';

import { appInsightsClient } from '../utils/appInsights';
import { getFormattedTransactions } from '../utils/plaid';
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
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting linked items' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const page = Number(req.query.page) || 1;

    const transactions = await getFormattedTransactions(userId, page);
    res.status(200).send({ transactions });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting linked items' });
  }
};
