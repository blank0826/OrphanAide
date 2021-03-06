import {
  Logout,
  loadDashboardOrphanage,
  loadUserProfile,
  chart_data,
  getOrphanageDataProfile,
} from "../Firebase";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "./images/logo1.png";
import { Transition } from "@headlessui/react";
import { FaUserAlt } from "react-icons/fa";
import Graph from "./Graph";
import { GiMagnifyingGlass } from "react-icons/gi";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  //.
  apiKey: "AIzaSyCjepQRClsAeuzbjyQnkW8mYed1oOFbG-4",
  authDomain: "orphanaide.firebaseapp.com",
  projectId: "orphanaide",
  storageBucket: "orphanaide.appspot.com",
  messagingSenderId: "42815706163",
  appId: "1:42815706163:web:e539dab75415ba72cbff46",
  measurementId: "G-H99B1MH0CT",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);
let users = [];
let orphanagesData = [];
let arrDonationList = [];

let dateArr = [];
let chart_data_orphanage = [];
let arr = [];
let donations = [];

let usernameArr = [];

let chosenOrphanage = "";

export default function Dummy_dashboard() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [orphanages, setOrphanages] = useState(1);
  const [profile, setProfile] = useState(0);
  const [orphanage_profile, setOrphanageProfile] = useState(0);
  const [chartData, setData] = useState([]);
  const [domain, setDomain] = useState("");

  const showOrphanages = () => {
    setOrphanages(1);
    setProfile(0);
    setOrphanageProfile(0);
    loadDashboardOrphanage();
  };

  useEffect(() => {
    componentDidUpdate();
    loadDashboardOrphanage("", navigate);
    if (localStorage.getItem("LogInAs") === "user") {
      const databaseRef_user = ref(db, "users/");
      onValue(databaseRef_user, (snapshot) => {
        const data = snapshot.val();
        users = data;
        setDomain(
          users[auth.currentUser.uid]["email"].substring(
            users[auth.currentUser.uid]["email"].indexOf("@") + 1
          )
        );
      });
    } else {
      const databaseRef_user = ref(db, "orphanage/");
      onValue(databaseRef_user, (snapshot) => {
        const data = snapshot.val();
        let val = data.find(
          (c) => localStorage.getItem("OrphanageId") === c.id
        );
        chosenOrphanage = val;
        console.log(val);
        orphanagesData = data;

        const donationRef = ref(db, "donations/");
        onValue(donationRef, (snapshot) => {
          snapshot.forEach(function (childSnapshot) {
            var childData = childSnapshot.val();
            if (childData != null) {
              for (let i = 1; i < childData.length; i++) {
                if (childData[i].orphanage == val.name) {
                  let obj = {
                    amount: childData[i].amount,
                    orphanage: childData[i].orphanage,
                    time: childData[i].time,
                    id: childSnapshot.key,
                  };

                  arr.push(obj);
                }
              }
            }
          });
          chart_data_orphanage = {
            chartData: {
              labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sept",
                "Oct",
                "Nov",
                "Dec",
              ],
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
          };

          setTimeout(function () {
            // console.log(arr);

            for (let i = 0; i < arr.length; i++) {
              const date = new Date(arr[i].time);
              var time = date.toLocaleString("en-US");
              var month = time.split("/")[0];
              var month_int = parseInt(month);
              dateArr.push(month_int);
            }
            for (var i = 0; i < dateArr.length; i++) {
              console.log(arr[i].amount);
              chart_data_orphanage.chartData["data"][dateArr[i] - 1] +=
                parseInt(arr[i].amount);
            }
          }, 4000);
        });
      });
    }
  }, []);

  function componentDidUpdate() {
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });
  }

  function userProfile() {
    setOrphanages(0);
    setProfile(1);
    setOrphanageProfile(0);
    loadUserProfile();
    setData(chart_data);
  }

  function orphanageProfile() {
    setTimeout(function () {
      const container = document.getElementById("table-data-orphanage");
      container.innerHTML = "";
      let str1 = "";
      arrDonationList = [];
      const donationRef = ref(db, "donations/");
      onValue(donationRef, (snapshot) => {
        snapshot.forEach(function (childSnapshot) {
          var childData = childSnapshot.val();
          let obj = {
            amount: 0,
            time: 0,
            id: childSnapshot.key,
          };
          for (let i = 1; i < childData.length; i++) {
            // console.log(childData[i]);
            if (childData[i].orphanage === chosenOrphanage.name) {
              obj.amount += parseInt(childData[i].amount);
              obj.time = childData[i].time;
            }
          }

          arrDonationList.push(obj);
        });

        for (let idx = 0; idx < arrDonationList.length; idx++) {
          const userRef = ref(db, "users/" + arrDonationList[idx].id);

          onValue(userRef, (snapshot) => {
            usernameArr.push(snapshot.val().name);
          });
        }

        setTimeout(function () {
          console.log(arrDonationList.length);
          if (arrDonationList.length == 0) {
            str1 = `<div class="w-full" style="background-color: #f3f4f6;  text-align: center;"><h1 style="color: black; font-size: 18px; padding-bottom: 15px; padding-top: 1rem;">No pending review requests.</h1></div>`;
          } else {
            for (let idx = 0; idx < arrDonationList.length; idx++) {
              if (arrDonationList[idx].amount > 0) {
                const date = new Date(arrDonationList[idx].time);
                str1 += `<tr>
                          <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div class="flex items-center">
                              <div class="ml-3">
                                <p class="text-gray-900 whitespace-no-wrap">
                                  ${usernameArr[idx]}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p class="text-gray-900 whitespace-no-wrap">
                            ??? ${arrDonationList[idx].amount}
                            </p>
                          </td>
                          <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p class="text-gray-900 whitespace-no-wrap">
                            ${date.toDateString()}
                            </p>
                          </td>
                        </tr>`;
              }
            }
          }
        }, 1500);

        setTimeout(function () {
          container.innerHTML = str1;
        }, 2500);
      });
    }, 4000);

    console.log(arrDonationList);
    console.log(usernameArr);

    setOrphanages(0);
    setOrphanageProfile(1);
    setData(chart_data_orphanage);
  }

  let states = [
    "Andaman and Nicobar",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Mizoram",
    "Nagaland",
    "Orissa",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const [state, setState] = useState("");

  return (
    <>
      <nav
        className=" ml-3 mr-3 sticky top-0 z-50"
        style={{ backgroundColor: "#1a1c23" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center mx-auto"
              style={{
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div className="flex-shrink-0">
                <img
                  style={{ width: "4rem", height: "4rem" }}
                  src={logo}
                  alt="Workflow"
                />
              </div>
              <div className="hidden md:block">
                <div
                  className="ml-10 flex items-baseline space-x-4"
                  style={{ width: "100%", justifyContent: "space-evenly" }}
                >
                  <div className="relative text-gray-600">
                    <input
                      type="search"
                      name="search"
                      placeholder="Enter state"
                      className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"
                      list="states"
                      id="input_state"
                      onChange={(e) => {
                        setState(e.target.value);
                      }}
                    />
                    <datalist id="states">
                      {states.map((state) => (
                        <option value={state} />
                      ))}
                    </datalist>
                    <button
                      className="absolute right-0 top-0 mr-4"
                      style={{ marginTop: "10px" }}
                      onClick={() => {
                        loadDashboardOrphanage(state);
                      }}
                    >
                      <GiMagnifyingGlass
                        style={{ width: "1.5rem", height: "1.5rem" }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="bg-gray-900 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 mr-2"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <Transition
          show={isOpen}
          enter="transition ease-out duration-200 transform"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-200 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          {(ref) => (
            <div className="md:hidden" id="mobile-menu">
              <div ref={ref} className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <div className="relative text-gray-600">
                  <input
                    name="search_min"
                    placeholder="Enter state"
                    className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"
                    list="states_min"
                    onChange={(e) => {
                      setState(e.target.value);
                    }}
                  />
                  <datalist id="states_min">
                    {states.map((state) => (
                      <option value={state} />
                    ))}
                  </datalist>
                  <button
                    className="absolute right-0 top-0 my-auto mr-4"
                    onClick={() => {
                      loadDashboardOrphanage(state);
                    }}
                  >
                    <GiMagnifyingGlass
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        color: "yellowgreen",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Transition>
      </nav>
      <div className="min-h-screen flex flex-row bg-gray-100">
        <div
          className="flex flex-col w-56 overflow-hidden ml-3"
          style={{ backgroundColor: "#1a1c23" }}
        >
          <ul className="flex flex-col py-4" style={{ marginTop: "5rem" }}>
            <li>
              {orphanages == 1 ? (
                <button
                  className="flex flex-row items-center transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-100 hover:text-gray-800"
                  style={{
                    height: "3rem",
                    width: "130px",
                    marginLeft: "2rem",
                    paddingLeft: "1rem",
                    backgroundColor: "yellowgreen",
                    borderRadius: "8px",
                  }}
                  onClick={() => {
                    showOrphanages();
                  }}
                >
                  {" "}
                  <span style={{ fontSize: "15px", letterSpacing: "2px" }}>
                    Orphanages
                  </span>
                </button>
              ) : (
                <button
                  className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-100 hover:text-gray-800"
                  style={{
                    height: "3rem",
                    width: "130px",
                    marginLeft: "2rem",
                    paddingLeft: "1rem",
                  }}
                  onClick={() => {
                    showOrphanages();
                  }}
                >
                  {" "}
                  <span style={{ fontSize: "15px", letterSpacing: "2px" }}>
                    Orphanages
                  </span>
                </button>
              )}
            </li>
            <li style={{ marginTop: "1rem" }}>
              {localStorage.getItem("LogInAs") === "user" ? (
                profile == 1 ? (
                  <button
                    className="flex flex-row items-center transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-100 hover:text-gray-800"
                    style={{
                      height: "3rem",
                      width: "130px",
                      marginLeft: "2rem",
                      paddingLeft: "1rem",
                      backgroundColor: "yellowgreen",
                      borderRadius: "8px",
                    }}
                    onClick={() => {
                      // setOrphanages(0);
                      // setProfile(1);
                      userProfile();
                    }}
                  >
                    <span style={{ fontSize: "15px", letterSpacing: "2px" }}>
                      Profile
                    </span>
                  </button>
                ) : (
                  <button
                    className="flex flex-row items-center transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-100 hover:text-gray-800"
                    style={{
                      height: "3rem",
                      width: "130px",
                      marginLeft: "2rem",
                      paddingLeft: "1rem",
                    }}
                    onClick={() => {
                      // setOrphanages(0);
                      // setProfile(1);
                      userProfile();
                    }}
                  >
                    <span style={{ fontSize: "15px", letterSpacing: "2px" }}>
                      Profile
                    </span>
                  </button>
                )
              ) : orphanage_profile == 1 ? (
                <button
                  className="flex flex-row items-center transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-100 hover:text-gray-800"
                  style={{
                    height: "3rem",
                    width: "130px",
                    marginLeft: "2rem",
                    paddingLeft: "1rem",
                    backgroundColor: "yellowgreen",
                    borderRadius: "8px",
                  }}
                  onClick={() => {
                    // setOrphanages(0);
                    // setProfile(1);
                    orphanageProfile();
                  }}
                >
                  <span style={{ fontSize: "15px", letterSpacing: "2px" }}>
                    Profile
                  </span>
                </button>
              ) : (
                <button
                  className="flex flex-row items-center transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-100 hover:text-gray-800"
                  style={{
                    height: "3rem",
                    width: "130px",
                    marginLeft: "2rem",
                    paddingLeft: "1rem",
                  }}
                  onClick={() => {
                    // setOrphanages(0);
                    // setProfile(1);
                    orphanageProfile();
                  }}
                >
                  <span style={{ fontSize: "15px", letterSpacing: "2px" }}>
                    Profile
                  </span>
                </button>
              )}
            </li>
            <li style={{ marginTop: "1rem" }}>
              <Link to="/News" target="_blank">
                <button
                  className="flex flex-row items-center transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-100 hover:text-gray-800"
                  style={{
                    height: "3rem",
                    width: "130px",
                    marginLeft: "2rem",
                    paddingLeft: "1rem",
                  }}
                >
                  <span style={{ fontSize: "15px", letterSpacing: "2px" }}>
                    News
                  </span>
                </button>
              </Link>
            </li>
            <li style={{ marginTop: "1rem" }}>
              <button
                className="flex flex-row items-center transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-100 hover:text-gray-800"
                style={{
                  height: "3rem",
                  width: "130px",
                  marginLeft: "2rem",
                  paddingLeft: "1rem",
                }}
                onClick={() => {
                  // setOrphanages(0);
                  // setProfile(1);
                  Logout(navigate);
                }}
              >
                <span style={{ fontSize: "15px", letterSpacing: "2px" }}>
                  Log Out
                </span>
              </button>
            </li>
          </ul>
        </div>
        {orphanages == 1 ? (
          <div>
            {" "}
            <section className="text-gray-600 body-font">
              <div className="container px-5 py-24 mx-auto">
                <div className="flex flex-wrap -m-4" id="orphanage_cards"></div>
              </div>
            </section>
          </div>
        ) : (
          ""
        )}
        {profile == 1 ? (
          <>
            <section className="text-gray-600 body-font">
              <div className="container px-5 py-24 mx-auto">
                <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
                  <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">
                    Welcome, {users[auth.currentUser.uid]["name"]}
                  </h1>
                  <p
                    className="lg:w-1/2 w-full text-gray-500"
                    style={{ textAlign: "justify" }}
                  >
                    We are so glad to have you as a donor on our platform, you
                    are doing a great service for the poor people of our
                    society. You are helping poor people with money and food to
                    get them back on their feet. We hope that you continue such
                    amazing work in the future.
                  </p>
                </div>
                <div className="flex flex-wrap -m-4 ">
                  <div
                    className="xl:w-1/3 md:w-1 p-4 shadow-xl overflow-hidden rounded"
                    style={{ height: "226px" }}
                  >
                    <div
                      className="border border-gray-200 p-6 rounded-lg"
                      style={{ height: "210px" }}
                    >
                      <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-4">
                        <FaUserAlt
                          style={{ width: "1.5rem", height: "1.5rem" }}
                        />
                      </div>
                      <h2 className="text-lg text-gray-900 font-medium title-font mb-2">
                        {users[auth.currentUser.uid]["name"]}
                      </h2>
                      <p className="leading-relaxed text-base">
                        Email: {users[auth.currentUser.uid]["email"]}
                      </p>
                      <p className="leading-relaxed text-base">
                        Phone: {users[auth.currentUser.uid]["phone"]}
                      </p>
                    </div>
                  </div>
                  <div className="xl:w-2/3 md:w-1 p-4">
                    <Graph info={chartData} style={{ height: "194px" }} />
                  </div>
                </div>
                <div
                  className="bg-white p-8 rounded-md w-full my-auto"
                  style={{ marginTop: "2rem" }}
                >
                  <div className=" flex items-center justify-between pb-6">
                    <div>
                      <h2 className="text-gray-600 font-semibold">
                        Tabular Data
                      </h2>
                      <span className="text-xs">All donations till now</span>
                    </div>
                  </div>
                  <div>
                    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                      <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                          <thead>
                            <tr>
                              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Orphanage Name
                              </th>
                              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Donated Amount
                              </th>
                              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Donation time
                              </th>
                            </tr>
                          </thead>
                          <tbody id="table-data"></tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          ""
        )}
        {orphanage_profile == 1 ? (
          <>
            <section className="text-gray-600 body-font">
              <div className="container px-5 py-24 mx-auto">
                <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
                  <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">
                    Welcome, {chosenOrphanage.name}
                  </h1>
                  <p
                    className="lg:w-1/2 w-full text-gray-500"
                    style={{ textAlign: "justify" }}
                  >
                    We are so glad to have you as a donor on our platform, you
                    are doing a great service for the poor people of our
                    society. You are helping poor people with money and food to
                    get them back on their feet. We hope that you continue such
                    amazing work in the future.
                  </p>
                </div>
                <div className="flex flex-wrap -m-4 ">
                  <div
                    className="xl:w-1/3 md:w-1 p-4 shadow-xl overflow-hidden rounded"
                    style={{ height: "226px" }}
                  >
                    <div
                      className="border border-gray-200 p-6 rounded-lg"
                      style={{ height: "210px" }}
                    >
                      <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-4">
                        <FaUserAlt
                          style={{ width: "1.5rem", height: "1.5rem" }}
                        />
                      </div>
                      <h2 className="text-lg text-gray-900 font-medium title-font mb-2">
                        {chosenOrphanage.name}
                      </h2>
                      <p className="leading-relaxed text-base">
                        Email: {chosenOrphanage.email}
                      </p>
                      <p className="leading-relaxed text-base">
                        Phone: {chosenOrphanage.contact}
                      </p>
                    </div>
                  </div>
                  <div className="xl:w-2/3 md:w-1 p-4">
                    <Graph
                      info={chart_data_orphanage}
                      style={{ height: "194px" }}
                    />
                  </div>
                </div>
                <div
                  className="bg-white p-8 rounded-md w-full my-auto"
                  style={{ marginTop: "2rem" }}
                >
                  <div className=" flex items-center justify-between pb-6">
                    <div>
                      <h2 className="text-gray-600 font-semibold">
                        Tabular Data
                      </h2>
                      <span className="text-xs">All donations till now</span>
                    </div>
                  </div>
                  <div>
                    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                      <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                          <thead>
                            <tr>
                              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Donor Name
                              </th>
                              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Total Donated Amount
                              </th>
                              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Latest Donation Time
                              </th>
                            </tr>
                          </thead>
                          <tbody id="table-data-orphanage"></tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          " "
        )}
      </div>
    </>
  );
}
