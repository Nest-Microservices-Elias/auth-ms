import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { PrismaService } from 'prisma.service'
import { RegisterUserDto } from 'src/auth/dto'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      })
      if (user) {
        throw new RpcException({
          status: 400,
          message: 'uaser already exists',
        })
      }
      const newUser = await this.prisma.user.create({
        data: {
          email: email,
          password: password,
          name: name,
        },
      })
      return {
        user: newUser,
        token: 'ABS',
      }
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      })
    }
  }
}
