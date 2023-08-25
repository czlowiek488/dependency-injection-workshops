import type { OnErrorPayload } from "generic-interceptor";
import { interceptor } from "generic-interceptor";
import { stringifyError } from "../parser/stringify-error.parser";
import type { DependencyProxyHandlerOptions } from "../lib/awilix.lib";
import { appConfig } from "../config";

export const buildMessage = (payload: OnErrorPayload<false>, options: DependencyProxyHandlerOptions): string =>
  `${options.dependencyName}.${payload.fieldKey} > ${stringifyError(payload.functionError)}`;

export const errorProxy = (options: DependencyProxyHandlerOptions): ProxyHandler<{ [key: string]: unknown }> =>
  interceptor({
    passId: false,
    onSuccess: () => {},
    onBefore: () => {},
    onNonFunction: () => {},
    onError: (payload) => {
      if (appConfig.NODE_STAGE !== "production") {
        Object.assign(payload.functionError as Error & { decoration: string }, {
          decoration: buildMessage(payload, options),
        });
      }
      return payload.functionError;
    },
  });
