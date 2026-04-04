import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { PrismaService } from 'src/prisma.service'
import * as bcrypt from 'bcrypt'
import { LoginUserDto, RegisterUserDto } from 'src/auth/dto'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { envs } from 'src/config'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signJWT(paylodad: JwtPayload) {
    return this.jwtService.sign(paylodad)
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      })
      return {
        user: user,
        token: await this.signJWT(user),
      }
    } catch (error) {
      console.log(error)
      throw new RpcException({
        status: 401,
        message: 'Invalid Token',
      })
    }
  }

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

      const { password: __, ...rest } = newUser
      return {
        user: rest,
        token: await this.signJWT(rest),
      }
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      })
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      })
      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        })
      }
      const isPasswordValid = bcrypt.compareSync(password, user.password)
      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        })
      }

      const { password: __, ...rest } = user

      return {
        user: rest,
        token: await this.signJWT(rest),
      }
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      })
    }
  }
}
