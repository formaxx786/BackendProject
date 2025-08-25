import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js'; 
import {uploadOnCloudinary} from '../utils/cloudinary.js'; 
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save(
      {
        validateBeforeSave: false
      });

      return {accessToken, refreshToken};

  } catch (error) {
    throw new ApiError("Error generating tokens", 500);
  }
}

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
 const existingUser= await User.findOne({$or: [{ email }, { username }]
})
if(existingUser){
    throw new ApiError("User already exists", 409);
  }

  console.log(req.files);
  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
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

const loginUser=asyncHandler(async(req,res)=>{

//req body -> data
//username or email
//find the user
//password check
//access and refresh token generation
//send cookies
//send response


//step-1
const {email , username, password} = req.body;

//step-2

if(!(email || username)){
    throw new ApiError("Email or username is required", 400);
  }
  
  //step-3
  const user = await User.findOne({$or : [{email},{username}]})

  if(!user){
    throw new ApiError("User not found", 404);
  }

  //step-4

const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError("Invalid password", 401);
  }


//step-5

//await generateAccessAndRefereshTokens(user._id)
const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);



const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");

//step-6
 const options = {
  httpOnly: true,
  secure: true
 }

 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .json(
   new ApiResponse(200,
    {
      user : LoggedInUser, accessToken, refreshToken
    },
    "User logged in successfully"
   )
 );


})


const logoutUser = asyncHandler(async(req,res)=>{
  //get user id from req.user
  //find the user from database
  //remove refresh token from database
  //remove cookies from client side
  //send response

await User.findByIdAndUpdate(
  req.user._id,
  {
    $set: {
      refreshToken: null
    }
  },
  {
    new: true,
  }
)

const options = {
  httpOnly: true,
  secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(
  new ApiResponse(200, {}, "User logged out successfully")
)

})


const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET)
   const user = await User.findById(decodedToken?._Id)
  
  if(!user){
    throw new ApiError(401,"Invalid refresh token");
  }
  if(user.refreshToken !== incomingRefreshToken){
    throw new ApiError(401,"Refresh token is expired or used");
  }
  const options = {
    httpOnly: true,
    secure: true
   }
  
   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
  
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
     new ApiResponse(200,
      { accessToken, refreshToken},
      "Access token refreshed successfully"
     )
   );
  
  } catch (error) {
    throw new ApiError(error?.message || "Invalid refresh token", 401);
  }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };