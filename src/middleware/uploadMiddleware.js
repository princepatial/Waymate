import multer from "multer";
import path from "path";
import fs from "fs";

const createStorage = (folder) => multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(`uploads/${folder}`, { recursive: true });
        cb(null, `uploads/${folder}/`);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only jpg, jpeg, png, webp images allowed"), false);
    }
};

const limits = { fileSize: 5 * 1024 * 1024 };

export const uploadProfilePic = multer({ storage: createStorage("profile-pictures"), fileFilter, limits });
export const uploadLicenseImage = multer({ storage: createStorage("license-images"), fileFilter, limits });
export const uploadVehicleImage = multer({ storage: createStorage("vehicle-images"), fileFilter, limits });