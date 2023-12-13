import { NextApiRequest, NextApiResponse } from 'next';

import { UserModel } from '@/models/UserModel';
import { emailValidator } from '@/lib/userAPI';
import statusCodes from '@/httpStatusCodes';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    emailValidator(req, res, async () => {
      const { username, aboutMe, gender, age, email, settings } = req.body;

      try {
        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
          return res
            .status(statusCodes.NOT_FOUND)
            .json({ error: 'User not found' });
        }

        // Update user's profile with provided fields or the User fields or defaults
        user.username = username || user.username || 'Anonymous';
        user.aboutMe = aboutMe || user.aboutMe || null;
        user.gender = gender || user.gender || 'Unknown';
        user.age = age || user.age || null;
        user.settings = settings || user.settings;

        // Save the updated user profile
        await user.save();

        return res
          .status(statusCodes.OK)
          .json({ message: 'Profile updated successfully' });
      } catch (error) {
        console.error(error);
        return res
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Internal server error' });
      }
    });
  }
};
