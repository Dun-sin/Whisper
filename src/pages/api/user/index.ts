import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

import statusCodes from '@/shared/constants/httpStatusCodes';
import { UserModel } from '@/server/models/UserModel';
import { emailValidator } from '@/server/lib/userAPI';

let accessToken = process.env.ACCESS_TOKEN;
const domain = process.env.DOMAIN;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'DELETE') {
    emailValidator(req, res, async () => {
      const { email } = req.body;
      try {
        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
          return res
            .status(statusCodes.NOT_FOUND)
            .json({ error: 'User not found' });
        }

        // Delete the user
        await UserModel.deleteOne();

        return res
          .status(statusCodes.OK)
          .json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error(error);
        return res
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Internal server error' });
      }
    });
  }
};
