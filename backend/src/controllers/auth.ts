import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { userRepo } from "../repositories/user";
import { salt_rounds, JWT } from "../config";
import { failure, success } from "../helper/status";

export default class AuthController {
  /*
    input: 
    {
      name:
      email: 
      password:
    }
  */
  async signup(req: Request, res: Response) {
    try {
      const hashpass = await bcrypt.hash(req.body.password, salt_rounds);

      await userRepo.createUser(
        req.body.name,
        req.body.email,
        hashpass
      );

      return res.status(201).json(success("User registered successfully", null));
    }
    catch (err) {
      console.error(err);
      if (userRepo.isUniqueConstraintError(err)) {
        return res.status(400).json(failure("Email already exist", "EMAIL_ALREADY_EXISTS"));
      }
      return res.status(500).json(failure("Failed to register user", "INTERNAL_ERROR", err));
    }
  }

  /*
    input: {
      email:  
      password:
    } 
    return: {
      token:  
    }
  */
  async signin(req: Request, res: Response) {
    try {
      const user = await userRepo.getUser(req.body.email);

      if (!user)
        return res.status(401).json(failure("Invalid email or password.", "INVALID_CREDENTIALS"));

      const isMatch = await bcrypt.compare(req.body.password, user.password);

      if (!isMatch) return res.status(401).json(failure("Invalid email or password.", "INVALID_CREDENTIALS"));

      const token = jwt.sign({ id: user.id }, JWT.SECRET_KEY, {
        expiresIn: JWT.TOKEN_EXP,
      });

      return res.status(200).json(success("Authentication Successful", {token}));
    } catch (error) {
      return res.status(500).json(
        failure(
          "Signin failed! Something went wrong.",
          "INTERNAL_ERROR",
          error
        )
      );
    }
  }

  // blacklist jwt token in redis
  // async logout(req: Request, res: Response) {}
}

export const authController = new AuthController();