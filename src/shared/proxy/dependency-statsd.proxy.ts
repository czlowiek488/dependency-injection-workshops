/* eslint-disable @typescript-eslint/no-unused-vars */
import { interceptor } from "generic-interceptor";
import type { DependencyProxyHandlerOptions } from "../lib/awilix.lib";
// import { DateTime } from "luxon";
// import { asyncLocalStorage } from "../middleware/common.middleware";
// import { statsDFunction } from "../statsd";

// const storage: { [key: string]: { startTime: number } } = {};

export const statsDProxy = (options: DependencyProxyHandlerOptions): ProxyHandler<{ [key: string]: unknown }> =>
  interceptor({
    passId: true,
    onBefore: (payload) => {
      // storage[payload.uniqueAccessId] = { startTime: DateTime.now().toMillis() };
    },
    onError: (payload) => {
      // statsDFunction.timing(
      //   "function_execution",
      //   DateTime.now().toMillis() - storage[payload.uniqueAccessId].startTime,
      //   {
      //     function_name: payload.fieldKey,
      //     dependency_name: options.dependencyName,
      //     function_result: "failure",
      //     request_id: asyncLocalStorage.getStore()?.requestId || "UNKNOWN",
      //     user_id: asyncLocalStorage.getStore()?.userId || "UNKNOWN",
      //   },
      // );
    },
    onSuccess: (payload) => {
      // statsDFunction.timing(
      //   "function_execution",
      //   DateTime.now().toMillis() - storage[payload.uniqueAccessId].startTime,
      //   {
      //     function_name: payload.fieldKey,
      //     dependency_name: options.dependencyName,
      //     function_result: "succeed",
      //     request_id: asyncLocalStorage.getStore()?.requestId || "UNKNOWN",
      //     user_id: asyncLocalStorage.getStore()?.userId || "UNKNOWN",
      //   },
      // );
    },
    onNonFunction: () => {},
  });
