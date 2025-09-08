import type { User, UserFormData } from "../types/user";
import type { PaginatedResponse } from "../types";
import { delay, generateAvatarUrl } from "../lib/utils";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// Simulate network delay for better UX
const SIMULATE_DELAY = 500;

class ApiService {
  private async fetchWithDelay<T>(url: string, options?: RequestInit): Promise<T> {
    await delay(SIMULATE_DELAY);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  private enhanceUser(user: any): User {
    return {
      ...user,
      avatar: generateAvatarUrl(user.name),
      status: Math.random() > 0.3 ? 'active' : 'inactive',
      role: ['admin', 'user', 'manager'][Math.floor(Math.random() * 3)] as 'admin' | 'user' | 'manager',
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Get all users with pagination
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const users = await this.fetchWithDelay<any[]>(`${BASE_URL}/users`);
      const enhancedUsers = users.map(this.enhanceUser);
      
      const total = enhancedUsers.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = enhancedUsers.slice(startIndex, endIndex);
      
      return {
        data: paginatedUsers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get single user by ID
  async getUser(id: number): Promise<User> {
    try {
      const user = await this.fetchWithDelay<any>(`${BASE_URL}/users/${id}`);
      return this.enhanceUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(`Failed to fetch user with ID ${id}`);
    }
  }

  // Create new user
  async createUser(userData: UserFormData): Promise<User> {
    try {
      const response = await this.fetchWithDelay<any>(`${BASE_URL}/users`, {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          website: userData.website,
          company: {
            name: userData.company.name,
            catchPhrase: 'Generated catch phrase',
            bs: 'Generated business',
          },
          address: {
            street: userData.address.street,
            suite: 'Suite 123',
            city: userData.address.city,
            zipcode: userData.address.zipcode,
            geo: {
              lat: '0',
              lng: '0',
            },
          },
        }),
      });

      return this.enhanceUser({
        ...response,
        id: Date.now(), // Generate unique ID for created user
        role: userData.role || 'user',
        status: userData.status || 'active',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Update existing user
  async updateUser(id: number, userData: UserFormData): Promise<User> {
    try {
      const response = await this.fetchWithDelay<any>(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          id,
          name: userData.name,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          website: userData.website,
          company: {
            name: userData.company.name,
            catchPhrase: 'Updated catch phrase',
            bs: 'Updated business',
          },
          address: {
            street: userData.address.street,
            suite: 'Suite 123',
            city: userData.address.city,
            zipcode: userData.address.zipcode,
            geo: {
              lat: '0',
              lng: '0',
            },
          },
        }),
      });

      return this.enhanceUser({
        ...response,
        role: userData.role,
        status: userData.status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user with ID ${id}`);
    }
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    try {
      await this.fetchWithDelay<any>(`${BASE_URL}/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user with ID ${id}`);
    }
  }

  // Bulk delete users
  async deleteUsers(ids: number[]): Promise<void> {
    try {
      // Simulate bulk delete with individual delete calls
      await Promise.all(ids.map(id => this.deleteUser(id)));
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw new Error('Failed to delete selected users');
    }
  }

  // Search users (mock implementation)
  async searchUsers(query: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const allUsers = await this.getUsers(1, 1000); // Get all users first
      const searchResults = allUsers.data.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.company.name.toLowerCase().includes(query.toLowerCase())
      );

      const total = searchResults.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = searchResults.slice(startIndex, endIndex);

      return {
        data: paginatedResults,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  // Auth service methods
  async login(email: string, password: string) {
    await delay(SIMULATE_DELAY);
    
    // Mock authentication
    if (email === 'admin@example.com' && password === 'password') {
      const token = btoa(JSON.stringify({
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }));

      return {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          avatar: generateAvatarUrl('Admin User'),
        },
        token,
      };
    }

    throw new Error('Invalid email or password');
  }

  async refreshToken(token: string) {
    await delay(200);
    
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp < Date.now()) {
        throw new Error('Token expired');
      }

      return {
        user: {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          avatar: generateAvatarUrl(payload.name),
        },
        token: btoa(JSON.stringify({
          ...payload,
          exp: Date.now() + 24 * 60 * 60 * 1000,
        })),
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export const apiService = new ApiService();
