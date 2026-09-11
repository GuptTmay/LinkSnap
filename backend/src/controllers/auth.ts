import { googleClient } from './../lib/google';
import { Response, Request } from "express";
import jwt from "jsonwebtoken";

import { userRepo } from "../repositories/user";
import { failure, success } from "../utils/status";
import { JWT } from '../config';
import { isRecordNotFoundError } from '../utils/prisma';

export default class AuthController {
  async googleAuth(req: Request, res: Response) {
    try {

      const { credential } = req.body;

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(401).json({
          success: false,
        });
      }

      const email = payload.email!;
      const name = payload.name!;
      const avatar = payload.picture!;
      const googleId = payload.sub;

      let user = await userRepo.getUserByEmail(email);

      if (!user) user = await userRepo.createUser(name, email, avatar, "google", googleId);

      if (!user || !user.id) {
        return res.status(500).json(failure("User Authentication Failed Retry later!", "INTERNAL_ERROR"));
      }

      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "7d",
        }
      );

      // Injecting token into cookie payload headers block
      res.cookie('token', token, {
        httpOnly: true, // Blocks client scripts execution layer access (Stops XSS)
        secure: process.env.NODE_ENV === "production", // Mandates HTTPS delivery pipelines only
        sameSite: 'lax', // Defense layer guarding from cross-site request forgeries (CSRF)
        path: '/',
        maxAge: JWT.TOKEN_EXP * 1000 // token age 
      });

      return res.status(200).json(success("Authentication Successful", {}));

    } catch (err) {
      console.error(err);

      return res
        .status(500)
        .json(failure("Internal server error", "INTERNAL_ERROR", err));
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const user = await userRepo.getUserById(userId);

      return res.status(200).json(
        success("User fetched successfully", {
          user,
        })
      );
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        return res
          .status(404)
          .json(failure("User not found", "NOT_FOUND"));
      }
      console.error(err);

      return res
        .status(500)
        .json(failure("Internal server error", "INTERNAL_ERROR", err));
    }
  }

  // Todo: blacklist jwt token in redis
  async logout(req: Request, res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    });

    return res.status(200).json(success("Cookie successfully cleared.", {}));
  };
}

export const authController = new AuthController();
