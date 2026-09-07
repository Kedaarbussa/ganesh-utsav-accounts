import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';
import { extractTokenFromHeader, verifyToken } from './_lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { fileData, fileName } = req.body || {};

  if (!fileData) {
    return res.status(400).json({ message: 'File data (base64) is required' });
  }

  try {
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadResponse = await cloudinary.uploader.upload(fileData, {
        folder: 'ganesh_utsav_accounts',
        resource_type: 'auto',
      });
      return res.status(200).json({
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
      });
    } else {
      return res.status(200).json({
        url: fileData,
        message: 'Uploaded in preview base64 mode (Cloudinary keys optional)',
      });
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ message: error.message || 'File upload failed' });
  }
}

module.exports = handler;
export default handler;
