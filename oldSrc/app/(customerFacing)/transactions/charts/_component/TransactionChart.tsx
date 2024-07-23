'use client';

import { Column } from '@ant-design/plots';

export default function TransactionChart({
  data,
}: {
  data: {
    week: string;
    impulse: string;
    value: number;
  }[];
}) {
  const config = {
    data,
    xField: 'week',
    yField: 'value',
    stack: true,
    colorField: 'impulse',
    label: {
      text: 'value',
      textBaseline: 'bottom',
      position: 'inside',
    },
    interaction: {
      elementHighlightByColor: {
        link: true,
      },
    },
    state: {
      active: {
        linkFill: 'rgba(0,0,0,0.25)',
        stroke: 'black',
        lineWidth: 0.5,
      },
      inactive: { opacity: 0.5 },
    },
  };
  return <Column {...config} />;
}
