import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GigsModule } from './gigs/gigs.module';
import { CategoriesModule } from './categories/categories.module';
import { ApplicationsModule } from './applications/applications.module';
import { ContractsModule } from './contracts/contracts.module';
import { MilestonesModule } from './milestones/milestones.module';
import { PaymentsModule } from './payments/payments.module';
import { WalletModule } from './wallet/wallet.module';
import { ConnectsModule } from './connects/connects.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReportsModule } from './reports/reports.module';
import { StudentsModule } from './students/students.module';
import { SavedItemsModule } from './saved-items/saved-items.module';
import { ServicesModule } from './services/services.module';
import { AdminModule } from './admin/admin.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuditLogModule } from './common/audit-log.module';
import { HealthModule } from './health/health.module';
import { CommunityModule } from './community/community.module';
import { ShowcaseModule } from './showcase/showcase.module';
import { DisputesModule } from './disputes/disputes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisPassword = config.get<string>('REDIS_PASSWORD');
        return {
          store: await redisStore({
            host: config.get('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
            ...(redisPassword && { password: redisPassword }),
            ...(config.get('REDIS_TLS') === 'true' && { tls: {} }),
          }),
          ttl: 60_000, // default 60s
        };
      },
    }),
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    GigsModule,
    CategoriesModule,
    ApplicationsModule,
    ContractsModule,
    MilestonesModule,
    PaymentsModule,
    WalletModule,
    ConnectsModule,
    MessagingModule,
    NotificationsModule,
    ReviewsModule,
    ReportsModule,
    StudentsModule,
    SavedItemsModule,
    ServicesModule,
    AdminModule,
    UploadsModule,
    AuditLogModule,
    HealthModule,
    CommunityModule,
    ShowcaseModule,
    DisputesModule,
  ],
})
export class AppModule {}
