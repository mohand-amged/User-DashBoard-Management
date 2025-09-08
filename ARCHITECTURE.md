# 🏗️ Architecture Guide

## Overview

The Mini Dashboard follows modern React architectural patterns with a focus on maintainability, scalability, and developer experience. This guide outlines the component structure, design patterns, and architectural decisions.

---

## 🎯 Design Principles

### Core Principles
- **Component Composition** - Small, focused components that do one thing well
- **Type Safety** - 100% TypeScript with strict mode enabled  
- **Separation of Concerns** - Clear boundaries between UI, business logic, and data
- **Performance First** - Optimistic updates, memoization, and lazy loading
- **Accessibility** - WCAG 2.1 AA compliance throughout
- **Mobile First** - Responsive design with progressive enhancement

---

## 📁 Project Architecture

```
src/
├── components/                 # Reusable UI components
│   ├── ui/                    # Basic UI building blocks
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   ├── features/              # Feature-specific components
│   │   ├── UserForm.tsx
│   │   ├── UserTable.tsx
│   │   ├── SearchModal.tsx
│   │   └── NotificationCenter.tsx
│   └── layout/                # Layout components
│       ├── DashboardLayout.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
├── contexts/                  # React Context providers
│   ├── AuthContext.tsx        # Authentication state
│   ├── ThemeContext.tsx       # Dark/light theme
│   └── ToastContext.tsx       # Global notifications
├── hooks/                     # Custom React hooks
│   ├── useUsers.ts           # User data management
│   ├── useForm.ts            # Form state and validation
│   ├── useKeyboardShortcuts.ts # Global shortcuts
│   └── useLocalStorage.ts    # Persistent storage
├── pages/                     # Page components (routes)
│   ├── Dashboard.tsx         # Main dashboard
│   ├── Users.tsx            # User management
│   ├── Analytics.tsx        # Data visualization
│   └── Login.tsx            # Authentication
├── services/                  # External service layer
│   └── api.ts               # API service methods
├── types/                     # TypeScript definitions
│   ├── index.ts             # Common types
│   └── user.ts              # User-related types
└── lib/                       # Utility functions
    └── utils.ts             # Helper functions
```

---

## 🧩 Component Hierarchy

### Layout Structure

```
App
├── ThemeProvider
├── AuthProvider
├── ToastProvider
└── Router
    ├── Public Routes
    │   └── Login
    └── Protected Routes
        └── DashboardLayout
            ├── Sidebar
            ├── Header
            └── Outlet (Page Content)
                ├── Dashboard
                ├── Users
                ├── Analytics
                └── Settings
```

### Component Categories

#### 1. **UI Components** (`components/ui/`)
Basic, reusable UI building blocks with no business logic.

```typescript
// Example: Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
```

#### 2. **Feature Components** (`components/features/`)
Business logic components tied to specific features.

```typescript
// Example: UserForm component
interface UserFormProps {
  user?: User;
  onSubmit: (userData: UserFormData) => Promise<void>;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const { formData, errors, handleChange, handleSubmit, isValid } = useForm({
    initialData: user || defaultUserData,
    validationRules: userValidationRules,
    onSubmit
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields with validation */}
    </form>
  );
};
```

#### 3. **Layout Components** (`components/layout/`)
Structural components that define page layouts.

```typescript
// Example: DashboardLayout
const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

---

## 🔗 Context Architecture

### Authentication Context

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and get user
      validateAndGetUser(token);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await api.auth.login(email, password);
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Theme Context

```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // System theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();
    mediaQuery.addEventListener('change', updateResolvedTheme);
    
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 🪝 Custom Hooks Architecture

### Data Management Hooks

#### useUsers Hook
```typescript
interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  createUser: (userData: UserFormData) => Promise<User>;
  updateUser: (id: number, userData: UserFormData) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>(defaultPagination);
  const [filters, setFilters] = useState<UserFilters>(defaultFilters);

  // Optimistic updates for better UX
  const createUser = useCallback(async (userData: UserFormData) => {
    const tempUser = { ...userData, id: Date.now(), createdAt: new Date().toISOString() } as User;
    setUsers(prev => [tempUser, ...prev]); // Optimistic update
    
    try {
      const newUser = await api.users.create(userData);
      setUsers(prev => [newUser, ...prev.filter(u => u.id !== tempUser.id)]);
      return newUser;
    } catch (error) {
      setUsers(prev => prev.filter(u => u.id !== tempUser.id)); // Rollback
      throw error;
    }
  }, []);

  // Memoized filtered and sorted users
  const processedUsers = useMemo(() => {
    return filterAndSortUsers(users, filters);
  }, [users, filters]);

  return {
    users: processedUsers,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  };
};
```

### Form Management Hook

```typescript
interface UseFormOptions<T> {
  initialData: T;
  validationRules: ValidationRules<T>;
  onSubmit: (data: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  formData: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldError: (field: keyof T, error: string) => void;
  reset: () => void;
}

export const useForm = <T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> => {
  const [formData, setFormData] = useState<T>(options.initialData);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation logic
  const validateField = useCallback((field: keyof T, value: any) => {
    const rule = options.validationRules[field];
    if (!rule) return '';

    // Apply validation rules
    if (rule.required && (!value || value.toString().trim() === '')) {
      return `${String(field)} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${String(field)} must be at least ${rule.minLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `${String(field)} is invalid`;
    }

    if (rule.custom) {
      return rule.custom(value, formData) || '';
    }

    return '';
  }, [options.validationRules, formData]);

  // Real-time validation
  const handleChange = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField]);

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
    let hasErrors = false;

    Object.keys(options.validationRules).forEach((field) => {
      const error = validateField(field as keyof T, formData[field as keyof T]);
      newErrors[field as keyof T] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);

    if (!hasErrors) {
      try {
        await options.onSubmit(formData);
      } catch (error) {
        // Handle submission errors
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  }, [formData, options, validateField]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  return {
    formData,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldError: (field, error) => setErrors(prev => ({ ...prev, [field]: error })),
    reset: () => {
      setFormData(options.initialData);
      setErrors({} as Record<keyof T, string>);
      setTouched({} as Record<keyof T, boolean>);
    }
  };
};
```

---

## 🎨 Styling Architecture

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f8fafc',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ]
};
```

### Component Styling Patterns

```typescript
// Using cva (class-variance-authority) for consistent styling
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Usage in component
interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, size, children, ...props }) => (
  <button className={buttonVariants({ variant, size })} {...props}>
    {children}
  </button>
);
```

---

## 🔄 State Management

### State Architecture Pattern

```typescript
// Centralized state management using Context + useReducer pattern
interface AppState {
  user: User | null;
  theme: Theme;
  notifications: Notification[];
  users: {
    data: User[];
    loading: boolean;
    error: string | null;
    filters: UserFilters;
  };
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_USERS_LOADING'; payload: boolean };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications] 
      };
    default:
      return state;
  }
};
```

### Local State Guidelines

1. **Component State** - Use `useState` for simple, local component state
2. **Form State** - Use custom `useForm` hook for complex forms
3. **Server State** - Use custom hooks like `useUsers` for API data
4. **Global State** - Use Context API for app-wide state like auth and theme

---

## ⚡ Performance Patterns

### Memoization Strategy

```typescript
// Component memoization
const UserCard = React.memo<UserCardProps>(({ user, onEdit, onDelete }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div className="actions">
        <Button onClick={() => onEdit(user.id)}>Edit</Button>
        <Button variant="danger" onClick={() => onDelete(user.id)}>Delete</Button>
      </div>
    </div>
  );
});

// Hook memoization
const useFilteredUsers = (users: User[], filters: UserFilters) => {
  return useMemo(() => {
    return users.filter(user => {
      if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.role && user.role !== filters.role) {
        return false;
      }
      if (filters.status && user.status !== filters.status) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortOrder === 'desc') {
        return b[filters.sortBy] > a[filters.sortBy] ? 1 : -1;
      }
      return a[filters.sortBy] > b[filters.sortBy] ? 1 : -1;
    });
  }, [users, filters]);
};

// Callback memoization
const UserList = ({ users, onUserUpdate }) => {
  const handleUserEdit = useCallback((userId: number, userData: UserFormData) => {
    onUserUpdate(userId, userData);
  }, [onUserUpdate]);

  const handleUserDelete = useCallback((userId: number) => {
    if (confirm('Are you sure?')) {
      onUserUpdate(userId, null);
    }
  }, [onUserUpdate]);

  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id}
          user={user}
          onEdit={handleUserEdit}
          onDelete={handleUserDelete}
        />
      ))}
    </div>
  );
};
```

### Code Splitting

```typescript
// Lazy loading pages for better initial load performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Suspense wrapper
const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={
          <Suspense fallback={<PageSkeleton />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="users" element={
          <Suspense fallback={<PageSkeleton />}>
            <Users />
          </Suspense>
        } />
        <Route path="analytics" element={
          <Suspense fallback={<PageSkeleton />}>
            <Analytics />
          </Suspense>
        } />
      </Route>
    </Routes>
  </Router>
);
```

---

## 🧪 Testing Architecture

### Component Testing Strategy

```typescript
// Component test example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserForm } from './UserForm';

const mockOnSubmit = jest.fn();

const renderUserForm = (props = {}) => {
  return render(
    <UserForm onSubmit={mockOnSubmit} onCancel={jest.fn()} {...props} />
  );
};

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    renderUserForm();
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderUserForm();
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    renderUserForm();
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        // ... other fields
      });
    });
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm', () => {
  const mockValidationRules = {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /\S+@\S+\.\S+/ }
  };

  test('initializes with default data', () => {
    const { result } = renderHook(() =>
      useForm({
        initialData: { name: '', email: '' },
        validationRules: mockValidationRules,
        onSubmit: jest.fn()
      })
    );

    expect(result.current.formData).toEqual({ name: '', email: '' });
    expect(result.current.isValid).toBe(false);
  });

  test('validates fields on change', () => {
    const { result } = renderHook(() =>
      useForm({
        initialData: { name: '', email: '' },
        validationRules: mockValidationRules,
        onSubmit: jest.fn()
      })
    );

    act(() => {
      result.current.handleChange('name', 'Jo');
    });

    expect(result.current.errors.name).toBe('name must be at least 2 characters');
    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.handleChange('name', 'John');
    });

    expect(result.current.errors.name).toBe('');
  });
});
```

---

## 📚 Development Guidelines

### Code Organization Rules

1. **File Naming**: Use PascalCase for components, camelCase for utilities
2. **Component Structure**: Props interface → Component → Export
3. **Import Order**: React → Third-party → Internal → Relative
4. **Type Definitions**: Co-locate with components or in dedicated types files

### Component Development Checklist

- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- [ ] **Responsiveness**: Mobile, tablet, desktop layouts tested
- [ ] **Dark Mode**: All components support theme switching
- [ ] **Error Handling**: Graceful error states with user feedback
- [ ] **Loading States**: Skeleton screens or spinners for async operations
- [ ] **Type Safety**: Full TypeScript coverage with proper interfaces
- [ ] **Testing**: Unit tests for logic, integration tests for user flows
- [ ] **Performance**: Memoization where appropriate, lazy loading for large components

### Best Practices

1. **Keep Components Small**: Single responsibility, under 200 lines
2. **Use Composition**: Prefer composition over large prop interfaces
3. **Handle Edge Cases**: Empty states, error states, loading states
4. **Optimize Re-renders**: Use React.memo, useMemo, useCallback appropriately
5. **Document Complex Logic**: JSDoc comments for non-obvious functions
6. **Consistent Styling**: Use design system components and utility classes

---

## 🔗 Integration Patterns

### API Integration

```typescript
// Service layer integration
const useApiResource = <T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

### Real-time Updates

```typescript
// WebSocket integration pattern
const useRealTimeUpdates = () => {
  const { addNotification } = useToast();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'USER_UPDATED':
          // Update user in state
          break;
        case 'NOTIFICATION':
          addNotification(data.payload);
          break;
      }
    };

    return () => ws.close();
  }, [addNotification]);
};
```

This architecture guide provides a comprehensive overview of the Mini Dashboard's structural patterns and development guidelines, serving as both documentation and a reference for extending the application.
