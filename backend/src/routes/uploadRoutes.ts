import { Router, Request, Response } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const router = Router();

// Lazy initialization to prevent crash when R2 env vars are missing
let upload: multer.Multer | null = null;

function getUploader(): multer.Multer {
    if (upload) return upload;

    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
        throw new Error("R2 environment variables are not configured (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET)");
    }

    const r2Client = new S3Client({
        region: "auto",
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
    });

    upload = multer({
        storage: multerS3({
            s3: r2Client,
            bucket,
            acl: "public-read",
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (_req: any, file: any, cb: any) {
                const ext = path.extname(file.originalname);
                const filename = `${crypto.randomUUID()}${ext}`;
                cb(null, `uploads/${filename}`);
            },
        }),
    });

    return upload;
}

// Generic upload endpoint
router.post("/", (req: Request, res: Response, next) => {
    try {
        const uploader = getUploader();
        uploader.single("file")(req, res, (err: any) => {
            if (err) {
                console.error("Upload error:", err);
                return res.status(500).json({ error: "Upload fehlgeschlagen: " + err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: "Keine Datei hochgeladen" });
            }

            const s3File = req.file as any;

            let fileUrl = s3File.location;
            if (process.env.R2_PUBLIC_URL && s3File.key) {
                fileUrl = `${process.env.R2_PUBLIC_URL}/${s3File.key}`;
            }

            res.json({
                url: fileUrl,
                key: s3File.key,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            });
        });
    } catch (error: any) {
        console.error("Upload config error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;
