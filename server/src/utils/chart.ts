import { Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { format, startOfWeek } from 'date-fns';
import db from './db';
import { discretionaryFilter } from './plaid';

type ChartData = {
  week: string;
};
export const sortChartDataByWeek = (chartData: ChartData[]) => {
  return chartData.sort((a, b) => {
    const dateA = new Date(a.week);
    const dateB = new Date(b.week);
    return dateA.getTime() - dateB.getTime();
  });
};

export const getWeekChartData = async (userId: string) => {
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      // date is within the past month
      OR: [
        {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 35)), // Greater than or equal to 30 days ago
            lt: new Date(), // Less than today
          },
        },
        {
          authorizedDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 35)), // Greater than or equal to 30 days ago
            lt: new Date(), // Less than today
          },
        },
      ],
    },
  });

  // manipulate the data by grouping them by whether impulse is true or not, and by week then pass the data to the Transaction chart
  const groupedData = transactions.reduce((acc: any, transaction) => {
    const date = transaction.authorizedDate ?? transaction.date;
    const week = format(startOfWeek(new Date(date)), 'yyyy-MM-dd');
    const impulseKey = transaction.impulse ? 'impulse' : 'non-impulse';

    if (!acc[week]) {
      acc[week] = { impulse: [], 'non-impulse': [] };
    }
    acc[week][impulseKey].push(transaction);

    return acc;
  }, {});

  // Format data for TransactionChart component
  const chartData = Object.keys(groupedData).flatMap((week) => [
    {
      week,
      Impulse: groupedData[week].impulse.length,
      'Non-Impulse': groupedData[week]['non-impulse'].length,
    },
  ]);
  // duplicate chartData but value is the sum of the amount for impulse and non-impulse
  const chartDataWithSum = Object.keys(groupedData).flatMap((week) => [
    {
      week,
      Impulse: groupedData[week].impulse.reduce(
        (sum: number, transaction: Transaction) =>
          sum + transaction.amount.toNumber(),
        0
      ),
      'Non-Impulse': groupedData[week]['non-impulse'].reduce(
        (sum: number, transaction: Transaction) =>
          sum + transaction.amount.toNumber(),
        0
      ),
    },
  ]);

  return {
    chartDataWithSum: sortChartDataByWeek(chartDataWithSum),
    chartData: sortChartDataByWeek(chartData),
  };
};

export const getLastMonthDiscretionaryTotal = async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const expenses = await db.transaction.findMany({
    where: {
      userId: userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: {
      amount: true,
      recurring: true,
      personalFinanceCategory: true,
    },
  });

  const filteredExpenses = expenses.filter(discretionaryFilter);
  const totalExpenses = filteredExpenses
    .reduce((sum, transaction) => {
      return sum.plus(transaction.amount);
    }, new Decimal(0))
    .toNumber();

  return totalExpenses;
};

interface DailySum {
  date: string;
  impulse: Decimal | undefined;
  nonImpulse: Decimal | undefined;
  lastMonthDiscretionary: number;
}
export const getCurrentMonthDailySums = async (
  userId: string,
  lastMonthTotal: number
): Promise<DailySum[]> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  //   const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  //   const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId: userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: {
      date: 'asc',
    },
    select: {
      date: true,
      amount: true,
      impulse: true,
    },
  });

  const dailySumsMap: { [date: string]: DailySum } = {};
  let currentTransactionIndex = 0;
  let previousImpulseSum = new Decimal(0);
  let previousNonImpulseSum = new Decimal(0);

  for (let day = 1; day <= endOfMonth.getDate(); day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), day)
      .toISOString()
      .split('T')[0];

    let impulseSum: Decimal | undefined = previousImpulseSum;
    let nonImpulseSum: Decimal | undefined = previousNonImpulseSum;
    const lastMonthDiscretionary =
      lastMonthTotal * (day / endOfMonth.getDate());

    if (new Date(date) > now) {
      impulseSum = undefined;
      nonImpulseSum = undefined;
      dailySumsMap[date] = {
        date,
        impulse: impulseSum,
        nonImpulse: nonImpulseSum,
        lastMonthDiscretionary,
      };
      continue;
    }

    const dailySum: DailySum = {
      date,
      impulse: previousImpulseSum,
      nonImpulse: previousNonImpulseSum,
      lastMonthDiscretionary,
    };

    while (
      currentTransactionIndex < transactions.length &&
      transactions[currentTransactionIndex].date.toISOString().split('T')[0] ===
        date
    ) {
      const transaction = transactions[currentTransactionIndex];
      if (transaction.impulse) {
        dailySum.impulse = dailySum.impulse?.plus(transaction.amount);
      } else {
        dailySum.nonImpulse = dailySum.nonImpulse?.plus(transaction.amount);
      }
      currentTransactionIndex++;
    }

    previousImpulseSum = dailySum.impulse!;
    previousNonImpulseSum = dailySum.nonImpulse!;

    dailySumsMap[date] = dailySum;
  }

  const dailySums = Object.values(dailySumsMap);
  return dailySums;
};
