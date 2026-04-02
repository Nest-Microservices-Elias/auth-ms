import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { PrismaService } from 'src/prisma.service'
import * as bcrypt from 'bcrypt'
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
          message: 'User already exists',
        })
      }
      const newUser = await this.prisma.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 10),
          name: name,
        },
      })

      const {password:__, ...rest} =newUser
      return {
        user: rest,
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
