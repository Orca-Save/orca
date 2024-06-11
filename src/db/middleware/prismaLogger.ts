import { appInsightsClient } from '@/appInsights';
import { Prisma } from '@prisma/client';

export const loggingExtension = Prisma.defineExtension({
  name: 'logging',
  query: {
    async $allOperations({ model, operation, args, query }) {
      const startTime = Date.now();

      const queryDetails = JSON.stringify(args);
      try {
        const result = await query(args);
        let name = process.env.DATABASE_URL?.split('@')[1];
        name = name ? `PostgreSQL:${name}` : 'PostgreSQL';
        const duration = Date.now() - startTime;
        appInsightsClient.trackDependency({
          target: 'PostgreSQL',
          name,
          data: queryDetails,
          duration,
          resultCode: 0,
          success: true,
          dependencyTypeName: 'DB',
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        appInsightsClient.trackDependency({
          target: 'PostgreSQL',
          name: `PostgreSQL`,
          data: queryDetails,
          duration,
          resultCode: 1,
          success: false,
          dependencyTypeName: 'DB',
        });

        throw error;
      }
    },
  },
});
