// ==================== MODULAR COMPONENT EXAMPLES ====================
// These can be split into separate files for a more scalable architecture

// ==================== COMMON COMPONENTS ====================

// components/common/Button.jsx
import React from 'react';

const DESIGN_TOKENS = {
  colors: {
    secondary: '#EC4899',
    accent: '#F97316',
    bg: {
      secondary: '#1E293B',
    },
    text: {
      primary: '#F1F5F9',
    },
    border: '#475569',
  },
};

export const Button = ({ 
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
  const baseStyles = `
    font-semibold rounded-lg transition-all duration-300 cursor-pointer
    flex items-center justify-center gap-2 whitespace-nowrap
    hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `bg-gradient-to-r from-[#EC4899] to-[#F97316] text-white shadow-lg hover:shadow-xl`,
    secondary: `bg-[#1E293B] text-[#F1F5F9] border border-[#475569] hover:border-[#EC4899]`,
    outline: `border-2 border-[#EC4899] text-[#EC4899] hover:bg-[#EC4899] hover:text-white`,
    ghost: `text-[#F1F5F9] hover:bg-[#1E293B]`,
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '⏳' : Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

// components/common/Card.jsx
export const Card = ({ children, className = '', hover = true }) => (
  <div
    className={`
      bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6
      border border-[#475569]/30 backdrop-blur-sm
      ${hover ? 'hover:border-[#EC4899]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#EC4899]/10' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// components/common/Input.jsx
export const Input = ({ label, error, icon: Icon, ...props }) => (
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

// components/common/Badge.jsx
export const Badge = ({ children, variant = 'default', size = 'md' }) => {
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

// components/common/Modal.jsx
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className={`${sizes[size]} max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#F1F5F9]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
};

// components/common/EmptyState.jsx
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="text-6xl mb-4 opacity-50">{icon}</div>
    <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">{title}</h3>
    <p className="text-[#CBD5E1] mb-6 text-center max-w-sm">{description}</p>
    {action && <div className="flex gap-3">{action}</div>}
  </div>
);

// components/common/LoadingSpinner.jsx
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-16 h-16 border-4 border-[#EC4899]/20 border-t-[#EC4899] rounded-full animate-spin"></div>
  </div>
);

// ==================== PRODUCT COMPONENTS ====================

// components/product/ProductCard.jsx
export const ProductCard = ({ product, onAddToCart, isListView = false }) => {
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 300));
    onAddToCart(product);
    setIsAdding(false);
  };

  if (isListView) {
    return (
      <Card className="flex items-start gap-6 hover:shadow-lg">
        <div className="text-6xl flex-shrink-0">{product.image}</div>
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
              ₹{product.price.toLocaleString('en-IN')}
            </p>
            <Button loading={isAdding} onClick={handleAdd} size="md">
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex flex-col h-full hover:shadow-2xl hover:shadow-[#EC4899]/20 group overflow-hidden"
      hover
    >
      <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
        {product.image}
      </div>
      <h3 className="font-bold text-[#F1F5F9] mb-2 line-clamp-2">{product.name}</h3>
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
      <p className="text-2xl font-bold bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent my-4">
        ₹{product.price.toLocaleString('en-IN')}
      </p>
      <Button
        loading={isAdding}
        onClick={handleAdd}
        size="md"
        className="w-full"
        disabled={product.stock === 0}
      >
        Add to Cart
      </Button>
    </Card>
  );
};

// components/product/ProductGrid.jsx
export const ProductGrid = ({ products, onAddToCart, viewMode = 'grid' }) => {
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

// components/product/ProductFilters.jsx
export const ProductFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
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
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
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
            onClick={() => onViewModeChange('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#EC4899] text-white' : 'bg-[#1E293B] text-[#CBD5E1]'}`}
          >
            ⊞
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#EC4899] text-white' : 'bg-[#1E293B] text-[#CBD5E1]'}`}
          >
            ☰
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== CART COMPONENTS ====================

// components/cart/CartItem.jsx
export const CartItem = ({ item, onRemove, onUpdateQuantity }) => (
  <Card className="flex items-center gap-6 hover:shadow-lg">
    <div className="text-4xl">{item.image}</div>
    <div className="flex-1">
      <h3 className="font-bold text-[#F1F5F9] mb-1">{item.name}</h3>
      <p className="text-[#CBD5E1] text-sm mb-3">₹{item.price.toLocaleString('en-IN')}</p>
    </div>
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
      >
        −
      </Button>
      <span className="w-8 text-center font-bold text-[#F1F5F9]">
        {item.quantity}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
      >
        +
      </Button>
    </div>
    <p className="font-bold text-[#EC4899] text-lg w-24 text-right">
      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
    </p>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onRemove(item.id)}
      className="text-[#EF4444] hover:text-[#EF4444]"
    >
      🗑️
    </Button>
  </Card>
);

// components/cart/OrderSummary.jsx
export const OrderSummary = ({ 
  subtotal, 
  discount = 0, 
  total,
  appliedDiscount,
  onRemoveDiscount,
  onApplyPromo,
  promoCode,
  onPromoChange,
  showPromoError,
  onCheckout,
}) => (
  <Card className="sticky top-24">
    <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Order Summary</h2>

    <div className="space-y-3 mb-6 pb-6 border-b border-[#475569]">
      <div className="flex justify-between text-[#CBD5E1]">
        <span>Subtotal</span>
        <span>₹{subtotal.toLocaleString('en-IN')}</span>
      </div>
      {appliedDiscount && (
        <div className="flex justify-between text-[#10B981]">
          <div className="flex items-center gap-2">
            <span>Discount ({appliedDiscount.code})</span>
            <button
              onClick={onRemoveDiscount}
              className="text-xs text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              ✕
            </button>
          </div>
          <span>-₹{discount.toLocaleString('en-IN')}</span>
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
          ₹{total.toLocaleString('en-IN')}
        </span>
      </div>
    </div>

    {!appliedDiscount && (
      <div className="mb-6">
        <p className="text-sm text-[#CBD5E1] mb-3">Have a discount code?</p>
        <div className="flex gap-2">
          <Input
            value={promoCode}
            onChange={(e) => onPromoChange(e.target.value)}
            placeholder="Enter code"
            error={showPromoError}
          />
          <Button
            variant="secondary"
            size="md"
            onClick={onApplyPromo}
          >
            Apply
          </Button>
        </div>
      </div>
    )}

    <Button
      className="w-full mb-3"
      size="lg"
      onClick={onCheckout}
    >
      Proceed to Checkout
    </Button>
  </Card>
);

// ==================== FORM COMPONENTS ====================

// components/forms/ShippingForm.jsx
export const ShippingForm = ({ formData, setFormData, errors }) => (
  <Card>
    <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Shipping Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="John Doe"
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
);

// components/forms/PaymentForm.jsx
export const PaymentForm = ({ formData, setFormData, errors }) => (
  <Card>
    <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">💳 Payment Information</h2>
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
);

// ==================== ADMIN COMPONENTS ====================

// components/admin/StatsCard.jsx
export const StatsCard = ({ label, value, icon, color }) => (
  <Card className="text-center">
    <div className="text-4xl mb-3">{icon}</div>
    <p className="text-[#CBD5E1] text-sm mb-2">{label}</p>
    <p className={`text-3xl font-bold bg-gradient-to-r ${color} to-[#F97316] bg-clip-text text-transparent`}>
      {value}
    </p>
  </Card>
);

// components/admin/ProductRow.jsx
export const ProductRow = ({ product, onEdit, onDelete }) => (
  <Card className="flex items-center justify-between">
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
        <p className="font-bold text-[#EC4899]">₹{product.price.toLocaleString('en-IN')}</p>
      </div>
      <div className="text-right">
        <p className="text-[#94A3B8] text-sm">Stock</p>
        <p className="font-bold text-[#F1F5F9]">{product.stock}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(product)}
        >
          ✎ Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#EF4444]"
          onClick={() => onDelete(product.id)}
        >
          🗑️ Delete
        </Button>
      </div>
    </div>
  </Card>
);

// ==================== LAYOUT COMPONENTS ====================

// components/layout/Header.jsx
export const Header = ({ cartCount, currentPage, onNavigate, onLogout, isAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b border-[#475569]/30 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-2xl font-bold hover:scale-110 transition-transform"
        >
          <span className="text-3xl">⚡</span>
          <span className="bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
            TechHub
          </span>
        </button>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink active={currentPage === 'home'} onClick={() => onNavigate('home')}>
            Shop
          </NavLink>
          <NavLink active={currentPage === 'orders'} onClick={() => onNavigate('orders')}>
            Orders
          </NavLink>
          {isAdmin && (
            <NavLink active={currentPage === 'admin'} onClick={() => onNavigate('admin')}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <CartButton cartCount={cartCount} onClick={() => onNavigate('cart')} />
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onLogout}
              className="hidden md:flex"
            >
              Logout
            </Button>
          )}
          <MobileMenuButton />
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`font-semibold transition-colors ${
      active
        ? 'text-[#EC4899]'
        : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
    }`}
  >
    {children}
  </button>
);

const CartButton = ({ cartCount, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-3 rounded-lg hover:bg-[#334155] transition-colors group"
  >
    <span className="text-2xl">🛒</span>
    {cartCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#EC4899] to-[#F97316] text-white
        px-2.5 py-0.5 rounded-full text-xs font-bold">
        {cartCount}
      </span>
    )}
  </button>
);

const MobileMenuButton = () => (
  <button className="md:hidden p-3 rounded-lg hover:bg-[#334155] transition-colors">
    ☰
  </button>
);

// components/layout/Footer.jsx
export const Footer = ({ onNavigate }) => (
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
            <li><button onClick={() => onNavigate('home')} className="hover:text-[#EC4899]">Shop</button></li>
            <li><button onClick={() => onNavigate('orders')} className="hover:text-[#EC4899]">Orders</button></li>
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
);

// ==================== EXPORT ALL COMPONENTS ====================
export {
  Button,
  Card,
  Input,
  Badge,
  Modal,
  EmptyState,
  LoadingSpinner,
  ProductCard,
  ProductGrid,
  ProductFilters,
  CartItem,
  OrderSummary,
  ShippingForm,
  PaymentForm,
  StatsCard,
  ProductRow,
  Header,
  Footer,
};
