export type PlaceOrderBody = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type UpdateOrderStatusBody = {
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
};