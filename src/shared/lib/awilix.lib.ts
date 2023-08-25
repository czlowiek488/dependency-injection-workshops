import * as awilix from "awilix";
import type { BuildResolver } from "awilix";

export const asArray = <TResolver>(resolvers: awilix.Resolver<TResolver>[]): awilix.Resolver<TResolver[]> => ({
  resolve: (container) => resolvers.map((resolver) => container.build(resolver)),
});
export interface DependencyProxyHandlerOptions {
  dependencyName: string;
}

export const asProxied = <TFunction extends (...args: any) => any>(
  fun: ((...args: any) => any) | (new (...args: any) => any),
  proxies: ((options: DependencyProxyHandlerOptions) => ProxyHandler<any>)[],
): BuildResolver<ReturnType<TFunction>> =>
  awilix.asFunction<ReturnType<TFunction>>(
    proxies.reduce(
      //@ts-ignore
      (target: any, handler: TFunction) => (some: any) =>
        new Proxy(target(some), handler({ dependencyName: fun.name })) as any,
      fun.prototype === undefined
        ? fun
        : (...classConstructorArgs: any): any => new (fun as new (...args: any) => any)(...classConstructorArgs),
    ) as any,
  );
