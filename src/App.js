import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useState, useEffect, useCallback } from "react";
import "./App.css";
import HomePage from "./pages/Home";
// import TopNav from "./components/TopNav/topNav";
import BrowsePage from "./pages/Browse";
import CategoryTilesPage from "./pages/SelectCategory";
import CreateTaskPage from "./pages/CreateTask";
import ViewTaskPage from "./pages/ViewTask";
import SuccessPage from "./pages/Success";
import MyTasksPage from "./pages/MyTasks";
import ProfilePage from "./pages/Profile/Profile.js";
import UsersPage from "./pages/Users";
import EditTaskPage from "./pages/EditTask/EditTask";
// import UpdateProfilePage from "./pages/UpdateProfile";
import tyreIcon from "../src/imgs/icons/tire.png";
import gardenIcon from "../src/imgs/icons/gardening.png";
import shopIcon from "../src/imgs/icons/shopping-bags.png";
import houseWorkIcon from "../src/imgs/icons/house.png";
import deliveryIcon from "../src/imgs/icons/delivery-truck.png";
import otherIcon from "../src/imgs/icons/other2.png";
//import allIcon from "../src/imgs/icons/all.png";
import Navbar from "./components/Navbar/Navbar";
// import Footer from "./components/Footer/Footer";
import FAQPage from "./pages/FAQpage";
import WhiteLogo from "../src/imgs/logos/white_text.png";
// import illustrationPost from "../src/imgs/illustrations/post.png";
// import illustrationVolunteer from "../src/imgs/illustrations/joy.png";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function App() {
  const [tasks, setTasks] = useState([]);
  // const [isMobile, setIsMobile] = useState(false);
  const [category, setCategory] = useState([]);
  const [categoryIcons, setCategoryIcons] = useState([]);
  const [selectedTask, setSelectedTask] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [successPath, setSuccessPath] = useState("login");
  const [session, setSession] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [showProfileID, setShowProfileID] = useState(false);

  const getUsers = useCallback(
    async (session) => {
      let { data, error } = await supabase
        .from("kindr_users")
        .select("*")
        .filter("supabase_id", "eq", session.user.id);
      if (error) {
        console.log("error", error);
      }
      const user = data[0];
      if (!userInfo) {
        setUserInfo(user);
      }
    },
    [userInfo]
  );

  const getDistance = useCallback(
    async (originPostcode, destinationPostcode, unit) => {
      try {
        const response = await fetch(
          `https://api.postcodes.io/postcodes/${originPostcode}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch postcode data", originPostcode);
        }

        const data = await response.json();
        const originLatitude = data.result.latitude;
        const originLongitude = data.result.longitude;

        const destinationResponse = await fetch(
          `https://api.postcodes.io/postcodes/${destinationPostcode}`
        );

        if (!destinationResponse.ok) {
          throw new Error(
            "Failed to fetch destination postcode data",
            destinationPostcode
          );
        }

        const destinationData = await destinationResponse.json();
        const destinationLatitude = destinationData.result.latitude;
        const destinationLongitude = destinationData.result.longitude;

        const distance = calculateDistance(
          originLatitude,
          originLongitude,
          destinationLatitude,
          destinationLongitude,
          unit
        );

        return distance;
      } catch (error) {
        console.error(error);
        return "N/A";
      }
    },
    []
  );

  // Helper function to calculate distance between two sets of coordinates
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let distance =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    distance = Math.acos(distance);
    distance = (distance * 180) / Math.PI;
    distance = distance * 60 * 1.1515; // Distance in miles

    return distance;
  }

  function isUKPostcode(postcode) {
    // Remove all whitespace characters from the postcode
    if (!postcode) {
      return false;
    }
    postcode = postcode.replace(/\s/g, "");
    // Regular expression pattern for UK postcode validation
    var pattern =
      /^(GIR 0AA|[A-PR-UWYZ](?:[0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9](?:[0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKPS-UW])(?:[0-9][ABD-HJLNP-UW-Z]{2}))$/i;
    return pattern.test(postcode);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("kindr_users").select("*");
        if (error) {
          console.log("Error:", error);
        } else {
          for (let i = 0; i < data.length; i++) {
            const userPostcode = data[i].postcode;
            if (
              isUKPostcode(userPostcode) &&
              isUKPostcode(userInfo?.postcode)
            ) {
              const distance = await getDistance(
                userPostcode,
                userInfo?.postcode
              );
              //check if distance is a number
              if (isNaN(distance)) {
                data[i].distance = "N/A";
              } else {
                data[i].distance = distance.toFixed(1);
              }
            }
          }
          setAllUsers(data);
        }
      } catch (error) {
        console.log("Error:", error.message);
      }
    };
    if (userInfo) {
      fetchData();
    }
  }, [userInfo, getDistance]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        getTasks();
        writeCategoryIcons();
        getUsers(session);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getTasks();
        writeCategoryIcons();
        getUsers(session);
      }
    });
    return () => subscription.unsubscribe();
  }, [getUsers]);

  function writeCategoryIcons() {
    setCategoryIcons([
      { id: 1, image: tyreIcon, name: "Transport" },
      { id: 2, image: gardenIcon, name: "Gardening" },
      { id: 3, image: shopIcon, name: "Shopping" },
      { id: 4, image: houseWorkIcon, name: "Housework" },
      { id: 5, image: deliveryIcon, name: "Delivery" },
      { id: 6, image: otherIcon, name: "Other" },
    ]);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  async function getTasks() {
    let { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      console.log("error", error);
    }
    setTasks(data);
    //console.log("tasks", data);
  }

  if (!session) {
    return (
      <div className="login-page">
        <img src={WhiteLogo} alt="logo" className="homepage-logo" />

        <div className="login-container">
          <h2 className="login-title">
            Kindr connects people to volunteer for tasks in your local
            community.
          </h2>
          <Auth
            //redirectTo={window.location.href}
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#01BBE4",
                    brandAccent: "#0177E4", // hover button and button border colour
                    messageText: "black",
                    inputText: "black",
                    inputLabelText: "black",
                    inputPlaceholder: "black",
                    anchorTextColor: "black",
                    anchorTextHoverColor: "#0177E4",
                    inputBackground: "#E8f0fe",
                  },
                },
              },
            }}
            onSignOut={() => setSession(null)}
            providers={["google", "facebook"]}
          />
        </div>
      </div>
    );
  } else if (!userInfo) {
    //console.log("loading user info");
    return <div>Loading user information...</div>;
  } else if (!userInfo) {
    //console.log("user info loaded", userInfo.email);
    return <ProfilePage userInfo={userInfo} setUserInfo={setUserInfo} />;
  } else {
    //console.log("user first name", userInfo.firstname);
    return (
      <div className="App">
        <BrowserRouter>
          <Navbar
            handleLogout={handleLogout}
            userInfo={userInfo}
            setShowProfileID={setShowProfileID}
          />
          <div>
            <Routes>
              <Route path="/" element={<HomePage userInfo={userInfo} />} />
              <Route
                path="/browse"
                element={
                  <BrowsePage
                    tasks={tasks}
                    setSelectedTask={setSelectedTask}
                    categoryIcons={categoryIcons}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    allUsers={allUsers}
                  />
                }
              />
              <Route
                path="/mytasks"
                element={
                  <MyTasksPage
                    tasks={tasks}
                    setSelectedTask={setSelectedTask}
                    categoryIcons={categoryIcons}
                    userInfo={userInfo}
                    allUsers={allUsers}
                  />
                }
              />
              <Route
                path="/categories"
                element={
                  <CategoryTilesPage
                    setCategory={setCategory}
                    categoryIcons={categoryIcons}
                  />
                }
              />
              <Route
                path="/create"
                element={
                  <CreateTaskPage
                    category={category}
                    categoryIcons={categoryIcons}
                    getTasks={getTasks}
                    setSuccessPath={setSuccessPath}
                    userInfo={userInfo}
                  />
                }
              />
              <Route
                path="/view"
                element={
                  <ViewTaskPage
                    categoryIcons={categoryIcons}
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                    tasks={tasks}
                    getTasks={getTasks}
                    setSuccessPath={setSuccessPath}
                    userInfo={userInfo}
                    allUsers={allUsers}
                    setShowProfileID={setShowProfileID}
                  />
                }
              />
              <Route
                path="/edit"
                element={
                  <EditTaskPage
                    categoryIcons={categoryIcons}
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                    tasks={tasks}
                    getTasks={getTasks}
                    setSuccessPath={setSuccessPath}
                    userInfo={userInfo}
                    allUsers={allUsers}
                    setShowProfileID={setShowProfileID}
                  />
                }
              />
              {/* <Route
                path="/editprofile"
                element={<UpdateProfilePage userInfo={userInfo} />}
              /> */}
              <Route
                path="/users"
                element={
                  <UsersPage allUsers={allUsers} setAllUsers={setAllUsers} />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    userInfo={userInfo}
                    setUserInfo={setUserInfo}
                    showProfileID={showProfileID}
                    allUsers={allUsers}
                  />
                }
              />
              <Route
                path="/success"
                element={<SuccessPage successPath={successPath} />}
              />
              <Route path="/FAQpage" element={<FAQPage />} />
            </Routes>
          </div>
          {/* <Footer /> */}
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
