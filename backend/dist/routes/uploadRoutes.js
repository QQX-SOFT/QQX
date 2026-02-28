"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const r2Client = new client_s3_1.S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: r2Client,
        bucket: process.env.R2_BUCKET,
        acl: "public-read",
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const ext = path_1.default.extname(file.originalname);
            const filename = `${(0, uuid_1.v4)()}${ext}`;
            cb(null, `uploads/${filename}`);
        },
    }),
});
// Generic upload endpoint
router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Keine Datei hochgeladen" });
    }
    // multer-s3 sets the location property
    const s3File = req.file;
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
exports.default = router;
