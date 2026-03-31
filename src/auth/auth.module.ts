import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { NatsModule } from 'src/transports/nats.module'
import { PrismaService } from 'prisma.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  imports: [NatsModule],
})
export class AuthModule {}
