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
      // console.log("File uploaded successfully",response.url);


      fs.unlinkSync(localFilePath); // delete the file after upload

      
       return response;
    } catch (error) {
         if (localFilePath && typeof localFilePath === "string" && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

       export { uploadOnCloudinary };