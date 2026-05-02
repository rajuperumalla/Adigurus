// ==================== UTILITY FILES ====================

// utils/storage.js
export const StorageManager = {
  cart: {
    get: () => JSON.parse(localStorage.getItem('cart')) || [],
    set: (items) => localStorage.setItem('cart', JSON.stringify(items)),
    clear: () => localStorage.removeItem('cart'),
    add: (item) => {
      const cart = StorageManager.cart.get();
      const existing = cart.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        cart.push({ ...item, quantity: item.quantity || 1 });
      }
      StorageManager.cart.set(cart);
      return cart;
    },
    remove: (id) => {
      const cart = StorageManager.cart.get().filter((i) => i.id !== id);
      StorageManager.cart.set(cart);
      return cart;
    },
  },

  orders: {
    get: () => JSON.parse(localStorage.getItem('orders')) || [],
    set: (orders) => localStorage.setItem('orders', JSON.stringify(orders)),
    add: (order) => {
      const orders = StorageManager.orders.get();
      orders.push(order);
      StorageManager.orders.set(orders);
      return orders;
    },
  },

  products: {
    get: () => JSON.parse(localStorage.getItem('products')) || [],
    set: (products) => localStorage.setItem('products', JSON.stringify(products)),
  },

  user: {
    get: () => JSON.parse(localStorage.getItem('user')) || null,
    set: (user) => localStorage.setItem('user', JSON.stringify(user)),
    clear: () => localStorage.removeItem('user'),
  },

  discounts: {
    get: () => JSON.parse(localStorage.getItem('discounts')) || [],
    set: (discounts) => localStorage.setItem('discounts', JSON.stringify(discounts)),
  },

  // Backup and restore
  backup: () => ({
    products: StorageManager.products.get(),
    orders: StorageManager.orders.get(),
    discounts: StorageManager.discounts.get(),
    cart: StorageManager.cart.get(),
  }),

  restore: (data) => {
    if (data.products) StorageManager.products.set(data.products);
    if (data.orders) StorageManager.orders.set(data.orders);
    if (data.discounts) StorageManager.discounts.set(data.discounts);
    if (data.cart) StorageManager.cart.set(data.cart);
  },

  clear: () => {
    localStorage.clear();
  },
};

// ==================== FORMATTING UTILITIES ====================

// utils/formatting.js
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const truncateText = (text, length = 50) => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ==================== VALIDATION UTILITIES ====================

// utils/validation.js
export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  phone: (phone) => {
    const re = /^[0-9]{10,}$/;
    return re.test(phone.replace(/\D/g, ''));
  },

  zip: (zip) => {
    const re = /^[0-9]{5,}$/;
    return re.test(zip);
  },

  cardNumber: (number) => {
    return number.replace(/\D/g, '').length === 16;
  },

  cardExpiry: (expiry) => {
    const re = /^\d{2}\/\d{2}$/;
    return re.test(expiry);
  },

  cardCVV: (cvv) => {
    return /^\d{3}$/.test(cvv);
  },

  required: (value) => {
    return value && value.trim().length > 0;
  },

  minLength: (value, length) => {
    return value && value.length >= length;
  },

  maxLength: (value, length) => {
    return value && value.length <= length;
  },

  number: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  positiveNumber: (value) => {
    return validators.number(value) && parseFloat(value) > 0;
  },
};

// ==================== FORM VALIDATION HELPER ====================

// utils/formValidation.js
export class FormValidator {
  constructor(schema) {
    this.schema = schema;
    this.errors = {};
  }

  validate(data) {
    this.errors = {};

    Object.keys(this.schema).forEach((field) => {
      const rules = this.schema[field];
      const value = data[field];

      if (rules.required && !validators.required(value)) {
        this.errors[field] = rules.requiredMessage || `${field} is required`;
        return;
      }

      if (rules.email && value && !validators.email(value)) {
        this.errors[field] = 'Invalid email address';
        return;
      }

      if (rules.phone && value && !validators.phone(value)) {
        this.errors[field] = 'Invalid phone number';
        return;
      }

      if (rules.minLength && value && !validators.minLength(value, rules.minLength)) {
        this.errors[field] = `Minimum ${rules.minLength} characters required`;
        return;
      }

      if (rules.custom && !rules.custom(value)) {
        this.errors[field] = rules.customMessage || 'Invalid input';
      }
    });

    return Object.keys(this.errors).length === 0;
  }

  getErrors() {
    return this.errors;
  }

  getError(field) {
    return this.errors[field] || '';
  }

  hasError(field) {
    return !!this.errors[field];
  }
}

// Usage example:
// const validator = new FormValidator({
//   email: { required: true, email: true },
//   phone: { required: true, phone: true },
//   address: { required: true, minLength: 10 },
// });

// ==================== CUSTOM HOOKS ====================

// hooks/useCart.js
import { useState, useCallback, useEffect } from 'react';
import { StorageManager } from '../utils/storage';

export const useCart = () => {
  const [cart, setCart] = useState(() => StorageManager.cart.get());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    StorageManager.cart.set(cart);
  }, [cart]);

  const addToCart = useCallback((product) => {
    setIsLoading(true);
    setTimeout(() => {
      setCart((prevCart) => {
        const existing = prevCart.find((item) => item.id === product.id);
        if (existing) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, { ...product, quantity: 1 }];
      });
      setIsLoading(false);
    }, 300);
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    StorageManager.cart.clear();
  }, []);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isLoading,
  };
};

// hooks/useProducts.js
import { useState, useCallback, useMemo } from 'react';
import { StorageManager } from '../utils/storage';

export const useProducts = () => {
  const [products, setProducts] = useState(() => StorageManager.products.get());
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category))];
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(filter.toLowerCase()) ||
                         p.description.toLowerCase().includes(filter.toLowerCase());
      const matchCategory = category === 'All' || p.category === category;
      return matchSearch && matchCategory;
    });

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [products, filter, category, sortBy]);

  const addProduct = useCallback((product) => {
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    StorageManager.products.set(updated);
    return newProduct;
  }, [products]);

  const updateProduct = useCallback((id, data) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    setProducts(updated);
    StorageManager.products.set(updated);
  }, [products]);

  const deleteProduct = useCallback((id) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    StorageManager.products.set(updated);
  }, [products]);

  const getProduct = useCallback((id) => {
    return products.find((p) => p.id === id);
  }, [products]);

  return {
    products,
    filteredAndSorted,
    categories,
    filter,
    setFilter,
    category,
    setCategory,
    sortBy,
    setSortBy,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
  };
};

// hooks/useOrders.js
import { useState, useCallback } from 'react';
import { StorageManager } from '../utils/storage';

export const useOrders = () => {
  const [orders, setOrders] = useState(() => StorageManager.orders.get());

  const createOrder = useCallback((order) => {
    const newOrder = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const updated = [...orders, newOrder];
    setOrders(updated);
    StorageManager.orders.set(updated);
    return newOrder;
  }, [orders]);

  const updateOrderStatus = useCallback((id, status) => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );
    setOrders(updated);
    StorageManager.orders.set(updated);
  }, [orders]);

  const getOrder = useCallback((id) => {
    return orders.find((o) => o.id === id);
  }, [orders]);

  return {
    orders,
    createOrder,
    updateOrderStatus,
    getOrder,
  };
};

// hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// hooks/useAsync.js
import { useState, useEffect, useCallback } from 'react';

export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};

// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// hooks/useFetch.js
import { useAsync } from './useAsync';

export const useFetch = (url, options = {}) => {
  const asyncFunction = async () => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  return useAsync(asyncFunction);
};

// ==================== MOCK DATA ====================

// utils/mockData.js
export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 4999,
    category: 'Electronics',
    image: '🎧',
    description: 'Noise-cancelling, 30-hour battery, premium sound quality',
    stock: 45,
    rating: 4.8,
    reviews: 234,
  },
  {
    id: '2',
    name: 'Ultra Slim Laptop',
    price: 89999,
    category: 'Computers',
    image: '💻',
    description: '16GB RAM, 512GB SSD, Intel i7, lightweight design',
    stock: 12,
    rating: 4.9,
    reviews: 189,
  },
  {
    id: '3',
    name: 'Smart Watch Pro',
    price: 15999,
    category: 'Wearables',
    image: '⌚',
    description: 'AMOLED display, heart rate monitor, 7-day battery',
    stock: 67,
    rating: 4.6,
    reviews: 456,
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    price: 8999,
    category: 'Accessories',
    image: '⌨️',
    description: 'RGB backlighting, mechanical switches, premium build',
    stock: 89,
    rating: 4.7,
    reviews: 312,
  },
  {
    id: '5',
    name: 'Portable SSD',
    price: 5999,
    category: 'Storage',
    image: '💾',
    description: '1TB, USB-C, reads up to 1050MB/s',
    stock: 56,
    rating: 4.5,
    reviews: 178,
  },
  {
    id: '6',
    name: '4K Webcam',
    price: 3999,
    category: 'Electronics',
    image: '📷',
    description: 'Auto-focus, HDR, built-in microphone',
    stock: 34,
    rating: 4.4,
    reviews: 145,
  },
];

export const MOCK_DISCOUNTS = [
  {
    id: '1',
    code: 'DIWALI25',
    name: 'Diwali Special',
    percentage: 25,
    description: 'Flat 25% off on all products',
    active: true,
    validUntil: '2025-12-31',
  },
  {
    id: '2',
    code: 'NEWYEAR20',
    name: 'New Year Offer',
    percentage: 20,
    description: '20% off on electronics',
    active: true,
    validUntil: '2026-01-31',
  },
  {
    id: '3',
    code: 'FLASH50',
    name: 'Flash Sale',
    percentage: 50,
    description: '50% off on selected items',
    active: false,
    validUntil: '2026-05-05',
  },
];

// ==================== CONSTANTS ====================

// utils/constants.js
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Computers',
  'Wearables',
  'Accessories',
  'Storage',
];

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rating' },
];

export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// ==================== API SERVICE ====================

// services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const api = {
  products: {
    list: () => request('/products'),
    get: (id) => request(`/products/${id}`),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    search: (query) => request(`/products/search?q=${query}`),
  },

  orders: {
    list: () => request('/orders'),
    get: (id) => request(`/orders/${id}`),
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  discounts: {
    list: () => request('/discounts'),
    validate: (code) => request(`/discounts/validate/${code}`),
    create: (data) => request('/discounts', { method: 'POST', body: JSON.stringify(data) }),
  },

  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    verify: () => request('/auth/verify'),
  },

  payment: {
    process: (data) => request('/payment/process', { method: 'POST', body: JSON.stringify(data) }),
    verify: (data) => request('/payment/verify', { method: 'POST', body: JSON.stringify(data) }),
  },

  analytics: {
    stats: () => request('/analytics/stats'),
    revenue: (period) => request(`/analytics/revenue?period=${period}`),
  },
};

export default api;
