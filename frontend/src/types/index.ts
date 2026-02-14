export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export type Role = 'ADMIN' | 'LAB_ASSISTANT' | 'LECTURER' | 'STUDENT';

export interface Lab {
  id: string;
  name: string;
  code: string;
  capacity: number;
  location?: string;
  description?: string;
  status: LabStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { equipments: number };
}

export type LabStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export interface Equipment {
  id: string;
  name: string;
  code: string;
  category: string;
  status: EquipmentStatus;
  description?: string;
  labId: string;
  createdAt: string;
  updatedAt: string;
  lab?: Lab;
}

export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN' | 'UNDER_MAINTENANCE';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  resolution?: string;
  equipmentId?: string;
  labId?: string;
  reportedById: string;
  createdAt: string;
  updatedAt: string;
  reportedBy?: User;
  lab?: Lab;
  equipment?: Equipment;
}

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Maintenance {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
  notes?: string;
  equipmentId?: string;
  labId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  lab?: Lab;
  equipment?: Equipment;
}

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
}
