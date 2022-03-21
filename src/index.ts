import { IApi } from '@umijs/types';
import fs from 'fs';
import { join } from 'path';

type RevMapOptions<T> = {
  /** 子节点的 key */
  childKey?: string;

  /** 是否优先遍历子节点 */
  childrenFirst?: boolean;
  parent?: T;
};

/**
 * 遍历树状结构，并扁平化
 * @param data 树状数据
 * @param callback 返回值处理
 * @param options 配置
 */
function revFlatMap<T extends Object>(data: T[], callback: (d: T, parent: T | undefined, index: number) => T | undefined, options: RevMapOptions<T> = {}): T[] {
  const { childrenFirst, childKey = 'children', parent } = options;
  const res: T[] = [];
  data.forEach((datum, index) => {
    // error object
    if (!datum) {
      return;
    }
    let children = datum[childKey] as T[] | undefined;
    let newDatum: T | undefined;
    if (childrenFirst) {
      if (Array.isArray(children)) {
        children = revFlatMap(children, callback, { ...options, parent: datum });
      }
      newDatum = callback(
        {
          ...datum,
          [childKey]: children,
        },
        parent,
        index,
      );
    } else {
      newDatum = callback({ ...datum }, parent, index);
      if (newDatum && Array.isArray(children)) {
        children = revFlatMap(children, callback, { ...options, parent: newDatum });
        newDatum['children'] = children;
      }
    }
    res.push(newDatum || datum);
    if (children) {
      res.push(...children);
    }
  });
  return res;
}

export default (api: IApi) => {
  api.describe({
    key: 'routesExport',
    config: {
      schema(joi) {
        return joi.object({
          /** 输出文件名 */
          filename: joi.string(),
        });
      },
    },
  });

  let routeList = [] as any[];
  api.modifyRoutes({
    fn: (routes) => {
      routeList = revFlatMap(
        routes,
        (item) => {
          return item;
        },
        { childrenFirst: true, childKey: 'routes' },
      )
        .filter((route) => {
          if (route.path?.includes(':')) {
            return false;
          }
          if (route.path?.startsWith('/exception/')) {
            return false;
          }
          if (route.path === '/') {
            return false;
          }
          return route.exact;
        })
        .map((route) => {
          return route.path;
        });

      return routes;
    },
    stage: 1,
  });

  api.onBuildComplete(() => {
    const { routesExport = {} } = api.config;
    const { filename = 'routes.json' } = routesExport;

    const outputFilePath = join(api.paths.absOutputPath ?? '', filename);
    api.logger.info('export: ' + outputFilePath);
    fs.writeFile(outputFilePath, JSON.stringify(routeList), (err) => {
      if (err) {
        api.logger.error('export routes.json failed');
        console.error(err);
      }
    });
  });
};
