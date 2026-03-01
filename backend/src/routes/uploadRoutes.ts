import { Router } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const router = Router();

const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const upload = multer({
    storage: multerS3({
        s3: r2Client,
        bucket: process.env.R2_BUCKET!,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req: any, file: any, cb: any) {
            const ext = path.extname(file.originalname);
            const filename = `${uuidv4()}${ext}`;
            cb(null, `uploads/${filename}`);
        },
    }),
});

// Generic upload endpoint
router.post("/", upload.single("file"), (req: any, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Keine Datei hochgeladen" });
    }

    // multer-s3 sets the location property
    const s3File = req.file as any;

    // Check if we should use public URL prefix
    let fileUrl = s3File.location;
    if (process.env.R2_PUBLIC_URL && s3File.key) {
        fileUrl = `${process.env.R2_PUBLIC_URL}/${s3File.key}`;
    }

    res.json({
        url: fileUrl,
        key: s3File.key,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    });
});

export default router;
