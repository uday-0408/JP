import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import BookmarkedJobs from "./BookmarkedJobs";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "../hooks/useGetAppliedJobs";

// const skills = ["html", "css", "js", "react"];
// const skills=[]

const isHaveResume = true;
const Profile = () => {
  useGetAppliedJobs(); // Custom hook to fetch applied jobs
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);

  return (
    <div>
      <Navbar></Navbar>

      <div className="max-w-4xl shadow-xl  mx-auto bg-white border-gray-200 my-5 p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-4 ">
            <Avatar className={"h-24 w-24"}>
              <AvatarImage
                alt="profile pic "
                src={user?.profile?.profilePicture}
              ></AvatarImage>
            </Avatar>

            <div>
              <h1 className="font-bold text-xl ">{user?.fullname}</h1>
              <p>{user?.profile?.bio}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setOpen(true);
            }}
            className="text-right"
            variant="outline"
          >
            <Pen />
          </Button>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>
        <div className="my-5">
          <h1>Skills</h1>
          <div className="flex items-center gap-1">
            {user?.profile?.skills.length != 0 ? (
              user?.profile?.skills.map((item, index) => (
                <Badge key={index}>{item}</Badge>
              ))
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label className="text-md font-bold">Resume</Label>
          {isHaveResume ? (
            <a
              target="blank"
              href={user?.profile?.resume || "#"}
              className="text-blue-500 w-full hover:underline cursor-pointer"
            >
              {user?.profile?.resumeOriginalName || "Resume.pdf"}
            </a>
          ) : (
            <span>NA</span>
          )}
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl">
        <Tabs defaultValue="applied" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="applied">
            <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
            <AppliedJobTable />
          </TabsContent>
          <TabsContent value="bookmarked">
            <BookmarkedJobs />
          </TabsContent>
        </Tabs>
      </div>
      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
