import React, { useState, useEffect, useCallback } from 'react';
import type { User, UserFormData, UserFilters } from '../types/user';
import { apiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { filterUsers, paginateArray, calculateTotalPages } from '../lib/utils';

interface UseUsersOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: Partial<UserFilters>;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: Partial<UserFilters>;
  
  // Actions
  fetchUsers: () => Promise<void>;
  createUser: (userData: UserFormData) => Promise<User | null>;
  updateUser: (id: number, userData: UserFormData) => Promise<User | null>;
  deleteUser: (id: number) => Promise<boolean>;
  deleteUsers: (ids: number[]) => Promise<boolean>;
  
  // Pagination & Filters
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  resetFilters: () => void;
  
  // Search
  searchUsers: (query: string) => Promise<void>;
}

const defaultFilters: UserFilters = {
  search: '',
  role: 'all',
  status: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialFilters = {},
  } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [filters, setFiltersState] = useState<Partial<UserFilters>>({
    ...defaultFilters,
    ...initialFilters,
  });

  const { success, error: showError } = useToast();

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getUsers(1, 1000); // Get all users for client-side filtering
      setAllUsers(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Memoize filtered users to avoid redundant calculations
  const filteredUsers = React.useMemo(() => {
    if (Object.keys(filters).length === 0 || !allUsers.length) {
      return allUsers;
    }
    return filterUsers(allUsers, filters);
  }, [allUsers, filters]);

  // Apply pagination to filtered users
  useEffect(() => {
    const paginatedUsers = paginateArray(filteredUsers, currentPage, itemsPerPage);
    setUsers(paginatedUsers);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Initialize data on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create new user with optimistic update
  const createUser = useCallback(async (userData: UserFormData): Promise<User | null> => {
    try {
      setLoading(true);
      
      const newUser = await apiService.createUser(userData);
      
      // Optimistic update
      setAllUsers(prev => [newUser, ...prev]);
      success('Success', 'User created successfully');
      
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      showError('Error', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  // Update user with optimistic update
  const updateUser = useCallback(async (id: number, userData: UserFormData): Promise<User | null> => {
    try {
      setLoading(true);
      
      // Store old user for rollback
      const oldUser = allUsers.find(u => u.id === id);
      if (!oldUser) throw new Error('User not found');

      // Optimistic update
      const optimisticUser: User = {
        ...oldUser,
        ...userData,
        address: { ...oldUser.address, ...userData.address },
        company: { ...oldUser.company, ...userData.company },
        updatedAt: new Date().toISOString(),
      };
      
      setAllUsers(prev => prev.map(u => u.id === id ? optimisticUser : u));

      try {
        const updatedUser = await apiService.updateUser(id, userData);
        
        // Replace optimistic update with real data
        setAllUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
        success('Success', 'User updated successfully');
        
        return updatedUser;
      } catch (apiError) {
        // Rollback optimistic update
        setAllUsers(prev => prev.map(u => u.id === id ? oldUser : u));
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      showError('Error', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [allUsers, success, showError]);

  // Delete single user with optimistic update
  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Store old user for rollback
      const userToDelete = allUsers.find(u => u.id === id);
      if (!userToDelete) throw new Error('User not found');

      // Optimistic update
      setAllUsers(prev => prev.filter(u => u.id !== id));

      try {
        await apiService.deleteUser(id);
        success('Success', 'User deleted successfully');
        return true;
      } catch (apiError) {
        // Rollback optimistic update
        setAllUsers(prev => [...prev, userToDelete]);
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      showError('Error', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [allUsers, success, showError]);

  // Delete multiple users with optimistic update
  const deleteUsers = useCallback(async (ids: number[]): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Store old users for rollback
      const usersToDelete = allUsers.filter(u => ids.includes(u.id));
      
      // Optimistic update
      setAllUsers(prev => prev.filter(u => !ids.includes(u.id)));

      try {
        await apiService.deleteUsers(ids);
        success('Success', `${ids.length} users deleted successfully`);
        return true;
      } catch (apiError) {
        // Rollback optimistic update
        setAllUsers(prev => [...prev, ...usersToDelete]);
        throw apiError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete users';
      showError('Error', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [allUsers, success, showError]);

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    setFiltersState(prev => ({ ...prev, search: query }));
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Pagination controls
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setLimit = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  // Filter controls
  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setCurrentPage(1);
  }, []);

  // Calculate pagination info using memoized filtered users
  const totalItems = filteredUsers.length;
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);

  return {
    users,
    loading,
    error,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    },
    filters,
    
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    deleteUsers,
    
    // Pagination & Filters
    setPage,
    setLimit,
    setFilters,
    resetFilters,
    
    // Search
    searchUsers,
  };
};
