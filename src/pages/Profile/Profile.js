import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Usericon from "../../imgs/icons/user.png";
import contact from "../../imgs/icons/contact.png";
import dateOfBirth from "../../imgs/icons/birthday.png";
import location from "../../imgs/icons/address.png";
import "./Profile.css";
import { v4 as uuidv4 } from "uuid";
import avatar from "../../imgs/icons/user.png";
// import StarRating from "../../components/StarRating/StarRating.js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function ProfilePage({ userInfo, setUserInfo, allUsers, showProfileID }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [contactnumber, setContactnumber] = useState("");
  const [postcode, setPostcode] = useState("");
  const [DOB, setDOB] = useState("1990-01-01");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    //console.log("show profile id", showProfileID);
    if (showProfileID) {
      const thisProfile = allUsers.filter((user) => user.id === showProfileID);
      //console.log("profile name", thisProfile[0].firstname);
      setFirstname(thisProfile[0].firstname);
      setLastname(thisProfile[0].surname);
      setContactnumber(thisProfile[0].telephone);
      setPostcode(thisProfile[0].postcode);
      setDOB(thisProfile[0].dob);
      setAddress(thisProfile[0].address);
      setBio(thisProfile[0].bio);
      if (thisProfile[0].avatar_link) {
        setProfileImage(
          `${process.env.REACT_APP_SUPABASE_IMAGE_URL}${thisProfile[0].avatar_link}`
        );
      } else {
        setProfileImage(avatar);
      }
    } else if (userInfo) {
      if (userInfo.firstname) {
        setFirstname(userInfo.firstname);
        setLastname(userInfo.surname);
        setContactnumber(userInfo.telephone);
        setPostcode(userInfo.postcode);
        setDOB(userInfo.dob);
        setAddress(userInfo.address);
        setBio(userInfo.bio);
      }
      if (userInfo.avatar_link) {
        setProfileImage(
          `${process.env.REACT_APP_SUPABASE_IMAGE_URL}${userInfo.avatar_link}`
        );
      } else {
        setProfileImage(avatar);
      }
    }
  }, [userInfo, showProfileID, allUsers]);

  useEffect(() => {
    setIsDisabled(!firstname || !postcode || !lastname || !DOB);
  }, [firstname, lastname, postcode, DOB]);

  async function handleSubmit() {
    setLoading(true);
    let fileName = "";
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop(); // Get the file extension
      fileName = `${uuidv4()}.${fileExtension}`; // Generate a random file name
      await uploadImage(fileName);
    } else {
      fileName = userInfo.avatar_link;
    }
    const data = await updateProfile(fileName);
    setUserInfo(data);
    setLoading(false);
    if (!selectedFile) {
      goHome();
    }
  }

  function goHome() {
    window.location.href = "/";
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  async function updateProfile(fileName) {
    const { data, error } = await supabase
      .from("kindr_users")
      .update({
        firstname: firstname,
        surname: lastname,
        telephone: contactnumber,
        postcode: postcode,
        dob: DOB,
        address: address,
        avatar_link: fileName,
        bio: bio,
      })
      .match({ id: userInfo.id });
    if (error) {
      console.log("error", error.message);
    }
    return data;
  }

  const uploadImage = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Error uploading file:", error);
      } else {
        console.log("File uploaded successfully:", data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <div className="container">
        <div className="image-container2">
          <img src={profileImage} alt="avatar" />
        </div>
        {!showProfileID && <input type="file" onChange={handleFileChange} />}
        <h1>
          {(userInfo.firstname && `${firstname} ${lastname}`) ||
            "Hello, you must be new here! Please enter your user details below:"}
        </h1>
        {showProfileID && (
          <div>
            <p className="user-bio"> {bio} </p>
          </div>
        )}
        {!showProfileID && (
          <div className="inputs-container">
            <div className="profile-input-field">
              <img className="icon-size" src={Usericon} alt="user-icon"></img>
              <input
                type="text"
                placeholder="First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>

            <div className="profile-input-field">
              <img className="icon-size" src={Usericon} alt="user-icon"></img>
              <input
                type="text"
                placeholder="Last Name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>

            <div className="profile-input-field">
              <img className="icon-size" src={dateOfBirth} alt="D.O.B"></img>

              <input
                type="date"
                value={DOB}
                onChange={(e) => setDOB(e.target.value)}
              />
            </div>

            <div className="profile-input-field">
              <img className="icon-size" src={contact} alt="contact"></img>
              <input
                type="tel"
                placeholder="Contact number"
                value={contactnumber}
                onChange={(e) => setContactnumber(e.target.value)}
              />
            </div>

            <div className="profile-input-field">
              <img className="icon-size" src={location} alt="address"></img>
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="profile-input-field">
              <img className="icon-size" src={location} alt="address"></img>
              <input
                type="text"
                placeholder="Post Code"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
            </div>

            <div className="bio">
              <textarea
                placeholder="A little about me..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        )}
        {!showProfileID && (
          <button
            onClick={() => handleSubmit()}
            disabled={isDisabled}
            className={isDisabled ? "disable-button" : "save-changes-button"}
          >
            Save changes
          </button>
        )}
        <button
          onClick={() => {
            goHome();
          }}
          className="button "
        >
          Home
        </button>
        {loading && <div>Saving...</div>}
        {/* Display loading message while saving */}
      </div>
    </div>
  );
}
export default ProfilePage;
