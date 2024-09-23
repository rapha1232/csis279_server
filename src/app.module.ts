// app.module.ts
import { Module } from '@nestjs/common';
import { MiddlewareModule } from '@nestjs/core/middleware/middleware-module';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { EventsModule } from './events/events.module';
import { QuestionsModule } from './questions/questions.module';
import { RepliesModule } from './replies/replies.module';

@Module({
  imports: [
    // rate limiting
    ThrottlerModule.forRoot([
      {
        limit: 10,
        ttl: 60000,
      },
    ]),
    MiddlewareModule,
    AuthModule,
    DiscussionsModule,
    EventsModule,
    QuestionsModule,
    RepliesModule,
  ],
  providers: [JwtService],
})
export class AppModule {}
