import { appInsightsClient } from '@/appInsights';
import { Prisma } from '@prisma/client';

export const loggingExtension = Prisma.defineExtension({
  name: 'logging',
  query: {
    async $allOperations({ model, operation, args, query }) {
      const startTime = Date.now();

      const queryDetails = JSON.stringify(args);
      let target = process.env.DATABASE_URL?.split('@')[1];
      target = target ? `${target}` : 'PostgreSQL';
      try {
        const result = await query(args);
        const duration = Date.now() - startTime;
        appInsightsClient.trackDependency({
          target,
          name: `${model}:${operation}`,
          duration,
          resultCode: 0,
          success: true,
          type: 'PostgreSQL',
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        appInsightsClient.trackDependency({
          target,
          name: `${model}:${operation}`,
          data: queryDetails,
          duration,
          resultCode: 1,
          success: false,
          type: 'PostgreSQL',
        });

        throw error;
      }
    },
  },
});
