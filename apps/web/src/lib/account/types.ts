export type Profile = {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  /** YYYY-MM-DD */
  dateOfBirth: string | null;
};

export type Address = {
  id: string;
  title: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
};

export type AddressInput = {
  title: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
};

export type ProfileInput = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
};

export type AccountResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      /** Validation messages from the API, when there are any. */
      details?: string[];
    };
