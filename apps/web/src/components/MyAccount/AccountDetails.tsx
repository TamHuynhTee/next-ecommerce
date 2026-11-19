"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  changePasswordAction,
  getProfileAction,
  updateProfileAction,
} from "@/lib/account/actions";
import type { Profile } from "@/lib/account/types";

const inputClass =
  "rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const PASSWORD_ERRORS: Record<string, string> = {
  WRONG_PASSWORD: "Your current password is incorrect.",
  UNAUTHENTICATED: "Your session has expired. Please sign in again.",
};

const AccountDetails = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failed, setFailed] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getProfileAction().then((result) => {
      if (result.ok === true) setProfile(result.data);
      else setFailed(true);
    });
  }, []);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSavingProfile(true);
    const result = await updateProfileAction({
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      dateOfBirth: String(form.get("dateOfBirth") ?? "") || undefined,
    });
    setSavingProfile(false);
    if (result.ok === true) {
      setProfile(result.data);
      toast.success("Profile updated");
    } else {
      const failure = result as Extract<typeof result, { ok: false }>;
      toast.error(failure.details?.[0] ?? "Could not update your profile.");
    }
  };

  const savePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const newPassword = String(form.get("newPassword") ?? "");
    if (newPassword !== String(form.get("confirmPassword") ?? "")) {
      toast.error("The new passwords do not match.");
      return;
    }
    setSavingPassword(true);
    const result = await changePasswordAction({
      currentPassword: String(form.get("currentPassword") ?? ""),
      newPassword,
    });
    setSavingPassword(false);
    if (result.ok === true) {
      formElement.reset();
      toast.success("Password changed. Other devices were signed out.");
    } else {
      const failure = result as Extract<typeof result, { ok: false }>;
      toast.error(
        failure.details?.[0]?.includes("strong")
          ? "Use at least 6 characters with an upper-case letter, a lower-case letter, a number and a symbol."
          : (PASSWORD_ERRORS[failure.error] ?? "Could not change your password."),
      );
    }
  };

  if (failed) return <p>Could not load your profile. Please try again later.</p>;
  if (!profile) return <p>Loading…</p>;

  return (
    <div className="flex flex-col gap-7.5">
      <form onSubmit={saveProfile} className="bg-white shadow-1 rounded-xl p-4 sm:p-7.5 flex flex-col gap-5">
        <h3 className="font-medium text-xl text-dark">Profile</h3>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-full">
            <label htmlFor="firstName" className="block mb-2.5">First name <span className="text-red">*</span></label>
            <input id="firstName" name="firstName" required maxLength={100} defaultValue={profile.firstName ?? ""} className={inputClass} />
          </div>
          <div className="w-full">
            <label htmlFor="lastName" className="block mb-2.5">Last name <span className="text-red">*</span></label>
            <input id="lastName" name="lastName" required maxLength={100} defaultValue={profile.lastName ?? ""} className={inputClass} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-full">
            <label htmlFor="username" className="block mb-2.5">Username</label>
            <input id="username" value={profile.username} readOnly className={`${inputClass} opacity-70`} />
          </div>
          <div className="w-full">
            <label htmlFor="email" className="block mb-2.5">Email</label>
            <input id="email" value={profile.email} readOnly className={`${inputClass} opacity-70`} />
          </div>
        </div>
        <div className="sm:max-w-[320px]">
          <label htmlFor="dateOfBirth" className="block mb-2.5">Date of birth</label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={profile.dateOfBirth ?? ""} className={inputClass} />
        </div>
        <div>
          <button type="submit" disabled={savingProfile} className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60">
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} className="bg-white shadow-1 rounded-xl p-4 sm:p-7.5 flex flex-col gap-5">
        <h3 className="font-medium text-xl text-dark">Change password</h3>
        <div>
          <label htmlFor="currentPassword" className="block mb-2.5">Current password <span className="text-red">*</span></label>
          <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
        </div>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-full">
            <label htmlFor="newPassword" className="block mb-2.5">New password <span className="text-red">*</span></label>
            <input id="newPassword" name="newPassword" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
          </div>
          <div className="w-full">
            <label htmlFor="confirmPassword" className="block mb-2.5">Confirm new password <span className="text-red">*</span></label>
            <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={inputClass} />
          </div>
        </div>
        <div>
          <button type="submit" disabled={savingPassword} className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60">
            {savingPassword ? "Saving…" : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetails;
