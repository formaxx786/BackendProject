import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,    
        api_secret: process.env.CLOUDINARY_API_SECRET 
        
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) {
            throw new Error("Local file path is required");
        }
       // uploading the file to Cloudinary
       const response=await cloudinary.uploader.upload(localFilePath,
        {
              resource_type: "auto",
        }
       ) 
       console.log("File uploaded successfully",response.url);
       return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // delete the file if upload fails
        return null;
    }
}

       export { uploadOnCloudinary };