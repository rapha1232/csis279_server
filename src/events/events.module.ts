// events.module.ts
import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

/**
 * Module for handling events-related features.
 */
@Module({
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
