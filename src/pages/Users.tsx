import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  Filter,
  UsersIcon
} from 'lucide-react';
import type { User, UserFormData } from '../types/user';
import { useUsers } from '../hooks/useUsers';
import { useToast } from '../contexts/ToastContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '../components/ui/Button';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  TableSkeleton 
} from '../components/ui/Table';
import { Pagination, PaginationInfo, PaginationContainer } from '../components/ui/Pagination';
import { UserForm } from '../components/features/UserForm';
import { UserFiltersPanel } from '../components/features/UserFilters';
import { LoadingOverlay } from '../components/ui/Loading';
import { cn, formatDate, downloadCSV, getActiveFiltersCount } from '../lib/utils';

export const Users: React.FC = (_className) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();

  // Auto-open add form if navigated from dashboard quick action
  useEffect(() => {
    if (location.state?.openAddForm) {
      setShowUserForm(true);
      setEditingUser(null);
      // Clear the state to prevent reopening on subsequent visits
      window.history.replaceState(null, '');
    }
  }, [location.state]);

  const { success } = useToast();
  const { addNotification } = useNotifications();
  
  const {
    users,
    allUsers,
    loading,
    pagination,
    filters,
    createUser,
    updateUser,
    deleteUser,
    deleteUsers,
    setPage,
    setFilters,
    resetFilters,
  } = useUsers({
    initialLimit: 10,
  });

  // Handle user creation
  const handleCreateUser = async (userData: UserFormData) => {
    const result = await createUser(userData);
    if (result) {
      setShowUserForm(false);
      setEditingUser(null);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'New Employee Added',
        message: `${userData.name} has been successfully added to the system.`,
        time: 'Just now',
        read: false,
        icon: <Plus className="h-4 w-4" />
      });
    }
  };

  // Handle user update
  const handleUpdateUser = async (userData: UserFormData) => {
    if (!editingUser) return;
    
    const result = await updateUser(editingUser.id, userData);
    if (result) {
      setShowUserForm(false);
      setEditingUser(null);
      
      // Add notification
      addNotification({
        type: 'info',
        title: 'Employee Updated',
        message: `${userData.name}'s information has been successfully updated.`,
        time: 'Just now',
        read: false,
        icon: <Edit2 className="h-4 w-4" />
      });
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const userName = userToDelete.name;
    const result = await deleteUser(userToDelete.id);
    if (result) {
      setShowDeleteDialog(false);
      setUserToDelete(null);
      
      // Add notification
      addNotification({
        type: 'warning',
        title: 'Employee Removed',
        message: `${userName} has been removed from the system.`,
        time: 'Just now',
        read: false,
        icon: <Trash2 className="h-4 w-4" />
      });
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    const userCount = selectedUsers.length;
    const result = await deleteUsers(selectedUsers);
    if (result) {
      setSelectedUsers([]);
      
      // Add notification
      addNotification({
        type: 'warning',
        title: 'Bulk Deletion Complete',
        message: `${userCount} employee${userCount > 1 ? 's' : ''} removed from the system.`,
        time: 'Just now',
        read: false,
        icon: <Trash2 className="h-4 w-4" />
      });
    }
  };

  // Handle user selection
  const handleUserSelect = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Export functions
  const handleExportCSV = useCallback(() => {
    const exportData = users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      jobTitle: user.jobTitle,
      salary: user.hasSalary ? user.salary : 'No salary',
      hasSalary: user.hasSalary ? 'Yes' : 'No',
      phone: user.phone,
      website: user.website,
      company: user.company.name,
      city: user.address.city,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt ? formatDate(user.createdAt) : '',
    }));
    
    downloadCSV(exportData, 'users');
    success('Export Complete', 'Users exported to CSV successfully');
  }, [users, success]);

  // Sort handler
  const handleSort = (field: keyof User) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters({ sortBy: field, sortOrder: newOrder });
  };

  // Get active filters count for display
  const activeFiltersCount = getActiveFiltersCount(filters);

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Users
            {activeFiltersCount > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {pagination.totalItems > 0 ? (
              <>Showing {users.length} of {pagination.totalItems} users</>
            ) : (
              'Manage user accounts and permissions'
            )}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "sm:hidden",
              activeFiltersCount > 0 && "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200 dark:hover:bg-blue-900/50"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={loading || users.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button
            variant="primary"
            onClick={() => {
              setEditingUser(null);
              setShowUserForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <UserFiltersPanel
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
        users={allUsers}
        isVisible={showFilters}
        onToggleVisibility={() => setShowFilters(!showFilters)}
      />

      {/* Results Summary and Bulk Actions */}
      {(selectedUsers.length > 0 || activeFiltersCount > 0) && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {activeFiltersCount > 0 && (
                <span>
                  {pagination.totalItems} result{pagination.totalItems !== 1 ? 's' : ''} found
                </span>
              )}
              {selectedUsers.length > 0 && (
                <span className="ml-4 font-medium text-slate-900 dark:text-slate-100">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedUsers.length})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <LoadingOverlay isLoading={loading}>
          {loading ? (
            <TableSkeleton 
              rows={10} 
              columns={9} 
              headers={['', 'User', 'Email', 'Job Title', 'Salary', 'Role', 'Status', 'Created', 'Actions']} 
            />
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No users found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Get started by creating your first user.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowUserForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={filters.sortBy === 'name' ? filters.sortOrder : null}
                    onSort={() => handleSort('name')}
                  >
                    User
                  </TableHead>
                  <TableHead 
                    sortable
                    sortDirection={filters.sortBy === 'email' ? filters.sortOrder : null}
                    onSort={() => handleSort('email')}
                  >
                    Email
                  </TableHead>
                  <TableHead 
                    sortable
                    sortDirection={filters.sortBy === 'jobTitle' ? filters.sortOrder : null}
                    onSort={() => handleSort('jobTitle')}
                  >
                    Job Title
                  </TableHead>
                  <TableHead 
                    sortable
                    sortDirection={filters.sortBy === 'salary' ? filters.sortOrder : null}
                    onSort={() => handleSort('salary')}
                  >
                    Salary
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    sortable
                    sortDirection={filters.sortBy === 'createdAt' ? filters.sortOrder : null}
                    onSort={() => handleSort('createdAt')}
                  >
                    Created
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.avatar}
                          alt={user.name}
                        />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {user.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-900 dark:text-slate-100">
                        {user.email}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {user.company.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-900 dark:text-slate-100">
                        {user.jobTitle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-900 dark:text-slate-100">
                        {user.hasSalary ? (
                          <span className="font-medium">
                            ${user.salary.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 italic">
                            No salary
                          </span>
                        )}
                      </div>
                      {user.hasSalary && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Salaried
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                        user.role === 'admin' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
                        user.role === 'manager' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                        user.role === 'user' && 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      )}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                        user.status === 'active' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                        user.status === 'inactive' && 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      )}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingUser(user);
                            setShowUserForm(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </LoadingOverlay>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <PaginationContainer>
            <PaginationInfo
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
            />
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </PaginationContainer>
        )}
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        initialUser={editingUser}
        isLoading={loading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
        title="Delete User"
        size="sm"
      >
        <ModalBody>
          <p className="text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
            This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteDialog(false);
              setUserToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteUser}
            loading={loading}
          >
            Delete User
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
