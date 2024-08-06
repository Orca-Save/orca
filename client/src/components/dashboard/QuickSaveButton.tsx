import { Button, Space, Typography } from 'antd';
import { useState } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

import { GoalTransfer } from '../../types/all';
import { apiFetch, currencyFormatter } from '../../utils/general';

const { Text } = Typography;

export function QuickSaveButton({
  transfer,
  goalId,
  addGoalCurrentBalance,
}: {
  transfer: GoalTransfer;
  addGoalCurrentBalance: (amount: number) => void;
  goalId?: string;
}) {
  const [confetti, setConfetti] = useState({ run: false, count: 0 });
  const navigate = useNavigate();
  if (confetti.run) {
    setTimeout(() => {
      setConfetti({ run: true, count: 0 });
    }, 1500);
  }
  const onClick = async () => {
    setConfetti({ run: true, count: 300 });
    if (goalId) {
      await apiFetch('/api/goals/quickSave', 'POST', {
        goalId,
        transferId: transfer.id,
      });
      addGoalCurrentBalance(transfer.amount);
      navigate('/?confetti=true');
    }
  };

  return (
    <>
      {confetti.run ? (
        <Confetti run={confetti.run} numberOfPieces={confetti.count} />
      ) : null}
      <Button
        data-id='quick-save-button'
        key={transfer.id}
        disabled={!goalId}
        size='large'
        type='primary'
        style={{ height: 'auto', width: 'auto' }}
        onClick={onClick}
      >
        <Space direction='vertical'>
          <Text>{transfer.itemName}</Text>
          <Text style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
            Save
          </Text>
          <Text>{currencyFormatter(transfer.amount)}</Text>
        </Space>
      </Button>
    </>
  );
}
