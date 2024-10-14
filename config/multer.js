const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // Import the Cloudinary configuration

// Configure multer to store files on Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        try {
            const isImage = file.mimetype.startsWith('image/');

            // Apply transformations only if the file is an image
            const transformations = isImage
                ? [
                    {
                        overlay: {
                            font_family: "Arial",
                            font_size: 50,
                            font_weight: "bold",
                            text: "Ndressilik"
                        },
                        gravity: "center",
                        opacity: 30,
                        x: 0,
                        y: 0
                    }
                ]
                : [];

            return {
                folder: 'announcements',
                resource_type: 'auto',  // This allows uploading images, videos, and other files
                transformation: transformations.length > 0 ? transformations : undefined,
                public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // Generating a unique public ID
                format: isImage ? 'jpg' : undefined, // Only force JPG format for images
            };
        } catch (error) {
            console.error('Error during Cloudinary parameters setup:', error);
            throw new Error('Cloudinary setup failed.');
        }
    },
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov', 'avi'],  // Allowed formats for files
    transformation: async (req, file) => {
        // Apply some transformations here as well (if needed globally)
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const isValid = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
        if (!isValid) {
            return cb(new Error('Only images and video files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // Set file size limit to 5 MB
    }
});

// Error handling middleware for Multer (for better debugging)
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors (e.g., file size exceeded)
        return res.status(400).send({ message: `Multer error: ${err.message}` });
    } else if (err) {
        // Handle general errors (e.g., file type or Cloudinary errors)
        return res.status(500).send({ message: `File upload error: ${err.message}` });
    }
    next();
};

module.exports = { upload, handleUploadErrors };
