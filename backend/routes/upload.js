import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Cloudinary Config
// Looks for CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/image', async (req, res) => {
    try {
        const { image } = req.body; // Expecting base64 string

        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: 'event_wall', // Optional folder support
            resource_type: 'image',
            transformation: [
                { width: 1000, crop: "limit" }, // Resize large images
                { quality: "auto" } // Optimize quality
            ]
        });

        res.json({
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

export default router;
