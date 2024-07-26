'use client';
import { currencyFormatter } from '@/lib/utils';
import { Flex, Progress, ProgressProps } from 'antd';

type GoalProgressProps = {
  target: number;
  currentBalance: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

const twoColors: ProgressProps['strokeColor'] = {
  '0%': '#108ee9',
  '100%': '#87d068',
};

export default function GoalProgress({
  target,
  currentBalance,
  strokeWidth,
  style,
}: GoalProgressProps) {
  const percent = (currentBalance / target) * 100;
  return (
    <Flex gap='small' align='center' justify='center' style={{ width: '100%' }}>
      <span style={{ textAlign: 'center' }}>
        {currencyFormatter(currentBalance)}
      </span>
      <Progress
        percent={percent}
        status='active'
        style={{
          marginRight: String(Math.log10(target) * 0.4) + 'rem',
          textAlign: 'center',
        }}
        strokeWidth={strokeWidth ?? 13}
        format={() => currencyFormatter(target)}
        strokeColor={twoColors}
      />
    </Flex>
  );
}
