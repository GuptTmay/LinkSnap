import { googleClient } from './../lib/google';
import { Response, Request } from "express";
import jwt from "jsonwebtoken";

import { userRepo } from "../repositories/user";
import { salt_rounds, JWT } from "../config";
import { failure, success } from "../helper/status";

export default class AuthController {
  async googleAuth(req: Request, res: Response) {
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

    let user = await userRepo.getUser(email);

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
    
    return res.status(200).json(success("Authentication Successful", { token }));
  }
  
  // blacklist jwt token in redis
  // async logout(req: Request, res: Response) {}
}

export const authController = new AuthController();