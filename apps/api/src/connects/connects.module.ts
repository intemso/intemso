import { Module } from '@nestjs/common';
import { ConnectsController } from './connects.controller';
import { ConnectsService } from './connects.service';

@Module({
  controllers: [ConnectsController],
  providers: [ConnectsService],
  exports: [ConnectsService],
})
export class ConnectsModule {}
