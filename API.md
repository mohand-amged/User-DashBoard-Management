# 🔌 API Documentation

## Overview

The Mini Dashboard uses a service layer architecture to manage data operations. All API calls are handled through the `src/services/api.ts` file, which provides a mock API implementation for demonstration purposes.

---

## 🏗️ Architecture

### Service Layer Structure

```typescript
// src/services/api.ts
export const api = {
  users: {
    getAll: () => Promise<PaginatedResponse<User>>,
    getById: (id: number) => Promise<User>,
    create: (userData: UserFormData) => Promise<User>,
    update: (id: number, userData: UserFormData) => Promise<User>,
    delete: (id: number) => Promise<void>
  },
  auth: {
    login: (email: string, password: string) => Promise<AuthResponse>,
    logout: () => Promise<void>,
    getCurrentUser: () => Promise<User>
  }
}
```

---

## 👥 User Management API

### Get All Users

**Endpoint**: `api.users.getAll(filters?, pagination?)`

**Parameters**:
```typescript
interface UserFilters {
  search?: string;           // Search in name, email, jobTitle
  role?: 'admin' | 'user' | 'manager' | '';
  status?: 'active' | 'inactive' | '';
  sortBy?: keyof User;       // Field to sort by
  sortOrder?: 'asc' | 'desc';
}

interface PaginationParams {
  page?: number;             // Page number (default: 1)
  limit?: number;            // Items per page (default: 10)
}
```

**Response**:
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**Example Usage**:
```typescript
// Get all users with filtering
const response = await api.users.getAll(
  { search: 'john', role: 'admin', status: 'active' },
  { page: 1, limit: 20 }
);

// Response
{
  data: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      jobTitle: "Software Engineer",
      salary: 75000,
      hasSalary: true,
      status: "active",
      role: "admin",
      // ... other fields
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    totalItems: 45,
    totalPages: 3,
    hasNext: true,
    hasPrev: false
  }
}
```

### Get User by ID

**Endpoint**: `api.users.getById(id)`

**Parameters**:
- `id` (number): User ID

**Response**: `Promise<User>`

**Example**:
```typescript
const user = await api.users.getById(1);
console.log(user.name); // "John Doe"
```

### Create User

**Endpoint**: `api.users.create(userData)`

**Parameters**:
```typescript
interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string };
  address: {
    street: string;
    city: string;
    zipcode: string;
  };
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive';
  jobTitle: string;
  salary: number;
  hasSalary: boolean;
}
```

**Response**: `Promise<User>`

**Example**:
```typescript
const newUser = await api.users.create({
  name: "Jane Smith",
  username: "jsmith",
  email: "jane@example.com",
  phone: "555-0123",
  website: "https://janesmith.dev",
  company: { name: "Tech Corp" },
  address: {
    street: "123 Main St",
    city: "New York",
    zipcode: "10001"
  },
  role: "user",
  status: "active",
  jobTitle: "Frontend Developer",
  salary: 80000,
  hasSalary: true
});
```

### Update User

**Endpoint**: `api.users.update(id, userData)`

**Parameters**:
- `id` (number): User ID
- `userData` (UserFormData): Updated user data

**Response**: `Promise<User>`

**Example**:
```typescript
const updatedUser = await api.users.update(1, {
  ...existingUser,
  jobTitle: "Senior Software Engineer",
  salary: 95000
});
```

### Delete User

**Endpoint**: `api.users.delete(id)`

**Parameters**:
- `id` (number): User ID

**Response**: `Promise<void>`

**Example**:
```typescript
await api.users.delete(1);
// User deleted successfully
```

---

## 🔐 Authentication API

### Login

**Endpoint**: `api.auth.login(email, password)`

**Parameters**:
- `email` (string): User email
- `password` (string): User password

**Response**:
```typescript
interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}
```

**Example**:
```typescript
try {
  const auth = await api.auth.login("admin@example.com", "password");
  localStorage.setItem('token', auth.token);
  // Redirect to dashboard
} catch (error) {
  console.error('Login failed:', error.message);
}
```

**Valid Credentials**:
```typescript
// Demo accounts
const validCredentials = [
  { email: "admin@example.com", password: "password" },
  { email: "user@example.com", password: "password" },
  { email: "manager@example.com", password: "password" }
];
```

### Logout

**Endpoint**: `api.auth.logout()`

**Response**: `Promise<void>`

**Example**:
```typescript
await api.auth.logout();
localStorage.removeItem('token');
// Redirect to login
```

### Get Current User

**Endpoint**: `api.auth.getCurrentUser()`

**Response**: `Promise<User>`

**Example**:
```typescript
const currentUser = await api.auth.getCurrentUser();
console.log(`Welcome, ${currentUser.name}!`);
```

---

## 📊 Data Generation

### Mock Data Features

The API service includes sophisticated mock data generation:

```typescript
// Realistic job titles
const jobTitles = [
  "Software Engineer", "Product Manager", "UX Designer",
  "Data Scientist", "DevOps Engineer", "Marketing Manager",
  "Sales Representative", "HR Specialist", "Finance Analyst",
  "Customer Success Manager", "Technical Writer", "QA Engineer"
];

// Salary ranges by role
const salaryRanges = {
  "Software Engineer": [60000, 120000],
  "Product Manager": [80000, 150000],
  "UX Designer": [50000, 100000],
  // ... more ranges
};

// Automatic data generation
const generateUser = (id: number): User => ({
  id,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  jobTitle: faker.helpers.arrayElement(jobTitles),
  salary: faker.number.int(salaryRange),
  hasSalary: faker.datatype.boolean(0.8), // 80% have salary
  // ... other generated fields
});
```

---

## ⚡ Performance Features

### Caching Strategy

```typescript
// In-memory caching for demo
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCached = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};
```

### Optimistic Updates

```typescript
// Immediate UI updates before API confirmation
const updateUserOptimistically = async (id: number, updates: Partial<User>) => {
  // Update local state immediately
  updateLocalUser(id, updates);
  
  try {
    // Sync with "server"
    const updatedUser = await api.users.update(id, updates);
    confirmLocalUpdate(id, updatedUser);
  } catch (error) {
    // Rollback on error
    rollbackLocalUpdate(id);
    throw error;
  }
};
```

### Pagination Performance

```typescript
// Efficient pagination with virtual scrolling support
const getPaginatedUsers = async (page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Slice from in-memory dataset for demo
  const paginatedData = allUsers.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      totalItems: allUsers.length,
      totalPages: Math.ceil(allUsers.length / limit),
      hasNext: endIndex < allUsers.length,
      hasPrev: page > 1
    }
  };
};
```

---

## 🔄 Real-time Features

### Simulated Real-time Updates

```typescript
// Simulate real-time user status changes
const simulateRealTimeUpdates = () => {
  setInterval(() => {
    const randomUser = faker.helpers.arrayElement(users);
    const statusUpdate = {
      ...randomUser,
      status: faker.helpers.arrayElement(['active', 'inactive']),
      updatedAt: new Date().toISOString()
    };
    
    // Emit update event
    eventBus.emit('user:updated', statusUpdate);
  }, 30000); // Every 30 seconds
};
```

### WebSocket Simulation

```typescript
// Mock WebSocket for real-time notifications
class MockWebSocket {
  private listeners = new Map();
  
  on(event: string, callback: Function) {
    this.listeners.set(event, callback);
  }
  
  emit(event: string, data: any) {
    const callback = this.listeners.get(event);
    if (callback) callback(data);
  }
  
  // Simulate server notifications
  simulateNotifications() {
    const notifications = [
      { type: 'user_joined', message: 'New user registered' },
      { type: 'salary_updated', message: 'Salary information updated' },
      { type: 'system_maintenance', message: 'Scheduled maintenance in 1 hour' }
    ];
    
    setInterval(() => {
      const notification = faker.helpers.arrayElement(notifications);
      this.emit('notification', {
        id: faker.string.uuid(),
        ...notification,
        timestamp: new Date().toISOString()
      });
    }, 30000);
  }
}
```

---

## 🚨 Error Handling

### Error Types

```typescript
// Custom error classes
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class ValidationError extends APIError {
  constructor(message: string, public field: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
```

### Error Responses

```typescript
// Standardized error response format
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    status: number;
    timestamp: string;
    path?: string;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// Example error handling
try {
  const user = await api.users.create(invalidUserData);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed for ${error.field}: ${error.message}`);
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

---

## 📝 Usage Examples

### Complete User Workflow

```typescript
import { api } from '../services/api';

// User management component example
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({});
  
  // Load users with filtering
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.users.getAll(filters, { page: 1, limit: 20 });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Create new user
  const createUser = async (userData: UserFormData) => {
    try {
      const newUser = await api.users.create(userData);
      setUsers(prev => [...prev, newUser]);
      toast.success('User created successfully!');
    } catch (error) {
      toast.error('Failed to create user');
      throw error;
    }
  };
  
  // Update existing user
  const updateUser = async (id: number, userData: UserFormData) => {
    try {
      const updatedUser = await api.users.update(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      toast.success('User updated successfully!');
    } catch (error) {
      toast.error('Failed to update user');
      throw error;
    }
  };
  
  // Delete user with confirmation
  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, [filters]);
  
  return (
    // Component JSX
  );
};
```

---

## 🔧 Development Notes

### Extending the API

To add new endpoints or modify existing ones:

1. **Add new methods to the service**:
```typescript
// src/services/api.ts
export const api = {
  users: {
    // existing methods...
    export: () => Promise<Blob>,
    bulkUpdate: (updates: Array<{id: number, data: Partial<User>}>) => Promise<User[]>
  }
};
```

2. **Update TypeScript types**:
```typescript
// src/types/api.ts
interface BulkUpdateRequest {
  updates: Array<{
    id: number;
    data: Partial<User>;
  }>;
}
```

3. **Add error handling**:
```typescript
const bulkUpdate = async (updates: BulkUpdateRequest): Promise<User[]> => {
  try {
    // Validation
    validateBulkUpdate(updates);
    
    // Process updates
    const results = await Promise.all(
      updates.map(({ id, data }) => updateUser(id, data))
    );
    
    return results;
  } catch (error) {
    throw new APIError('Bulk update failed', 400, 'BULK_UPDATE_ERROR');
  }
};
```

### Production Considerations

When adapting this for real API integration:

1. **Replace mock implementation with HTTP clients**
2. **Add request/response interceptors**
3. **Implement proper authentication tokens**
4. **Add retry logic and circuit breakers**
5. **Set up proper error boundary handling**
6. **Add request/response logging**
7. **Implement caching strategies**

---

## 🧪 Testing the API

### Unit Tests Example

```typescript
import { api } from '../services/api';

describe('User API', () => {
  test('should create user with employment data', async () => {
    const userData: UserFormData = {
      name: 'Test User',
      email: 'test@example.com',
      jobTitle: 'Developer',
      salary: 75000,
      hasSalary: true,
      // ... other required fields
    };
    
    const result = await api.users.create(userData);
    
    expect(result.name).toBe('Test User');
    expect(result.salary).toBe(75000);
    expect(result.hasSalary).toBe(true);
  });
  
  test('should filter users by salary status', async () => {
    const filters: UserFilters = {
      search: '',
      role: '',
      status: '',
      sortBy: 'salary',
      sortOrder: 'desc'
    };
    
    const response = await api.users.getAll(filters);
    
    expect(response.data).toHaveLength(10); // default limit
    expect(response.pagination.totalItems).toBeGreaterThan(0);
  });
});
```

This API documentation provides a complete reference for understanding and working with the Mini Dashboard's service layer architecture.
