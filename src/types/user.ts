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
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: keyof User;
  sortOrder: 'asc' | 'desc';
}
