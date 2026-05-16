import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { SendOtpUseCase } from '@application/use-cases/auth/SendOtpUseCase';
import { VerifyOtpUseCase } from '@application/use-cases/auth/VerifyOtpUseCase';
import { RegisterCustomerUseCase } from '@application/use-cases/auth/RegisterCustomerUseCase';
import { LoginCustomerUseCase } from '@application/use-cases/auth/LoginCustomerUseCase';

export class AuthController {
  constructor(
    private sendOtpUseCase: SendOtpUseCase,
    private verifyOtpUseCase: VerifyOtpUseCase,
    private registerUseCase: RegisterCustomerUseCase,
    private loginUseCase: LoginCustomerUseCase,
  ) {}

  sendOtp = asyncHandler(async (req: Request, res: Response) => {
    await this.sendOtpUseCase.execute(req.body.phone);
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.verifyOtpUseCase.execute(req.body.phone, req.body.code);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.registerUseCase.execute(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.loginUseCase.execute(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  });
}
