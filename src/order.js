class Order {
  constructor(customer) {
    this.customer = customer;
    this.items = [];
    this.coupon = null;
    this.shipping = 0;
    this.status = "pending";
    this.payment = null;
  }

  addItem(product, quantity = 1) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const existing = this.items.find(item => item.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }

    return this;
  }

  removeItem(productId) {
    this.items = this.items.filter(
      item => item.product.id !== productId
    );

    return this;
  }

  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    const item = this.items.find(
      item => item.product.id === productId
    );

    if (!item) {
      throw new Error("Product not found");
    }

    item.quantity = quantity;
    return this;
  }

  getItemCount() {
    return this.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  getSubtotal() {
    return this.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  applyCoupon(coupon) {
    if (!coupon || !coupon.code) {
      throw new Error("Invalid coupon");
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new Error("Coupon expired");
    }

    this.coupon = coupon;
    return this;
  }

  removeCoupon() {
    this.coupon = null;
    return this;
  }

  getDiscount() {
    if (!this.coupon) {
      return 0;
    }

    const subtotal = this.getSubtotal();

    if (this.coupon.type === "percentage") {
      return subtotal * (this.coupon.value / 100);
    }

    if (this.coupon.type === "fixed") {
      return Math.min(this.coupon.value, subtotal);
    }

    throw new Error("Unknown coupon type");
  }

  setShipping(value) {
    if (value < 0) {
      throw new Error("Shipping cannot be negative");
    }

    this.shipping = value;
    return this;
  }

  getTax(rate = 0.1) {
    const taxableAmount = this.getSubtotal() - this.getDiscount();

    return taxableAmount * rate;
  }

  getTotal(taxRate = 0.1) {
    return (
      this.getSubtotal() -
      this.getDiscount() +
      this.getTax(taxRate) +
      this.shipping
    );
  }

  isEmpty() {
    return this.items.length === 0;
  }

  hasProduct(productId) {
    return this.items.some(
      item => item.product.id === productId
    );
  }

  getProduct(productId) {
    const item = this.items.find(
      item => item.product.id === productId
    );

    return item?.product ?? null;
  }

  canCheckout() {
    return (
      !this.isEmpty() &&
      this.status === "pending" &&
      this.getTotal() > 0
    );
  }

  checkout(payment) {
    if (!this.canCheckout()) {
      throw new Error("Order cannot be checked out");
    }

    if (!payment || !payment.method) {
      throw new Error("Payment is required");
    }

    this.payment = payment;
    this.status = "paid";

    return this;
  }

  cancel() {
    if (this.status === "paid") {
      throw new Error("Paid order cannot be cancelled");
    }

    this.status = "cancelled";

    return this;
  }

  isPaid() {
    return this.status === "paid";
  }

  isCancelled() {
    return this.status === "cancelled";
  }

  getSummary() {
    return {
      customer: this.customer,
      items: this.getItemCount(),
      subtotal: this.getSubtotal(),
      discount: this.getDiscount(),
      shipping: this.shipping,
      tax: this.getTax(),
      total: this.getTotal(),
      status: this.status
    };
  }
}

module.exports = Order;
