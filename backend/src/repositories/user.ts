import { Prisma, User } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


class UserRepo {
  async createUser(
    name: string,
    email: string,
    avatar: string,
    provider: string,
    providerId: string,
  ) {
    return await prisma.user.create({
      data: {
        name: name,
        email: email,
        avatar: avatar,
        provider: provider,
        providerId: providerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      }
    });
  }

  // Get single user info
  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      }
    });
  }

  async getUserById(id: string) {
    return await prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: {
        id
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      }
    })
  }
}

export const userRepo = new UserRepo();