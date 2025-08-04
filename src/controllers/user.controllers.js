import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js'; 
import {uploadOnCloudinary} from '../utils/cloudinary.js'; 
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res, next) =>{
  //get user details from front-end

  // validation - like not empty, valid email, password strength, etc.

  // check if user already exists : username or email

  //check for images & avatar

  //upload them to cloudinary or any other cloud storage,avatar

  //create user object with details - create entry in database

  //remove password and refresh token field from response

  //check if user is created successfully

  //send response back to client with user details

  //save user to database


  //step-1

  const {fullname,email,username,password}=req.body

  console.log("email:",email);

  //step-2

  if(
    [fullname,email,username,password].some(field => field?.trim()==="")
  ){
    throw new ApiError("All fields are required", 400);
  }

  //step-3
 const existingUser=User.findOne({$or: [{ email }, { username }]
})
if(existingUser){
    throw new ApiError("User already exists", 409);
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;


  //step-4

  if(!avatarLocalPath ){
    throw new ApiError("Avatar is required", 400);
  }
  

  //step-5

const avatar = await uploadOnCloudinary(avatarLocalPath)

const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

if(!avatar){
    throw new ApiError("Avatar upload failed", 500);
  }

  //step-6
  const user = await User.create({
    fullname,
    email,
    username : username.toLowerCase(),
    password,
    avatar: avatar.url, // Assuming the response contains a URL
    coverImage: coverImage ?.url || null // Optional cover image
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError("User creation failed", 500);
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );


})


export { registerUser };