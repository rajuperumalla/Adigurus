import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, Menu, X, LogOut, Plus, Minus, Trash2, Settings, BarChart3, Package, TrendingUp, Search, Eye, EyeOff, Lock, AlertCircle, Check, Home, LogIn, Edit2, ChevronDown, Filter, Grid, List as ListIcon } from 'lucide-react';

// ==================== ANIMATIONS STYLESHEET ====================
const ANIMATIONS_STYLE = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(236, 72, 153, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(236, 72, 153, 0.6);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes cartFloat {
    0% {
      opacity: 0;
      transform: translate(0, 0) scale(0.5);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(100px, -100px) scale(0.8);
    }
  }

  @keyframes flip {
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }

  @keyframes confetti {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  /* ========== MOBILE-FIRST NAV ANIMATIONS ========== */
  @keyframes hamburgerTop {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(8px) rotate(45deg); }
  }

  @keyframes hamburgerMid {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes hamburgerBot {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(-8px) rotate(-45deg); }
  }

  @keyframes mobileMenuSlideIn {
    from {
      opacity: 0;
      transform: translateX(-100%);
      visibility: hidden;
    }
    to {
      opacity: 1;
      transform: translateX(0);
      visibility: visible;
    }
  }

  @keyframes mobileMenuSlideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-100%);
      visibility: hidden;
    }
  }

  @keyframes navItemSlideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes underlineExpand {
    from {
      width: 0;
      left: 50%;
    }
    to {
      width: 100%;
      left: 0;
    }
  }

  @keyframes underlineShrink {
    from {
      width: 100%;
      left: 0;
    }
    to {
      width: 0;
      left: 50%;
    }
  }

  /* ========== LOADING ANIMATIONS ========== */
  @keyframes skeletonPulse {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes shimmerWave {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes progressBarMove {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes rotateClockwise {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rotateCW {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rotateCounterCW {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }

  @keyframes pulse-slow {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes fadeInStagger {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ========== DESKTOP HOVER ANIMATIONS (Media Query) ========== */
  @media (min-width: 768px) {
    @keyframes desktopNavHover {
      from {
        opacity: 0.8;
        transform: translateY(2px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes backgroundSlide {
      from {
        background-position: 200% 0;
      }
      to {
        background-position: 0% 0;
      }
    }
  }

  .animate-slideInUp {
    animation: slideInUp 0.5s ease-out;
  }

  .animate-slideInDown {
    animation: slideInDown 0.5s ease-out;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.5s ease-out;
  }

  .animate-slideInRight {
    animation: slideInRight 0.5s ease-out;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  .animate-slideOut {
    animation: slideOut 0.3s ease-in;
  }

  .animate-hamburgerOpen .line-top {
    animation: hamburgerTop 0.4s ease-in-out forwards;
  }

  .animate-hamburgerOpen .line-mid {
    animation: hamburgerMid 0.2s ease-in-out forwards;
  }

  .animate-hamburgerOpen .line-bot {
    animation: hamburgerBot 0.4s ease-in-out forwards;
  }

  .animate-mobileMenuOpen {
    animation: mobileMenuSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .animate-mobileMenuClose {
    animation: mobileMenuSlideOut 0.3s ease-in forwards;
  }

  .animate-navItemSlide {
    animation: navItemSlideIn 0.4s ease-out;
  }

  .animate-skeleton {
    background: linear-gradient(90deg, #1E293B 0%, #334155 50%, #1E293B 100%);
    background-size: 200% 100%;
    animation: skeletonPulse 2s infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 1000px 100%;
    animation: shimmerWave 2s infinite;
  }

  .animate-progressBar {
    background: linear-gradient(90deg, #EC4899, #F97316, #EC4899);
    background-size: 200% 100%;
    animation: progressBarMove 1.5s ease-in-out infinite;
  }

  .animate-spinCW {
    animation: rotateClockwise 1.5s linear infinite;
  }

  .animate-spinCCW {
    animation: rotateCounterCW 1.5s linear infinite;
  }

  .animate-pulseSlow {
    animation: pulse-slow 2s ease-in-out infinite;
  }

  .animate-stagger-1 {
    animation: fadeInStagger 0.5s ease-out 0s forwards;
  }

  .animate-stagger-2 {
    animation: fadeInStagger 0.5s ease-out 0.1s forwards;
  }

  .animate-stagger-3 {
    animation: fadeInStagger 0.5s ease-out 0.2s forwards;
  }

  .animate-stagger-4 {
    animation: fadeInStagger 0.5s ease-out 0.3s forwards;
  }

  /* Desktop-only hover enhancements */
  @media (hover: hover) {
    .nav-item {
      position: relative;
    }

    .nav-item::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      width: 0;
      height: 2px;
      background: #EC4899;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .nav-item:hover::after {
      width: 100%;
      left: 0;
    }

    .nav-item:hover {
      animation: desktopNavHover 0.3s ease-out;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .group:hover .group-hover\\:animate-flip {
    animation: flip 0.6s ease-in-out;
  }
`;

// Inject animations into document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = ANIMATIONS_STYLE;
  document.head.appendChild(style);
}

// ==================== DESIGN SYSTEM ====================
const DESIGN_TOKENS = {
  colors: {
    primary: '#0F172A', // Navy
    secondary: '#EC4899', // Hot pink
    accent: '#F97316', // Vibrant orange
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    bg: {
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#334155',
      light: '#F8FAFC',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      dark: '#0F172A',
    },
    border: '#475569',
  },
  fonts: {
    display: 'Poppins, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
};

// ==================== UTILITY FUNCTIONS ====================
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// ==================== STORAGE MANAGEMENT ====================
const StorageManager = {
  cart: {
    get: () => JSON.parse(localStorage.getItem('cart')) || [],
    set: (items) => localStorage.setItem('cart', JSON.stringify(items)),
    clear: () => localStorage.removeItem('cart'),
  },
  orders: {
    get: () => JSON.parse(localStorage.getItem('orders')) || [],
    set: (orders) => localStorage.setItem('orders', JSON.stringify(orders)),
  },
  products: {
    get: () => JSON.parse(localStorage.getItem('products')) || MOCK_PRODUCTS,
    set: (products) => localStorage.setItem('products', JSON.stringify(products)),
  },
  user: {
    get: () => JSON.parse(localStorage.getItem('user')) || null,
    set: (user) => localStorage.setItem('user', JSON.stringify(user)),
    clear: () => localStorage.removeItem('user'),
  },
  discounts: {
    get: () => JSON.parse(localStorage.getItem('discounts')) || MOCK_DISCOUNTS,
    set: (discounts) => localStorage.setItem('discounts', JSON.stringify(discounts)),
  },
};

// ==================== MOCK DATA ====================
const MOCK_PRODUCTS = [
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

const MOCK_DISCOUNTS = [
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

// ==================== REUSABLE COMPONENTS ====================
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    setIsClicked(true);
    onClick?.(e);
    setTimeout(() => setIsClicked(false), 600);
  };

  const baseStyles = `
    font-semibold rounded-lg transition-all duration-300 cursor-pointer
    flex items-center justify-center gap-2 whitespace-nowrap
    hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden group
  `;

  const variants = {
    primary: `bg-gradient-to-r from-[${DESIGN_TOKENS.colors.secondary}] to-[${DESIGN_TOKENS.colors.accent}] text-white shadow-lg hover:shadow-2xl hover:shadow-[#EC4899]/50`,
    secondary: `bg-[${DESIGN_TOKENS.colors.bg.secondary}] text-[${DESIGN_TOKENS.colors.text.primary}] border border-[${DESIGN_TOKENS.colors.border}] hover:border-[${DESIGN_TOKENS.colors.secondary}] hover:bg-[${DESIGN_TOKENS.colors.bg.tertiary}]`,
    outline: `border-2 border-[${DESIGN_TOKENS.colors.secondary}] text-[${DESIGN_TOKENS.colors.secondary}] hover:bg-[${DESIGN_TOKENS.colors.secondary}] hover:text-white`,
    ghost: `text-[${DESIGN_TOKENS.colors.text.primary}] hover:bg-[${DESIGN_TOKENS.colors.bg.secondary}]`,
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <div className="animate-spin">⏳</div> : Icon && <Icon size={20} />}
      {children}
      {isClicked && (
        <div className="absolute inset-0 bg-white opacity-30 rounded-full animate-ping"
             style={{ animation: 'pulse 0.6s ease-out' }} />
      )}
    </button>
  );
};

const Card = ({ children, className = '', hover = true, animate = true }) => (
  <div
    className={`
      bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6
      border border-[#475569]/30 backdrop-blur-sm
      ${hover ? 'hover:border-[#EC4899]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#EC4899]/10 hover:scale-105 hover:-translate-y-1' : ''}
      ${animate ? 'animate-slideInUp' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-[#CBD5E1] mb-2">{label}</label>
    )}
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />}
      <input
        className={`
          w-full px-4 py-3 bg-[#334155] border rounded-lg
          text-[#F1F5F9] placeholder-[#64748B]
          focus:outline-none focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/20
          transition-all duration-300
          ${Icon ? 'pl-10' : ''} ${error ? 'border-[#EF4444]' : 'border-[#475569]'}
        `}
        {...props}
      />
    </div>
    {error && <p className="text-[#EF4444] text-sm mt-1">{error}</p>}
  </div>
);

const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-[#EC4899]/20 text-[#EC4899]',
    success: 'bg-[#10B981]/20 text-[#10B981]',
    warning: 'bg-[#F59E0B]/20 text-[#F59E0B]',
    danger: 'bg-[#EF4444]/20 text-[#EF4444]',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`${variants[variant]} ${sizes[size]} rounded-full font-semibold inline-block`}>
      {children}
    </span>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-[#EC4899]/20 border-t-[#EC4899] rounded-full animate-spinCW"></div>
        <div className="absolute inset-2 border-4 border-[#F97316]/20 border-b-[#F97316] rounded-full animate-spinCCW" style={{ animationDirection: 'reverse' }}></div>
      </div>
      <p className="text-[#CBD5E1] animate-pulseSlow">Loading amazing products...</p>
    </div>
  </div>
);

const SkeletonLoader = ({ count = 4, isGrid = true }) => (
  <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${isGrid ? 'flex flex-col' : 'flex gap-4'}`}>
        <div className="animate-skeleton h-40 rounded-lg"></div>
        <div className="animate-skeleton h-4 rounded w-3/4"></div>
        <div className="animate-skeleton h-4 rounded w-1/2"></div>
        {isGrid && (
          <>
            <div className="animate-skeleton h-3 rounded w-2/3 mt-2"></div>
            <div className="animate-skeleton h-8 rounded mt-auto"></div>
          </>
        )}
      </div>
    ))}
  </div>
);

const ProgressBar = ({ progress = 65 }) => (
  <div className="w-full h-1 bg-[#334155] rounded-full overflow-hidden">
    <div
      className="h-full animate-progressBar rounded-full"
      style={{ width: `${progress}%`, transition: 'width 0.3s ease-out' }}
    ></div>
  </div>
);

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 animate-slideInUp">
    <div className="text-6xl mb-4 opacity-50 animate-float">{Icon}</div>
    <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2 animate-slideInDown">{title}</h3>
    <p className="text-[#CBD5E1] mb-6 text-center max-w-sm animate-slideInUp" style={{ animationDelay: '100ms' }}>{description}</p>
    {action && <div className="flex gap-3 animate-slideInUp" style={{ animationDelay: '200ms' }}>{action}</div>}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <Card
        className={`${sizes[size]} max-h-[90vh] overflow-y-auto animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
        hover={false}
      >
        <div className="flex items-center justify-between mb-6 animate-slideInDown">
          <h2 className="text-2xl font-bold text-[#F1F5F9]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors hover:scale-110 hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>
        <div className="animate-slideInUp">{children}</div>
      </Card>
    </div>
  );
};

// ==================== PRODUCT GRID COMPONENT ====================
const ProductGrid = ({ products, onAddToCart, viewMode = 'grid' }) => {
  if (products.length === 0) {
    return <EmptyState icon="📦" title="No products found" description="Try adjusting your filters" />;
  }

  return (
    <div
      className={`${
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'flex flex-col gap-4'
      }`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isListView={viewMode === 'list'}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product, onAddToCart, isListView = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showAddedAnimation, setShowAddedAnimation] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    setShowAddedAnimation(true);
    await new Promise((r) => setTimeout(r, 300));
    onAddToCart(product);
    setIsAdding(false);
    setTimeout(() => setShowAddedAnimation(false), 600);
  };

  if (isListView) {
    return (
      <Card className="flex items-start gap-6 hover:shadow-lg animate-slideInUp">
        <div className="text-6xl flex-shrink-0 group-hover:animate-float transition-transform">{product.image}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">{product.name}</h3>
          <p className="text-[#CBD5E1] text-sm mb-3">{product.description}</p>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="success" size="sm">
              ⭐ {product.rating} ({product.reviews})
            </Badge>
            <span className="text-[#94A3B8] text-sm">{product.stock} in stock</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </p>
            <Button
              icon={ShoppingCart}
              loading={isAdding}
              onClick={handleAdd}
              size="md"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex flex-col h-full hover:shadow-2xl hover:shadow-[#EC4899]/20 group overflow-hidden animate-slideInUp relative"
      hover
      animate={false}
    >
      {showAddedAnimation && (
        <div className="absolute inset-0 bg-green-500/20 rounded-2xl animate-ping"></div>
      )}
      <div className="text-5xl mb-4 text-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-float">
        {product.image}
      </div>
      <h3 className="font-bold text-[#F1F5F9] mb-2 line-clamp-2 group-hover:text-[#EC4899] transition-colors">{product.name}</h3>
      <p className="text-[#CBD5E1] text-sm mb-3 line-clamp-2">{product.description}</p>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="success" size="sm">
          ⭐ {product.rating}
        </Badge>
        <span className="text-xs text-[#94A3B8]">({product.reviews})</span>
      </div>
      <div className="mt-auto">
        {product.stock > 0 ? (
          <Badge variant="default" size="sm">
            {product.stock} left
          </Badge>
        ) : (
          <Badge variant="danger" size="sm">
            Out of Stock
          </Badge>
        )}
      </div>
      <p className="text-2xl font-bold bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent my-4 group-hover:scale-110 transition-transform">
        {formatPrice(product.price)}
      </p>
      <Button
        icon={ShoppingCart}
        loading={isAdding}
        onClick={handleAdd}
        size="md"
        className={showAddedAnimation ? 'animate-bounce' : ''}
      >
        {showAddedAnimation ? '✓ Added!' : 'Add to Cart'}
      </Button>
    </Card>
  );
};
        }}
        size="md"
        className="w-full"
        disabled={product.stock === 0}
      >
        Add to Cart
      </Button>
    </Card>
  );
};

// ==================== SHOPPING CART ====================
const ShoppingCartPage = ({ cart, onRemove, onUpdateQuantity, onCheckout }) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [showPromoError, setShowPromoError] = useState('');

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(
    () => appliedDiscount ? (subtotal * appliedDiscount.percentage) / 100 : 0,
    [subtotal, appliedDiscount]
  );

  const total = subtotal - discountAmount;

  const applyPromo = () => {
    setShowPromoError('');
    const discount = StorageManager.discounts.get().find(
      (d) => d.code.toUpperCase() === promoCode.toUpperCase() && d.active
    );

    if (discount) {
      setAppliedDiscount(discount);
      setPromoCode('');
    } else {
      setShowPromoError('Invalid or expired coupon code');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Start shopping to add items to your cart"
          action={[
            <Button key="shop" onClick={() => window.location.hash = '#home'}>
              Continue Shopping
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="flex items-center gap-6 hover:shadow-lg">
                <div className="text-4xl">{item.image}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#F1F5F9] mb-1">{item.name}</h3>
                  <p className="text-[#CBD5E1] text-sm mb-3">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    icon={Minus}
                  />
                  <span className="w-8 text-center font-bold text-[#F1F5F9]">
                    {item.quantity}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    icon={Plus}
                  />
                </div>
                <p className="font-bold text-[#EC4899] text-lg w-24 text-right">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  icon={Trash2}
                  className="text-[#EF4444] hover:text-[#EF4444]"
                />
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-[#475569]">
              <div className="flex justify-between text-[#CBD5E1]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-[#10B981]">
                  <div className="flex items-center gap-2">
                    <span>Discount ({appliedDiscount.code})</span>
                    <button
                      onClick={() => setAppliedDiscount(null)}
                      className="text-xs text-[#94A3B8] hover:text-[#F1F5F9]"
                    >
                      ✕
                    </button>
                  </div>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#CBD5E1] text-sm">
                <span>Shipping</span>
                <span className="text-[#10B981]">Free</span>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-[#475569]">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-[#F1F5F9]">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {!appliedDiscount && (
              <div className="mb-6">
                <p className="text-sm text-[#CBD5E1] mb-3">Have a discount code?</p>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setShowPromoError('');
                    }}
                    placeholder="Enter code"
                    error={showPromoError}
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={applyPromo}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            <Button
              className="w-full mb-3"
              size="lg"
              onClick={() => onCheckout({ subtotal, discount: discountAmount, total })}
              icon={ShoppingCart}
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              size="md"
              onClick={() => window.location.hash = '#home'}
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==================== CHECKOUT PAGE ====================
const CheckoutPage = ({ cart, onOrder, total, discount, subtotal }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Valid phone required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zip || formData.zip.length < 5) newErrors.zip = 'Valid ZIP required';
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = '16-digit card number required';
    }
    if (!formData.cardExpiry || !/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Format: MM/YY';
    }
    if (!formData.cardCVV || formData.cardCVV.length !== 3) newErrors.cardCVV = '3-digit CVV';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));

    const order = {
      id: generateId(),
      items: cart,
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city} ${formData.zip}`,
      },
      subtotal,
      discount,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onOrder(order);
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                  placeholder="John Doe"
                  icon={AlertCircle}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  placeholder="john@example.com"
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={errors.phone}
                  placeholder="+91 9876543210"
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  error={errors.city}
                  placeholder="Hyderabad"
                />
              </div>
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                error={errors.address}
                placeholder="123 Main Street"
                className="mt-4"
              />
              <Input
                label="ZIP Code"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                error={errors.zip}
                placeholder="500001"
                className="mt-4"
              />
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-4 flex items-center gap-2">
                <Lock size={20} /> Payment Information
              </h2>
              <Input
                label="Card Number"
                value={formData.cardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                  setFormData({ ...formData, cardNumber: val });
                }}
                error={errors.cardNumber}
                placeholder="1234 5678 9012 3456"
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  label="Expiry (MM/YY)"
                  value={formData.cardExpiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                    setFormData({ ...formData, cardExpiry: val });
                  }}
                  error={errors.cardExpiry}
                  placeholder="12/25"
                />
                <Input
                  label="CVV"
                  value={formData.cardCVV}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setFormData({ ...formData, cardCVV: val });
                  }}
                  error={errors.cardCVV}
                  placeholder="123"
                  type="password"
                />
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isProcessing}
            >
              {isProcessing ? 'Processing Payment...' : 'Complete Purchase'}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h2 className="text-xl font-bold text-[#F1F5F9] mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-[#CBD5E1] text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-[#94A3B8]">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#475569] pt-4 space-y-2">
              <div className="flex justify-between text-[#CBD5E1]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#CBD5E1]">
                <span>Shipping</span>
                <span className="text-[#10B981]">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#F1F5F9] pt-4 border-t border-[#475569]">
                <span>Total</span>
                <span className="bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==================== ORDER SUCCESS PAGE ====================
const OrderSuccessPage = ({ order }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <div className="text-8xl mb-6 animate-bounce">✅</div>
          <h1 className="text-4xl font-bold text-[#F1F5F9] mb-4">Order Confirmed!</h1>
          <p className="text-[#CBD5E1] text-lg mb-8">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          <div className="bg-[#0F172A] rounded-xl p-6 mb-8 text-left">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Order ID</p>
                <p className="text-[#F1F5F9] font-bold font-mono">{order.id}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Order Date</p>
                <p className="text-[#F1F5F9] font-bold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Total Amount</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
                  {formatPrice(order.total)}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm mb-1">Status</p>
                <Badge variant="success" size="md">
                  ✓ {order.status}
                </Badge>
              </div>
            </div>

            <div className="border-t border-[#475569] pt-6">
              <h3 className="font-bold text-[#F1F5F9] mb-4">Shipping to</h3>
              <p className="text-[#CBD5E1] font-semibold">{order.customer.name}</p>
              <p className="text-[#CBD5E1]">{order.customer.address}</p>
              <p className="text-[#CBD5E1]">{order.customer.phone}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[#CBD5E1] mb-6">
              A confirmation email has been sent to <span className="font-semibold">{order.customer.email}</span>
            </p>
            <Button
              className="w-full mb-3"
              size="lg"
              onClick={() => window.location.hash = '#home'}
            >
              Continue Shopping
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              size="md"
              onClick={() => window.location.hash = '#orders'}
            >
              View All Orders
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== ADMIN DASHBOARD ====================
const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(() => StorageManager.products.get());
  const [orders, setOrders] = useState(() => StorageManager.orders.get());
  const [discounts, setDiscounts] = useState(() => StorageManager.discounts.get());
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    image: '📦',
    rating: '4',
    reviews: '0',
  });
  const [discountForm, setDiscountForm] = useState({
    code: '',
    name: '',
    percentage: '',
    description: '',
    validUntil: '',
    active: true,
  });

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, totalProducts, avgOrderValue };
  }, [orders, products]);

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: '',
        stock: '',
        description: '',
        image: '📦',
        rating: '4',
        reviews: '0',
      });
    }
    setShowProductModal(true);
  };

  const saveProduct = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Please fill all required fields');
      return;
    }

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? { ...formData, id: editingProduct.id, price: parseFloat(formData.price), stock: parseInt(formData.stock), rating: parseFloat(formData.rating), reviews: parseInt(formData.reviews) }
          : p
      );
      setProducts(updated);
      StorageManager.products.set(updated);
    } else {
      const newProduct = {
        ...formData,
        id: generateId(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
      };
      const updated = [...products, newProduct];
      setProducts(updated);
      StorageManager.products.set(updated);
    }

    setShowProductModal(false);
  };

  const deleteProduct = (id) => {
    if (confirm('Delete this product?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      StorageManager.products.set(updated);
    }
  };

  const saveDiscount = () => {
    if (!discountForm.code || !discountForm.percentage) {
      alert('Please fill required fields');
      return;
    }

    const newDiscount = {
      id: generateId(),
      ...discountForm,
      percentage: parseInt(discountForm.percentage),
    };

    const updated = [...discounts, newDiscount];
    setDiscounts(updated);
    StorageManager.discounts.set(updated);
    setShowDiscountModal(false);
    setDiscountForm({
      code: '',
      name: '',
      percentage: '',
      description: '',
      validUntil: '',
      active: true,
    });
  };

  const deleteDiscount = (id) => {
    if (confirm('Delete this discount?')) {
      const updated = discounts.filter((d) => d.id !== id);
      setDiscounts(updated);
      StorageManager.discounts.set(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-[#475569] sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚙️</div>
            <h1 className="text-2xl font-bold text-[#F1F5F9]">Admin Dashboard</h1>
          </div>
          <Button variant="secondary" size="md" icon={LogOut} onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'discounts', label: 'Discounts', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-300
                flex items-center gap-2
                ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-[#EC4899] to-[#F97316] text-white shadow-lg'
                    : 'bg-[#1E293B] text-[#CBD5E1] hover:bg-[#334155]'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: '💰', color: 'from-[#EC4899]' },
              { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'from-[#F97316]' },
              { label: 'Total Products', value: stats.totalProducts, icon: '🛍️', color: 'from-[#10B981]' },
              { label: 'Avg Order Value', value: formatPrice(stats.avgOrderValue), icon: '📈', color: 'from-[#3B82F6]' },
            ].map((stat, i) => (
              <Card key={i} className="text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <p className="text-[#CBD5E1] text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} to-[#F97316] bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#F1F5F9]">Products</h2>
              <Button icon={Plus} onClick={() => openProductModal()}>
                Add Product
              </Button>
            </div>

            <div className="space-y-3">
              {products.map((product) => (
                <Card key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{product.image}</div>
                    <div>
                      <h3 className="font-bold text-[#F1F5F9]">{product.name}</h3>
                      <p className="text-[#CBD5E1] text-sm">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 flex-wrap justify-end">
                    <div className="text-right">
                      <p className="text-[#94A3B8] text-sm">Price</p>
                      <p className="font-bold text-[#EC4899]">{formatPrice(product.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#94A3B8] text-sm">Stock</p>
                      <p className="font-bold text-[#F1F5F9]">{product.stock}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => openProductModal(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="text-[#EF4444]"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Premium Headphones"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price (₹)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="4999"
                  />
                  <Input
                    label="Stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Electronics"
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                  <Input
                    label="Reviews Count"
                    type="number"
                    value={formData.reviews}
                    onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Product Icon (emoji)</label>
                  <input
                    type="text"
                    maxLength="2"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-lg text-[#F1F5F9] text-3xl text-center focus:outline-none focus:border-[#EC4899]"
                  />
                </div>
                <Button className="w-full" onClick={saveProduct}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </Modal>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Recent Orders</h2>
            {orders.length === 0 ? (
              <EmptyState icon="📭" title="No orders yet" description="Orders will appear here when customers make purchases" />
            ) : (
              <div className="space-y-3 overflow-x-auto">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-[#94A3B8] text-sm">Order ID</p>
                        <p className="font-mono font-bold text-[#F1F5F9]">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8] text-sm">Customer</p>
                        <p className="font-bold text-[#F1F5F9]">{order.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8] text-sm">Amount</p>
                        <p className="font-bold text-[#EC4899]">{formatPrice(order.total)}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8] text-sm">Date</p>
                        <p className="font-bold text-[#F1F5F9]">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8] text-sm">Status</p>
                        <Badge variant="success" size="sm">
                          ✓ {order.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="border-t border-[#475569] pt-4">
                      <p className="text-[#CBD5E1] text-sm">Items: {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === 'discounts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#F1F5F9]">Discount Codes</h2>
              <Button icon={Plus} onClick={() => setShowDiscountModal(true)}>
                Add Discount
              </Button>
            </div>

            <div className="space-y-3">
              {discounts.map((discount) => (
                <Card key={discount.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#F1F5F9]">{discount.name}</h3>
                    <p className="text-[#CBD5E1] text-sm font-mono">{discount.code}</p>
                    <p className="text-[#94A3B8] text-sm">{discount.description}</p>
                  </div>
                  <div className="flex items-center gap-8 flex-wrap justify-end">
                    <div className="text-right">
                      <p className="text-[#94A3B8] text-sm">Discount</p>
                      <p className="font-bold text-[#EC4899]">{discount.percentage}% OFF</p>
                    </div>
                    <div>
                      <Badge variant={discount.active ? 'success' : 'warning'}>
                        {discount.active ? '✓ Active' : '⏰ Inactive'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-[#EF4444]"
                      onClick={() => deleteDiscount(discount.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Modal isOpen={showDiscountModal} onClose={() => setShowDiscountModal(false)} title="Add Discount Code">
              <div className="space-y-4">
                <Input
                  label="Code"
                  value={discountForm.code}
                  onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                  placeholder="DIWALI25"
                />
                <Input
                  label="Name"
                  value={discountForm.name}
                  onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                  placeholder="Diwali Special"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Discount %"
                    type="number"
                    min="0"
                    max="100"
                    value={discountForm.percentage}
                    onChange={(e) => setDiscountForm({ ...discountForm, percentage: e.target.value })}
                    placeholder="25"
                  />
                  <Input
                    label="Valid Until"
                    type="date"
                    value={discountForm.validUntil}
                    onChange={(e) => setDiscountForm({ ...discountForm, validUntil: e.target.value })}
                  />
                </div>
                <Input
                  label="Description"
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                  placeholder="Flat 25% off on all products"
                />
                <Button className="w-full" onClick={saveDiscount}>
                  Create Discount
                </Button>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== LOGIN PAGE ====================
const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 1000));

    if (password === 'admin123') {
      onLogin();
      setIsLoading(false);
    } else {
      setError('Invalid password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">Admin Access</h1>
          <p className="text-[#CBD5E1] mt-2">Enter password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className={`
                w-full pl-12 pr-12 py-3 bg-[#334155] border rounded-lg
                text-[#F1F5F9] placeholder-[#64748B]
                focus:outline-none focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/20
                transition-all duration-300
                ${error ? 'border-[#EF4444]' : 'border-[#475569]'}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444] rounded-lg p-3 flex items-center gap-2 text-[#EF4444]">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isLoading}
            icon={LogIn}
          >
            {isLoading ? 'Verifying...' : 'Access Dashboard'}
          </Button>

          <p className="text-center text-[#CBD5E1] text-sm">
            Demo password: <code className="bg-[#0F172A] px-2 py-1 rounded font-mono text-[#EC4899]">admin123</code>
          </p>
        </form>
      </Card>
    </div>
  );
};

// ==================== HOME PAGE ====================
const HomePage = ({ products, onAddToCart, cartCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    if (sortBy === 'price-low') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#EC4899] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F97316] rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#EC4899] via-[#F97316] to-[#EC4899] bg-clip-text text-transparent">
                Premium Tech Store
              </span>
            </h1>
            <p className="text-[#CBD5E1] text-lg md:text-xl max-w-2xl mx-auto">
              Discover cutting-edge technology and premium accessories at unbeatable prices.
              Free shipping on all orders.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-[#1E293B] border-2 border-[#EC4899]/30 rounded-xl
                  text-[#F1F5F9] placeholder-[#64748B] text-lg
                  focus:outline-none focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/20
                  transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-4 py-2 rounded-lg font-semibold transition-all duration-300
                  ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#EC4899] to-[#F97316] text-white shadow-lg'
                      : 'bg-[#1E293B] text-[#CBD5E1] hover:bg-[#334155]'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#94A3B8]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-[#1E293B] border border-[#475569] rounded-lg
                text-[#F1F5F9] focus:outline-none focus:border-[#EC4899]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
            </select>

            <div className="flex border border-[#475569] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#EC4899] text-white' : 'bg-[#1E293B] text-[#CBD5E1]'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#EC4899] text-white' : 'bg-[#1E293B] text-[#CBD5E1]'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        <ProductGrid products={filteredProducts} onAddToCart={onAddToCart} viewMode={viewMode} />
      </div>
    </div>
  );
};

// ==================== HEADER COMPONENT ====================
const Header = ({ cartCount, currentPage, onNavigate, onLogout, isAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b border-[#475569]/30 backdrop-blur animate-slideInDown">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-2xl font-bold hover:scale-110 transition-all hover:rotate-6"
        >
          <span className="text-3xl animate-float">⚡</span>
          <span className="bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
            TechHub
          </span>
        </button>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onNavigate('home')}
            className={`nav-item font-semibold transition-all duration-300 ${
              currentPage === 'home'
                ? 'text-[#EC4899] animate-glow'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className={`nav-item font-semibold transition-all duration-300 ${
              currentPage === 'orders'
                ? 'text-[#EC4899] animate-glow'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Orders
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`nav-item font-semibold transition-all duration-300 ${
                currentPage === 'admin'
                  ? 'text-[#EC4899] animate-glow'
                  : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
              }`}
            >
              Admin
            </button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('cart')}
            className="relative p-3 rounded-lg hover:bg-[#334155] transition-colors group"
          >
            <ShoppingCart className="group-hover:text-[#EC4899] transition-colors" size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#EC4899] to-[#F97316] text-white
                px-2.5 py-0.5 rounded-full text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              icon={LogOut}
              onClick={onLogout}
              className="hidden md:flex"
            >
              Logout
            </Button>
          )}

          {/* Mobile Menu Button - Animated Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-lg hover:bg-[#334155] transition-all group"
          >
            <div className={`flex flex-col gap-1.5 w-6 h-5 ${mobileMenuOpen ? 'animate-hamburgerOpen' : ''}`}>
              <span className={`line-top h-0.5 w-full bg-[#F1F5F9] origin-left transition-all duration-300 ${mobileMenuOpen ? 'bg-[#EC4899]' : ''}`}></span>
              <span className={`line-mid h-0.5 w-full bg-[#F1F5F9] transition-all duration-300 ${mobileMenuOpen ? 'bg-[#EC4899] opacity-0' : ''}`}></span>
              <span className={`line-bot h-0.5 w-full bg-[#F1F5F9] origin-left transition-all duration-300 ${mobileMenuOpen ? 'bg-[#EC4899]' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide In Animation */}
      {mobileMenuOpen && (
        <div className={`md:hidden bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-t border-[#475569] p-4 space-y-2 animate-mobileMenuOpen`}>
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#334155] text-[#CBD5E1] hover:text-[#EC4899] transition-all animate-navItemSlide hover:pl-6"
          >
            🏪 Shop
          </button>
          <button
            onClick={() => {
              onNavigate('orders');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#334155] text-[#CBD5E1] hover:text-[#EC4899] transition-all animate-navItemSlide hover:pl-6"
            style={{ animationDelay: '0.1s' }}
          >
            📦 Orders
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#334155] text-[#CBD5E1] hover:text-[#EC4899] transition-all animate-navItemSlide hover:pl-6"
                style={{ animationDelay: '0.2s' }}
              >
                ⚙️ Admin Dashboard
              </button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full animate-navItemSlide"
                style={{ animationDelay: '0.3s' }}
                onClick={onLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

// ==================== ORDERS PAGE ====================
const OrdersPage = () => {
  const [orders, setOrders] = useState(() => StorageManager.orders.get());
  const [filter, setFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  if (filteredOrders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          icon="📋"
          title="No orders yet"
          description="Start shopping to see your orders here"
          action={[
            <Button key="shop" onClick={() => window.location.hash = '#home'}>
              Shop Now
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
        My Orders
      </h1>

      <div className="flex gap-3 mb-8 flex-wrap">
        {['all', 'pending', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all duration-300 capitalize
              ${
                filter === status
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#F97316] text-white'
                  : 'bg-[#1E293B] text-[#CBD5E1] hover:bg-[#334155]'
              }
            `}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-[#94A3B8] text-sm">Order ID</p>
                <p className="font-mono font-bold text-[#F1F5F9]">{order.id}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm">Date</p>
                <p className="font-bold text-[#F1F5F9]">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm">Items</p>
                <p className="font-bold text-[#F1F5F9]">{order.items.length} items</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm">Total</p>
                <p className="font-bold text-[#EC4899]">{formatPrice(order.total)}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm">Status</p>
                <Badge variant="success" size="sm">
                  ✓ {order.status}
                </Badge>
              </div>
            </div>

            <div className="border-t border-[#475569] pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[#CBD5E1] text-sm mb-2">
                    <strong>Items:</strong> {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-[#CBD5E1] text-sm">
                    <strong>Shipping:</strong> {order.customer.address}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
export default function EcommerceApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState(() => StorageManager.cart.get());
  const [products, setProducts] = useState(() => StorageManager.products.get());
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      let updated;

      if (existing) {
        updated = prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [...prevCart, { ...product, quantity: 1 }];
      }

      StorageManager.cart.set(updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.id !== productId);
      StorageManager.cart.set(updated);
      return updated;
    });
  }, []);

  const updateCartQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const updated = prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      StorageManager.cart.set(updated);
      return updated;
    });
  }, [removeFromCart]);

  const handleCheckout = (data) => {
    setCheckoutData(data);
    setCurrentPage('checkout');
  };

  const handleOrder = (order) => {
    StorageManager.orders.get().push(order);
    StorageManager.orders.set([...StorageManager.orders.get(), order]);
    StorageManager.cart.clear();
    setCart([]);
    setSuccessOrder(order);
    setCurrentPage('success');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setShowLoginModal(false);
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentPage('home');
  };

  const navigateTo = (page) => {
    if (page === 'admin' && !isAdmin) {
      setShowLoginModal(true);
      return;
    }
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9]" style={{ fontFamily: DESIGN_TOKENS.fonts.body }}>
      <Header
        cartCount={cart.length}
        currentPage={currentPage}
        onNavigate={navigateTo}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      <main>
        {currentPage === 'home' && (
          <HomePage products={products} onAddToCart={addToCart} cartCount={cart.length} />
        )}
        {currentPage === 'cart' && (
          <ShoppingCartPage
            cart={cart}
            onRemove={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onCheckout={handleCheckout}
          />
        )}
        {currentPage === 'checkout' && (
          <CheckoutPage
            cart={cart}
            onOrder={handleOrder}
            {...checkoutData}
          />
        )}
        {currentPage === 'success' && successOrder && (
          <OrderSuccessPage order={successOrder} />
        )}
        {currentPage === 'orders' && <OrdersPage />}
        {currentPage === 'admin' && isAdmin && (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </main>

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="">
        <LoginPage onLogin={handleAdminLogin} />
      </Modal>

      {/* Footer */}
      <footer className="border-t border-[#475569] bg-[#0F172A] mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-[#F1F5F9] mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> TechHub
              </h3>
              <p className="text-[#CBD5E1] text-sm">Premium tech store with the best products and prices.</p>
            </div>
            <div>
              <p className="font-bold text-[#F1F5F9] mb-4">Quick Links</p>
              <ul className="space-y-2 text-[#CBD5E1] text-sm">
                <li><button onClick={() => navigateTo('home')} className="hover:text-[#EC4899]">Shop</button></li>
                <li><button onClick={() => navigateTo('orders')} className="hover:text-[#EC4899]">Orders</button></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-[#F1F5F9] mb-4">Support</p>
              <ul className="space-y-2 text-[#CBD5E1] text-sm">
                <li><a href="#" className="hover:text-[#EC4899]">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#EC4899]">Returns</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-[#F1F5F9] mb-4">Info</p>
              <ul className="space-y-2 text-[#CBD5E1] text-sm">
                <li><a href="#" className="hover:text-[#EC4899]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#EC4899]">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#475569] pt-8 text-center text-[#94A3B8] text-sm">
            <p>&copy; 2024 TechHub. All rights reserved. Built with ⚡ for premium shopping.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
