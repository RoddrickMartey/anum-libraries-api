import { v2 as cloudinary } from 'cloudinary';
import env from '../../config/env.js'; // Adjust the path to your env config
import { AppError } from '../../shared/utils/appError.js';

export type imageReturnType = {
  url: string;
  publicId: string;
};

// Configure Cloudinary using your environment variables
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  /**
   * Uploads a base64 image string to a specified folder in Cloudinary
   * @param base64Str The raw base64 string or Data URL (e.g., data:image/jpeg;base64,...)
   * @param folder Path folder inside Cloudinary (defaults to 'anum-libraries/covers')
   */
  static async uploadCover(
    base64Str: string,
    folder: string = 'anum-libraries/covers',
  ): Promise<{ url: string; publicId: string }> {
    try {
      const uploadStr = base64Str.startsWith('data:')
        ? base64Str
        : `data:image/jpeg;base64,${base64Str}`;

      const uploadResponse = await cloudinary.uploader.upload(uploadStr, {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 500, height: 750, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      return {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
      };
    } catch (error) {
      console.error('Cloudinary Upload Failure:', error);

      // 👇 Throw a proper operational AppError instead
      throw new AppError(
        400,
        'IMAGE_UPLOAD_FAILED',
        'Failed to upload the cover image to the cloud storage service.',
        {
          details:
            error instanceof Error ? error.message : 'Unknown Cloudinary error',
        },
      );
    }
  }

  /**
   * Deletes an asset from Cloudinary using its public_id tracking path
   * @param publicId The exact publicId stored in your database row
   */
  static async deleteCover(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary Deletion Failure:', error);
      // We don't necessarily want to crash the request if a cloud asset sync fail occurs,
      // but we log it so you are aware.
      return false;
    }
  }
}
