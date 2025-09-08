export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
  avatar?: string;
  status?: 'active' | 'inactive';
  role?: 'admin' | 'user' | 'manager';
  jobTitle: string;
  salary: number;
  hasSalary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
  address: {
    street: string;
    city: string;
    zipcode: string;
  };
  role?: 'admin' | 'user' | 'manager';
  status?: 'active' | 'inactive';
  jobTitle: string;
  salary: number;
  hasSalary: boolean;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  hasSalary: string;
  salaryMin: number | '';
  salaryMax: number | '';
  company: string;
  jobTitle: string;
  city: string;
  createdAfter: string;
  createdBefore: string;
  sortBy: keyof User;
  sortOrder: 'asc' | 'desc';
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<UserFilters>;
  icon?: string;
}
