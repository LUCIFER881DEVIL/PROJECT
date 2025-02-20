import {v2 as cloudinary} from "cloudinary";
import fs from 'fs';


    cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_API_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET
    });

const uploadoncloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath)return null("file not found")
            const response = await cloudinary.uploader.upload(localfilepath,{
                resource_type:"auto"
            })
            // console.log("file has been uploaded successfully",response.url);
            fs.unlinkSync(localfilepath)
            return response;
    } catch (error) {
        fs.unlinkSync(localfilepath)
        return null
    }
}    

export{uploadoncloudinary}


















//     // Upload an image
//     const uploadResult = await cloudinary.uploader.upload(
//         'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//             public_id: 'shoes',
//         }
//     )
//     .catch((error) => {
//         console.log(error);
//     });
 
//  console.log(uploadResult);