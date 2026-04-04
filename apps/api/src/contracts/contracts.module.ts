import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { CommunityModule } from '../community/community.module';
import { ConnectsModule } from '../connects/connects.module';

@Module({
  imports: [CommunityModule, ConnectsModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
