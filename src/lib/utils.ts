import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User, UserFilters } from "../types/user"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date utilities
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Delay utility for simulating API calls
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Local storage utilities
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

// User filtering and searching
export function filterUsers(users: User[], filters: Partial<UserFilters>): User[] {
  let filtered = [...users]

  // Search filter - enhanced to include more fields
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.username.toLowerCase().includes(search) ||
      user.jobTitle.toLowerCase().includes(search) ||
      user.company.name.toLowerCase().includes(search) ||
      user.address.city.toLowerCase().includes(search) ||
      user.phone.includes(search)
    )
  }

  // Role filter
  if (filters.role && filters.role !== 'all') {
    filtered = filtered.filter(user => user.role === filters.role)
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(user => user.status === filters.status)
  }

  // Salary status filter
  if (filters.hasSalary && filters.hasSalary !== 'all') {
    if (filters.hasSalary === 'yes') {
      filtered = filtered.filter(user => user.hasSalary)
    } else if (filters.hasSalary === 'no') {
      filtered = filtered.filter(user => !user.hasSalary)
    }
  }

  // Salary range filter
  if (filters.salaryMin !== '' && filters.salaryMin !== undefined) {
    filtered = filtered.filter(user => user.hasSalary && user.salary >= Number(filters.salaryMin))
  }
  if (filters.salaryMax !== '' && filters.salaryMax !== undefined) {
    filtered = filtered.filter(user => user.hasSalary && user.salary <= Number(filters.salaryMax))
  }

  // Company filter
  if (filters.company && filters.company.trim() !== '') {
    const company = filters.company.toLowerCase()
    filtered = filtered.filter(user => 
      user.company.name.toLowerCase().includes(company)
    )
  }

  // Job title filter
  if (filters.jobTitle && filters.jobTitle.trim() !== '') {
    const jobTitle = filters.jobTitle.toLowerCase()
    filtered = filtered.filter(user => 
      user.jobTitle.toLowerCase().includes(jobTitle)
    )
  }

  // City filter
  if (filters.city && filters.city.trim() !== '') {
    const city = filters.city.toLowerCase()
    filtered = filtered.filter(user => 
      user.address.city.toLowerCase().includes(city)
    )
  }

  // Date range filters
  if (filters.createdAfter && filters.createdAfter.trim() !== '') {
    const afterDate = new Date(filters.createdAfter)
    filtered = filtered.filter(user => {
      if (!user.createdAt) return false
      return new Date(user.createdAt) >= afterDate
    })
  }
  if (filters.createdBefore && filters.createdBefore.trim() !== '') {
    const beforeDate = new Date(filters.createdBefore)
    filtered = filtered.filter(user => {
      if (!user.createdAt) return false
      return new Date(user.createdAt) <= beforeDate
    })
  }

  // Sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aValue = getNestedValue(a, filters.sortBy!)
      const bValue = getNestedValue(b, filters.sortBy!)
      
      if (filters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })
  }

  return filtered
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Pagination utilities
export function paginateArray<T>(array: T[], page: number, limit: number): T[] {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  return array.slice(startIndex, endIndex)
}

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit)
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Avatar utilities
export function generateAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&bold=true`
}

// Export utilities
export function downloadJSON(data: any, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function downloadCSV(data: any[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Filter utilities
export function getActiveFiltersCount(filters: Partial<UserFilters>): number {
  let count = 0
  
  if (filters.search && filters.search.trim() !== '') count++
  if (filters.role && filters.role !== 'all') count++
  if (filters.status && filters.status !== 'all') count++
  if (filters.hasSalary && filters.hasSalary !== 'all') count++
  if (filters.salaryMin !== '' && filters.salaryMin !== undefined) count++
  if (filters.salaryMax !== '' && filters.salaryMax !== undefined) count++
  if (filters.company && filters.company.trim() !== '') count++
  if (filters.jobTitle && filters.jobTitle.trim() !== '') count++
  if (filters.city && filters.city.trim() !== '') count++
  if (filters.createdAfter && filters.createdAfter.trim() !== '') count++
  if (filters.createdBefore && filters.createdBefore.trim() !== '') count++
  
  return count
}

export function getUniqueValues(users: User[], field: string): string[] {
  const values = users.map(user => {
    const value = getNestedValue(user, field)
    return value ? String(value) : ''
  }).filter(Boolean)
  
  return [...new Set(values)].sort()
}

