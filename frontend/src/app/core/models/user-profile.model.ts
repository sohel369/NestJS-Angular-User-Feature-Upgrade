export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'manager';
  status: 'active' | 'inactive' | 'pending';
  profile?: {
    id: string;
    userId: string;
    title?: string;
    bio?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    department?: string;
    location?: string;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
    preferences?: {
      theme?: string;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
    };
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  title?: string;
  bio?: string;
  phoneNumber?: string;
  department?: string;
  location?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  preferences?: {
    theme?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
}
