// export function trackFunctionCall(functionName, func) {
//   return async function (...args) {
//     const start = Date.now();
//     client.trackEvent({
//       name: `FunctionCall - ${functionName}`,
//       properties: { startTime: start },
//     });

//     try {
//       const result = await func(...args);
//       const duration = Date.now() - start;
//       client.trackMetric({
//         name: `FunctionDuration - ${functionName}`,
//         value: duration,
//       });
//       return result;
//     } catch (error) {
//       client.trackException({ exception: error });
//       throw error;
//     }
//   };
// }
