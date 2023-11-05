import { NextApiRequest, NextApiResponse } from 'next';

import { UserModel } from '@/models/UserModel';
import { emailValidator } from '@/lib/userAPI';
import statusCodes from '@/httpStatusCodes';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    emailValidator(req, res, async () => {
      try {
        const { email } = req.query;

        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
          return res
            .status(statusCodes.NOT_FOUND)
            .json({ error: 'User not found' });
        }

        // Send the user profile data as JSON response
        res.status(statusCodes.OK).json(user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        res
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Internal server error' });
      }
    });
  }
};
