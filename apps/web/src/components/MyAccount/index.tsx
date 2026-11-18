"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Orders from "../Orders";
import Addresses from "./Addresses";
import AccountDetails from "./AccountDetails";
import { useUser } from "@/context/UserContext";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "account-details", label: "Account Details" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const MyAccount = () => {
  const user = useUser();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Tabs */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-9 self-start">
              <p className="font-medium text-dark mb-1">{user.username}</p>
              <p className="text-custom-sm mb-5">{user.email}</p>
              <div className="flex flex-wrap xl:flex-col gap-2.5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center rounded-md py-3 px-4.5 text-left ease-out duration-200 hover:bg-blue hover:text-white ${
                      activeTab === tab.id
                        ? "text-white bg-blue"
                        : "text-dark-2 bg-gray-1"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="xl:max-w-[770px] w-full">
              {activeTab === "dashboard" && (
                <div className="bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
                  <p className="text-dark">Hello {user.username}</p>
                  <p className="text-custom-sm mt-4">
                    From your account dashboard you can view your recent
                    orders, manage your delivery addresses, and edit your
                    password and account details.
                  </p>
                </div>
              )}
              {activeTab === "orders" && (
                <div className="bg-white rounded-xl shadow-1">
                  <Orders />
                </div>
              )}
              {activeTab === "addresses" && <Addresses />}
              {activeTab === "account-details" && <AccountDetails />}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyAccount;
