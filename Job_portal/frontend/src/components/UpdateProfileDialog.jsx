import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "../components/ui/dialog";
import { DialogHeader } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { USER_API_END_POINT } from "@/utils/constant";
import axios from "axios";
// import { store } from "../redux/store";
import { setUser } from "../redux/authSlice";
import { toast } from "sonner";
import { useDispatch } from "react-redux";

const UpdateProfileDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.profile?.bio || "",
    skills: Array.isArray(user?.profile?.skills)
      ? user.profile.skills.join(", ")
      : "",
    file: null,
    profilePicture: null,
    profilePicturePreview: null,
  });
  const dispatch = useDispatch();
  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value);
    setInput({ ...input, [name]: value });
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    console.log("File selected:", file?.name);
    setInput({ ...input, file });
  };

  // Clean up function for object URLs
  const cleanupObjectUrls = () => {
    if (input.profilePicturePreview) {
      URL.revokeObjectURL(input.profilePicturePreview);
    }
  };
  
  // Clean up when component unmounts
  React.useEffect(() => {
    return () => {
      cleanupObjectUrls();
    };
  }, []);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    if (input.file) {
      console.log("🧾 Resume File Info:");
      console.log("  Name:", input.file.name);
      console.log("  Type:", input.file.type);
      console.log("  Size:", input.file.size);
      console.log("  instanceof File:", input.file instanceof File);
    }
    
    if (input.profilePicture) {
      console.log("🖼️ Profile Picture Info:");
      console.log("  Name:", input.profilePicture.name);
      console.log("  Type:", input.profilePicture.type);
      console.log("  Size:", input.profilePicture.size);
      console.log("  instanceof File:", input.profilePicture instanceof File);
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);
    
    // Append resume file if selected
    if (input.file) {
      formData.append("file", input.file);
    }
    
    // Append profile picture if selected
    if (input.profilePicture) {
      formData.append("profilePicture", input.profilePicture);
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/profile/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
    // Clean up object URLs
    cleanupObjectUrls();
    
    setOpen(false);
    console.log(input);
  };
  return (
    <div>
      <Dialog open={open}>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={() => setOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitHandler}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullname" className="text-right">
                  Name
                </Label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={input.fullname}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={input.email}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">
                  Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="number"
                  value={input.phoneNumber}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">
                  Bio
                </Label>
                <Input
                  id="bio"
                  name="bio"
                  type="text"
                  value={input.bio}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skills" className="text-right">
                  Skills
                </Label>
                <Input
                  id="skills"
                  name="skills"
                  type="text"
                  value={input.skills}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  Resume
                </Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  onChange={fileChangeHandler}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profilePicture" className="text-right">
                  Profile Picture
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Create preview URL for the selected image
                        const previewUrl = URL.createObjectURL(file);
                        setInput({ 
                          ...input, 
                          profilePicture: file,
                          profilePicturePreview: previewUrl
                        });
                      } else {
                        setInput({
                          ...input,
                          profilePicture: null,
                          profilePicturePreview: null
                        });
                      }
                    }}
                  />
                  
                  {/* Preview of current or new profile picture */}
                  {(input.profilePicturePreview || user?.profile?.profilePicture) && (
                    <div className="mt-2 flex flex-col items-center">
                      <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-200">
                        <img 
                          src={input.profilePicturePreview || user?.profile?.profilePicture}
                          alt="Profile Preview" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {input.profilePicture ? 'New profile picture' : 'Current profile picture'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <Button className="w-full my-4" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </Button>
            ) : (
              <Button type="submit" className="w-full my-4">
                Update
              </Button>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateProfileDialog;
