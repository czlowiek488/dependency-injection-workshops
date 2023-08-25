import type { OnErrorPayload, OnNonFunctionPayload, OnSuccessPayload } from "generic-interceptor";
import { ProcessingResult } from "generic-interceptor";
import { interceptor } from "generic-interceptor";
import { secureJsonStringify } from "../parser/secure-json.parser";
import type { DependencyProxyHandlerOptions } from "../lib/awilix.lib";

export const buildFunctionMessage = (payload: OnErrorPayload<false> | OnSuccessPayload<false>): string =>
  `(${secureJsonStringify(payload.functionArgs)}) => ${payload.processingStrategy}#${
    payload.processingResult
  }:${secureJsonStringify(
    payload.processingResult === ProcessingResult.failed ? payload.functionError : payload.functionResult,
  )}`;

export const buildMessage = (
  payload: OnErrorPayload<false> | OnSuccessPayload<false> | OnNonFunctionPayload,
  options: DependencyProxyHandlerOptions,
): string =>
  `${options.dependencyName}.<${payload.fieldValueType}>${String(payload.fieldKey)}${
    "processingResult" in payload ? buildFunctionMessage(payload) : ""
  }`;

export const loggerProxy = (options: DependencyProxyHandlerOptions): ProxyHandler<{ [key: string]: unknown }> =>
  interceptor({
    passId: false,
    onBefore: (payload) => {
      console.log(buildMessage(payload, options));
    },
    onError: (payload) => {
      console.warn(buildMessage(payload, options), payload.functionError);
    },
    onSuccess: (payload) => {
      console.log(buildMessage(payload, options));
    },
    onNonFunction: () => {},
  });
