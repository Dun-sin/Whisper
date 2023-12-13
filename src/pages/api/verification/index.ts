import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';

import httpStatusCodes from '@/httpStatusCodes';
import sendMail from '@/service/mailService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method } = req;
    switch (method) {
      case 'POST': {
        await sendMail(
          'test',
          'jesudunsinfaiye@gmail.com',
          'this is a test for my users'
        );
        res.status(httpStatusCodes.OK).send('Success');
        break;
      }
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        res
          .status(httpStatusCodes.METHOD_NOT_ALLOWED)
          .end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    const err = error as ApiError;
    res.status(httpStatusCodes.BAD_REQUEST).json({
      error_code: 'verification',
      method: err.message,
    });
  }
};
