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

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];
export default function ChartPage() {
  const { data: data2 } = useFetch('api/pages/chartPage', 'GET');
  if (!data2) return null;
  const { weekChartData, currentMonthDailySums, lastMonthDiscretionary } =
    data2;
  const { chartDataWithSum, chartData } = weekChartData;
  currentMonthDailySums[0].lastMonthDiscretionary = 0;
  currentMonthDailySums[
    currentMonthDailySums.length - 1
  ].lastMonthDiscretionary = lastMonthDiscretionary.totalExpenses;

  return (
    <>
      <div
        style={{
          width: '100%',
          height: 500,
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
      </div>
      <div
        style={{
          width: '100%',
          height: 500,
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
      </div>
    </>
  );
}
