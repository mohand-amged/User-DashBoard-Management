import React from 'react';
import type { User, UserFormData } from '../../types/user';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { useForm, validators, composeValidators } from '../../hooks/useForm';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => Promise<void>;
  initialUser?: User | null;
  isLoading?: boolean;
}

const initialFormData: UserFormData = {
  name: '',
  username: '',
  email: '',
  phone: '',
  website: '',
  company: {
    name: '',
  },
  address: {
    street: '',
    city: '',
    zipcode: '',
  },
  role: 'user',
  status: 'active',
  jobTitle: '',
  salary: 0,
  hasSalary: false,
};

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
];

const jobTitlesByRole = {
  admin: [
    'System Administrator',
    'IT Manager',
    'Security Administrator',
    'Database Administrator'
  ],
  manager: [
    'Project Manager',
    'Team Lead',
    'Department Manager',
    'Operations Manager',
    'Product Manager'
  ],
  user: [
    'Software Engineer',
    'Data Analyst',
    'Designer',
    'Marketing Specialist',
    'Sales Representative',
    'Customer Support',
    'Content Writer'
  ]
};

const salaryRangesByRole = {
  admin: { min: 80000, max: 150000, default: 120000 },
  manager: { min: 70000, max: 130000, default: 95000 },
  user: { min: 40000, max: 100000, default: 65000 }
};

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUser,
  isLoading = false,
}) => {
  const isEditing = !!initialUser;

  // Convert User to UserFormData format
  const getUserFormData = (user: User | null): UserFormData => {
    if (!user) return initialFormData;

    return {
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      website: user.website,
      company: {
        name: user.company.name,
      },
      address: {
        street: user.address.street,
        city: user.address.city,
        zipcode: user.address.zipcode,
      },
      role: user.role || 'user',
      status: user.status || 'active',
      jobTitle: user.jobTitle || '',
      salary: user.salary || 0,
      hasSalary: user.hasSalary || false,
    };
  };

  const validateForm = (values: UserFormData) => {
    const errors: Record<string, string> = {};

    // Name validation
    const nameError = composeValidators(
      validators.required('Name is required'),
      validators.minLength(2, 'Name must be at least 2 characters')
    )(values.name);
    if (nameError) errors.name = nameError;

    // Username validation
    const usernameError = composeValidators(
      validators.required('Username is required'),
      validators.minLength(3, 'Username must be at least 3 characters'),
      validators.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    )(values.username);
    if (usernameError) errors.username = usernameError;

    // Email validation
    const emailError = composeValidators(
      validators.required('Email is required'),
      validators.email()
    )(values.email);
    if (emailError) errors.email = emailError;

    // Phone validation
    const phoneError = validators.phone()(values.phone);
    if (phoneError) errors.phone = phoneError;

    // Website validation (optional)
    if (values.website) {
      const websiteError = validators.url()(values.website);
      if (websiteError) errors.website = websiteError;
    }

    // Company name validation
    const companyError = validators.required('Company name is required')(values.company.name);
    if (companyError) errors['company.name'] = companyError;

    // Address validation
    const streetError = validators.required('Street is required')(values.address.street);
    if (streetError) errors['address.street'] = streetError;

    const cityError = validators.required('City is required')(values.address.city);
    if (cityError) errors['address.city'] = cityError;

    const zipcodeError = composeValidators(
      validators.required('Zipcode is required'),
      validators.pattern(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid zipcode format')
    )(values.address.zipcode);
    if (zipcodeError) errors['address.zipcode'] = zipcodeError;

    // Job title validation
    const jobTitleError = validators.required('Job title is required')(values.jobTitle);
    if (jobTitleError) errors.jobTitle = jobTitleError;

    // Salary validation (only if hasSalary is true)
    if (values.hasSalary) {
      const salaryError = composeValidators(
        validators.required('Salary is required when salary status is enabled'),
        validators.min(0, 'Salary must be a positive number')
      )(values.salary);
      if (salaryError) errors.salary = salaryError;
    }

    return errors;
  };

  const form = useForm({
    initialValues: getUserFormData(initialUser ?? null),
    validate: validateForm,
    onSubmit: async (values) => {
      await onSubmit(values);
      onClose();
      form.reset();
    },
  });

  // Handle role change to update job titles and salary suggestions
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'admin' | 'manager' | 'user';
    form.handleChange('role')(e);
    
    // Clear job title when role changes
    form.setValue('jobTitle', '');
    
    // Auto-suggest salary based on role if salary is enabled
    if (form.values.hasSalary && salaryRangesByRole[newRole]) {
      form.setValue('salary', salaryRangesByRole[newRole].default);
    }
  };

  // Handle salary status change
  const handleSalaryStatusChange = (enabled: boolean) => {
    form.setValue('hasSalary', enabled);
    if (enabled && form.values.role && salaryRangesByRole[form.values.role as keyof typeof salaryRangesByRole]) {
      const roleRange = salaryRangesByRole[form.values.role as keyof typeof salaryRangesByRole];
      form.setValue('salary', roleRange.default);
    } else if (!enabled) {
      form.setValue('salary', 0);
    }
  };

  // Get available job titles based on selected role
  const availableJobTitles = form.values.role 
    ? jobTitlesByRole[form.values.role as keyof typeof jobTitlesByRole] || []
    : [];

  // Get salary range for current role
  const currentSalaryRange = form.values.role && salaryRangesByRole[form.values.role as keyof typeof salaryRangesByRole]
    ? salaryRangesByRole[form.values.role as keyof typeof salaryRangesByRole]
    : null;

  const handleClose = () => {
    onClose();
    form.reset();
  };

  // Reset form when initialUser changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset(getUserFormData(initialUser ?? null));
    }
  }, [isOpen, initialUser]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit User' : 'Add New User'}
      size="lg"
    >
      <form onSubmit={form.handleSubmit}>
        <ModalBody>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={form.values.name}
                  onChange={form.handleChange('name')}
                  onBlur={form.handleBlur('name')}
                  error={form.errors.name}
                  placeholder="Enter full name"
                />
                <Input
                  label="Username"
                  value={form.values.username}
                  onChange={form.handleChange('username')}
                  onBlur={form.handleBlur('username')}
                  error={form.errors.username}
                  placeholder="Enter username"
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.values.email}
                  onChange={form.handleChange('email')}
                  onBlur={form.handleBlur('email')}
                  error={form.errors.email}
                  placeholder="Enter email address"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={form.values.phone}
                  onChange={form.handleChange('phone')}
                  onBlur={form.handleBlur('phone')}
                  error={form.errors.phone}
                  placeholder="Enter phone number"
                />
                <Input
                  label="Website (optional)"
                  type="url"
                  value={form.values.website}
                  onChange={form.handleChange('website')}
                  onBlur={form.handleBlur('website')}
                  error={form.errors.website}
                  placeholder="https://example.com"
                />
                <Input
                  label="Company"
                  value={form.values.company.name}
                  onChange={(e) => form.setValue('company', { name: e.target.value })}
                  onBlur={() => form.markTouched('company')}
                  error={form.errors['company.name']}
                  placeholder="Enter company name"
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Street Address"
                    value={form.values.address.street}
                    onChange={(e) => form.setValue('address', { ...form.values.address, street: e.target.value })}
                    onBlur={() => form.markTouched('address')}
                    error={form.errors['address.street']}
                    placeholder="Enter street address"
                  />
                </div>
                <Input
                  label="City"
                  value={form.values.address.city}
                  onChange={(e) => form.setValue('address', { ...form.values.address, city: e.target.value })}
                  onBlur={() => form.markTouched('address')}
                  error={form.errors['address.city']}
                  placeholder="Enter city"
                />
                <Input
                  label="ZIP Code"
                  value={form.values.address.zipcode}
                  onChange={(e) => form.setValue('address', { ...form.values.address, zipcode: e.target.value })}
                  onBlur={() => form.markTouched('address')}
                  error={form.errors['address.zipcode']}
                  placeholder="12345"
                />
              </div>
            </div>

            {/* Role and Status */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                User Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Role"
                  value={form.values.role}
                  onChange={handleRoleChange}
                  options={roleOptions}
                />
                <Select
                  label="Status"
                  value={form.values.status}
                  onChange={form.handleChange('status')}
                  options={statusOptions}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Employment Information
              </h4>
              <div className="space-y-4">
                {/* Job Title Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Job Title {form.values.role && (
                      <span className="text-xs text-slate-500">({form.values.role} positions)</span>
                    )}
                  </label>
                  
                  {form.values.role && availableJobTitles.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={form.values.jobTitle}
                        onChange={form.handleChange('jobTitle')}
                        onBlur={form.handleBlur('jobTitle')}
                        className={`w-full h-10 px-3 py-2 border rounded-md bg-white text-slate-900 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:border-slate-500 ${
                          form.errors.jobTitle ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <option value="" className="text-slate-500 dark:text-slate-400">Select a job title...</option>
                        {availableJobTitles.map(title => (
                          <option key={title} value={title} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">{title}</option>
                        ))}
                      </select>
                      
                      {/* Custom job title option */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            Or enter custom:
                          </label>
                          <div className="flex-1">
                            <Input
                              value={availableJobTitles.includes(form.values.jobTitle) ? '' : form.values.jobTitle}
                              onChange={(e) => form.setValue('jobTitle', e.target.value)}
                              placeholder="Enter custom job title"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Input
                      value={form.values.jobTitle}
                      onChange={form.handleChange('jobTitle')}
                      onBlur={form.handleBlur('jobTitle')}
                      placeholder={form.values.role ? 'Enter job title' : 'Select a role first'}
                      disabled={!form.values.role}
                    />
                  )}
                  
                  {form.errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.jobTitle}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start space-x-3">
                      <input
                        id="hasSalary"
                        type="checkbox"
                        checked={form.values.hasSalary}
                        onChange={(e) => handleSalaryStatusChange(e.target.checked)}
                        className="mt-1 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <div className="flex-1">
                        <label htmlFor="hasSalary" className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                          This user receives a salary
                        </label>
                        {currentSalaryRange && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Typical range for {form.values.role}s: ${currentSalaryRange.min.toLocaleString()} - ${currentSalaryRange.max.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {currentSalaryRange && form.values.hasSalary && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">
                          💡 Suggested range for {form.values.role}:
                        </span>
                        <button
                          type="button"
                          onClick={() => form.setValue('salary', currentSalaryRange.default)}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Use suggested: ${currentSalaryRange.default.toLocaleString()}
                        </button>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Range: ${currentSalaryRange.min.toLocaleString()} - ${currentSalaryRange.max.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {form.values.hasSalary && (
                  <div>
                    <Input
                      label={`Annual Salary (USD)${currentSalaryRange ? ` • Range: $${currentSalaryRange.min.toLocaleString()} - $${currentSalaryRange.max.toLocaleString()}` : ''}`}
                      type="number"
                      value={form.values.salary.toString()}
                      onChange={(e) => form.setValue('salary', parseFloat(e.target.value) || 0)}
                      onBlur={form.handleBlur('salary')}
                      error={form.errors.salary}
                      placeholder={currentSalaryRange ? `Suggested: $${currentSalaryRange.default.toLocaleString()}` : "Enter annual salary"}
                      min={currentSalaryRange?.min.toString() || "0"}
                      max={currentSalaryRange?.max.toString()}
                      step="1000"
                    />
                    {currentSalaryRange && form.values.salary > 0 && (
                      <div className="mt-1 text-xs">
                        {form.values.salary < currentSalaryRange.min ? (
                          <span className="text-orange-600 dark:text-orange-400">
                            ⚠️ Below typical range for {form.values.role} role
                          </span>
                        ) : form.values.salary > currentSalaryRange.max ? (
                          <span className="text-orange-600 dark:text-orange-400">
                            ⚠️ Above typical range for {form.values.role} role
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">
                            ✓ Within typical range for {form.values.role} role
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={!form.isValid || isLoading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};
