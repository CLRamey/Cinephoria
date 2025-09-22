// backend/src/controllers/auth.controller.ts
import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { verifyToken, VerificationTokenPayload } from '../utils/tokenManagement';
import { user } from '../models/init-models';
import { logerror } from '../utils/logger';
import { Role } from '../validators/userValidator';

export const cookieCheckController = asyncHandler(cookieCheckHandler);
export async function cookieCheckHandler(req: Request) {
  const token = req.signedCookies?.['access_token'];
  if (!token) {
    return { success: false, error: { code: 'UNAUTHORIZED' } };
  }

  let payload: VerificationTokenPayload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    logerror('cookie error', error);
    return { success: false, error: { code: 'UNAUTHORIZED' } };
  }

  const currentUser = await user.findByPk(payload.userId, {
    attributes: ['user_role', 'isVerified'],
  });

  const isVerified = currentUser?.get('isVerified') === true;
  if (!currentUser || !isVerified) {
    return { success: false, error: { code: 'UNAUTHORIZED' } };
  }

  const dbRole = currentUser?.get('user_role') as string | null;
  const userRole: Role | null =
    dbRole === 'admin'
      ? Role.ADMIN
      : dbRole === 'employee'
        ? Role.EMPLOYEE
        : dbRole === 'client'
          ? Role.CLIENT
          : null;
  if (!userRole) {
    return { success: false, error: { code: 'UNAUTHORIZED' } };
  }

  return {
    success: true,
    data: { userRole: userRole },
  };
}
