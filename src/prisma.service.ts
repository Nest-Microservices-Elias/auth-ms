import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from 'generated/prisma/client'
import 'dotenv/config'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger('PrismaService')

  async onModuleInit() {
    await this.$connect()
    this.logger.log('MongoDB Connected')
  }
}
