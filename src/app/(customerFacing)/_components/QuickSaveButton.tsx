'use client';

import { addQuickSave } from '@/app/_actions/goalTransfers';
import { Text } from '@/app/_components/Typography';
import { formatCurrency } from '@/lib/formatters';
import {
  GoalCategory,
  GoalTransfer as PrismaGoalTransfer,
} from '@prisma/client';
import { Button, Typography } from 'antd';
import { useState } from 'react';
import Confetti from 'react-confetti';

const { Paragraph } = Typography;

type GoalTransfer = PrismaGoalTransfer & {
  category: GoalCategory | null;
};
export function QuickSaveButton({
  transfer,
  goalId,
}: {
  transfer: GoalTransfer;
  goalId?: string;
}) {
  const [confetti, setConfetti] = useState({ run: false, count: 0 });
  if (confetti.run) {
    setTimeout(() => {
      setConfetti({ run: true, count: 0 });
    }, 1500);
  }
  const onClick = () => {
    setConfetti({ run: true, count: 300 });
    if (goalId) addQuickSave(goalId, transfer);
  };

  return (
    <>
      {confetti.run ? (
        <Confetti run={confetti.run} numberOfPieces={confetti.count} />
      ) : null}
      <Button
        key={transfer.id}
        disabled={!goalId}
        size='large'
        type='primary'
        style={{ height: 'auto', width: 'auto' }}
        onClick={onClick}>
        <Paragraph>{transfer.itemName}</Paragraph>
        <Text style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Save</Text>
        <Text>{formatCurrency(Number(transfer.amount.toString()))}</Text>
      </Button>
    </>
  );
}
