import { Prisma, User } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


class UserRepo {
  async createUser(name: string, email: string, password: string): Promise<{ id: string }> {
    return await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: password,
      },
      select: {
        id: true
      }
    });
  }

  // Get single user info
  async getUser(email: string) {
    return await prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true
      }
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
      }
    })
  }

  // Access the violated field via e.meta.target
  isUniqueConstraintError(err: unknown): boolean {
    return (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    );
  }
}

export const userRepo = new UserRepo();