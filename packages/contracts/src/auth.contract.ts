import { UserProfile } from '@solaros/types';

export interface LoginRequestDto {
  email: string;
  password?: string;
  organizationSlug?: string;
}

export interface AuthResponseDto {
  user: UserProfile;
  activeOrganization: {
    id: string;
    slug: string;
    name: string;
  };
  roles: string[];
  permissions: string[];
  accessToken: string;
  expiresIn: number;
}
