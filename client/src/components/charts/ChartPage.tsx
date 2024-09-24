import { Skeleton, Tabs, TabsProps, Typography } from 'antd';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import useFetch from '../../hooks/useFetch';

const { Text } = Typography;
export default function ChartPage() {
  const { data } = useFetch('api/pages/chartPage', 'GET');
  if (!data) return <Skeleton active />;
  const { weekChartData, currentMonthDailySums, lastMonthDiscretionary } = data;
  const { chartDataWithSum, chartData } = weekChartData;
  currentMonthDailySums[0].lastMonthDiscretionary = 0;
  currentMonthDailySums[
    currentMonthDailySums.length - 1
  ].lastMonthDiscretionary = lastMonthDiscretionary.totalExpenses;
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Weekly Spending',
      children: (
        <div
          style={{
            width: '100%',
            height: 500,
            textAlign: 'center',
          }}
        >
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              width={500}
              height={300}
              data={chartDataWithSum}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='week' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='Impulse' stackId='a' fill='#8884d8' />
              <Bar dataKey='Non-Impulse' stackId='a' fill='#82ca9d' />
            </BarChart>
          </ResponsiveContainer>
          <Text>
            *Impulse and Non-Impulse spending are stacked on top of each other
          </Text>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Month Comparison',
      children: (
        <div
          style={{
            width: '100%',
            height: 500,
            textAlign: 'center',
          }}
        >
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              width={500}
              height={300}
              data={currentMonthDailySums}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dot={false}
                dataKey='lastMonthDiscretionary'
                name='Last Month Discretionary'
                stroke='#808080'
                strokeDasharray='5 5'
              />
              <Line
                type='monotone'
                name='Current Month Impulse'
                dataKey='impulse'
                stroke='#8884d8'
              />
              <Line
                type='monotone'
                name='Current Month Non-Impulse'
                dataKey='nonImpulse'
                stroke='#82ca9d'
              />
            </LineChart>
          </ResponsiveContainer>
          <Text>
            *Last month discretionary is shown as a dotted line for comparison
          </Text>
        </div>
      ),
    },
  ];
  return <Tabs centered items={items} />;
}
