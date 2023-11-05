import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

import statusCodes from '@/httpStatusCodes';
import { UserModel } from '@/models/UserModel';
import { emailValidator, getKindeUser } from '@/lib/userAPI';

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

        const kindeUser = await getKindeUser(email);
        const kindeUserId = kindeUser.users[0].id;

        // Delete user from kinde
        const response = await axios.delete(
          `${domain}/api/v1/user?id=${kindeUserId}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response.data);
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
