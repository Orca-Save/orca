import { Button, Space, Typography } from 'antd';
import { useState } from 'react';
import Confetti from 'react-confetti';

import { GoalTransfer } from '../../types/all';
import { apiFetch, currencyFormatter } from '../../utils/general';

const { Text } = Typography;

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
  const onClick = async () => {
    setConfetti({ run: true, count: 300 });
    if (goalId) {
      await apiFetch('/api/goals/quickSave', 'POST', {
        goalId,
        transfer,
      });
      // window.location.reload();
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
