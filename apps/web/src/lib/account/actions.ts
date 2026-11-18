"use server";

import { cookies } from "next/headers";

import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { accountRequest } from "./api";
import type {
  AccountResult,
  Address,
  AddressInput,
  Profile,
  ProfileInput,
} from "./types";

export async function getProfileAction(): Promise<AccountResult<Profile>> {
  return accountRequest<Profile>("GET", "/users/me");
}

export async function updateProfileAction(
  input: ProfileInput,
): Promise<AccountResult<Profile>> {
  return accountRequest<Profile>("PATCH", "/users/me", {
    firstName: input.firstName,
    lastName: input.lastName,
    ...(input.dateOfBirth ? { dateOfBirth: input.dateOfBirth } : {}),
  });
}

export async function listAddressesAction(): Promise<AccountResult<Address[]>> {
  return accountRequest<Address[]>("GET", "/users/me/addresses");
}

export async function createAddressAction(
  input: AddressInput,
): Promise<AccountResult<Address>> {
  return accountRequest<Address>("POST", "/users/me/addresses", input);
}

export async function updateAddressAction(
  id: string,
  input: AddressInput,
): Promise<AccountResult<Address>> {
  return accountRequest<Address>(
    "PATCH",
    `/users/me/addresses/${encodeURIComponent(id)}`,
    { ...input, addressLine2: input.addressLine2 ?? "" },
  );
}

export async function deleteAddressAction(
  id: string,
): Promise<AccountResult<null>> {
  return accountRequest<null>(
    "DELETE",
    `/users/me/addresses/${encodeURIComponent(id)}`,
  );
}

/** Other sessions are signed out; this one stays because its refresh token is passed along. */
export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<AccountResult<null>> {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  return accountRequest<null>("POST", "/auth/change-password", {
    ...input,
    ...(refreshToken ? { refreshToken } : {}),
  });
}
