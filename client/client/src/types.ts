export type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export type DoctorPublic = {
  id: string;
  userId?: string;
  email?: string;
  name: string;
  specialization: string;
  calLink: string | null;
  verified: boolean;
  createdAt: string;
};

export type DoctorProfile = {
  id: string;
  userId: string;
  email?: string;
  name: string;
  specialization: string;
  calLink?: string | null;
  verified: boolean;
  createdAt?: string;
};

export type UpdateDoctorPayload = {
  email: string;
  name: string;
  specialization: string;
  calLink?: string | null;
  verified: boolean;
};

export type User = {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  doctorProfile?: DoctorProfile | null;
};

export type Appointment = {
  id: string;
  doctorId: string;
  userId: string;
  slot: string;
  status?: string;
  meetingUrl?: string;
  createdAt?: string;
  doctor?: DoctorPublic;
  user?: {
    id: string;
    email: string;
  };
  feedback?: Feedback | null;
};

export type EmergencyBookingResponse = {
  message: string;
  appointmentId: string;
  doctor: DoctorPublic;
  slot: string;
  meetingUrl?: string;
  appointment: Appointment;
};

export type EmergencyBookingPayload = {
  email?: string;
  password?: string;
};


export type Feedback = {
  id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patient?: {
    id: string;
    email: string;
  };
  doctor?: {
    id: string;
    name: string;
    specialization: string;
  };
  appointment?: {
    id: string;
    slot: string;
    meetingUrl?: string;
  };
};

export type MedicalRecord = {
  id: string;
  patientId: string;
  createdByUserId: string;
  createdByRole: Role;
  title: string;
  recordType: string;
  content: string;
  eventAt: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    email: string;
  };
  createdBy: {
    id: string;
    email: string;
    role: Role;
  };
};

export type DoctorPatient = {
  id: string;
  email: string;
};

export type CreateMedicalRecordPayload = {
  patientId?: string;
  title: string;
  recordType: string;
  content: string;
  eventAt?: string;
};

export type UpdateMedicalRecordPayload = Partial<CreateMedicalRecordPayload>;



export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type Medicine = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};



export type CartItem = {
  id: string;
  cartId: string;
  medicineId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  medicine: Medicine;
};

export type CartResponse = {
  cartId: string;
  items: CartItem[];
  subtotal: number;
};


export type OrderItem = {
  id: string;
  orderId: string;
  medicineId: string;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  createdAt: string;
  medicine?: Medicine;
};

export type Order = {
  id: string;
  userId: string;
  total: number;
  status: OrderStatus;

  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type AdminOrder = Order & {
  user: Pick<User, "id" | "email" | "role">;
};

export type UpdateOrderStatusBody = {
  status: OrderStatus;
};

export type ApiMessage = {
  message: string;
};

export type AddMedicinePayload = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  isActive?: boolean;
};

export type UpdateMedicinePayload = Partial<AddMedicinePayload>;

export type AddToCartPayload = {
  medicineId: string;
  quantity: number;
};

export type UpdateCartItemPayload = {
  quantity: number;
};

export type PlaceOrderPayload = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};
