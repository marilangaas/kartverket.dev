import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { GithubEntityProvider } from '@backstage/plugin-catalog-backend-module-github';
import { MicrosoftGraphOrgEntityProvider } from '@backstage/plugin-catalog-backend-module-msgraph';
import {msGraphGroupTransformer} from "./transformers/msGraphTransformer";
import { RoleEntitiesProcessor } from '@internal/plugin-kind-role-common';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addProcessor(new RoleEntitiesProcessor())
  builder.addEntityProvider(
      GithubEntityProvider.fromConfig(env.config, {
        logger: env.logger,
        scheduler: env.scheduler,
      }),
  );
  builder.addEntityProvider(
      MicrosoftGraphOrgEntityProvider.fromConfig(env.config, {
          logger: env.logger,
          scheduler: env.scheduler,
          groupTransformer: msGraphGroupTransformer,
      }),
  );
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
