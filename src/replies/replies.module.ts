// replies.module.ts
import { Module } from '@nestjs/common';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';

/**
 * Module for handling replies-related features.
 */
@Module({
  controllers: [RepliesController],
  providers: [RepliesService],
})
export class RepliesModule {}
