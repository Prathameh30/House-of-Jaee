// src/pages/CheckoutPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiSmartphone, FiCreditCard, FiTruck } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { orderService } from "../services/orderService";
import { formatPrice } from "../utils/format";
import Button from "../components/common/Button";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Bihar",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Other",
];

const PAYMENT_METHODS = [
  {
    value: "UPI",
    label: "UPI",
    icon: FiSmartphone,
    desc: "Pay via Google Pay, PhonePe, Paytm, etc.",
  },
  {
    value: "Credit Card",
    label: "Credit Card",
    icon: FiCreditCard,
    desc: "Visa, MasterCard, RuPay accepted",
  },
];

export default function CheckoutPage() {
  const { items, subtotal, deliveryCharge, total, clearCart } = useCart();
  const { customer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: customer?.name || "",
    mobileNumber: customer?.mobileNumber || "",
    email: customer?.email || "",
    addressLine: "",
    city: "",
    state: "",
    pinCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-brown mb-2">
          Your cart is empty
        </h1>
        <p className="text-brown-light mb-6">
          Add some sarees before checking out.
        </p>
        <Link to="/shop">
          <Button size="lg">Shop Now</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = "Full name is required.";
    if (!/^[6-9]\d{9}$/.test(form.mobileNumber.trim()))
      errs.mobileNumber = "Enter a valid 10-digit mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address.";
    if (!form.addressLine.trim())
      errs.addressLine = "Delivery address is required.";
    if (!form.city.trim()) errs.city = "City is required.";
    if (!form.state) errs.state = "State is required.";
    if (!/^\d{6}$/.test(form.pinCode.trim()))
      errs.pinCode = "Enter a valid 6-digit PIN code.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      ...form,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      paymentMethod,
    };

    if (paymentMethod === "Cash on Delivery") {
      setSubmitting(true);
      try {
        const res = await orderService.checkout(payload);
        clearCart();
        navigate(`/order-confirmation/${res.data.order.order_number}`);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!window.Razorpay) {
      showToast(
        "Razorpay checkout is unavailable right now. Please refresh and try again.",
        "error",
      );
      return;
    }

    setSubmitting(true);

    try {
      const createRes = await orderService.createRazorpayOrder(payload);
      const { order_id, amount, currency, key, orderNumber } =
        createRes.data.razorpay;

      const options = {
        key,
        amount,
        currency,
        name: "House of Jaee",
        description: "Order Payment",
        image: "https://razorpay.com/assets/razorpay-logo.svg",
        order_id,
        handler: async function (response) {
          try {
            await orderService.verifyRazorpayPayment({
              orderNumber,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            clearCart();
            showToast(
              "Payment successful! Your order is confirmed.",
              "success",
            );
            navigate(
              `/order-confirmation/${createRes.data.order.order_number}`,
            );
          } catch (err) {
            showToast(err.message || "Payment verification failed.", "error");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: form.customerName,
          email: form.email,
          contact: form.mobileNumber,
        },
        theme: {
          color: "#7A2331",
        },
        modal: {
          ondismiss: async function () {
            try {
              await orderService.failRazorpayPayment({
                orderNumber,
                reason: "Payment cancelled by user.",
              });
            } catch (error) {
              console.error("Failed to record cancelled payment:", error);
            } finally {
              showToast("Payment cancelled by user.", "info");
              setSubmitting(false);
            }
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", async function (response) {
        try {
          await orderService.failRazorpayPayment({
            orderNumber,
            reason:
              response.error?.description ||
              response.error?.reason ||
              "Payment failed. Please try again.",
            razorpay_order_id: response.error?.metadata?.order_id,
            razorpay_payment_id: response.error?.metadata?.payment_id,
          });
        } catch (error) {
          console.error("Failed to record failed payment:", error);
        } finally {
          showToast(
            response.error?.description || "Payment failed. Please try again.",
            "error",
          );
          setSubmitting(false);
        }
      });
      razorpayInstance.open();
    } catch (err) {
      showToast(err.message || "Unable to initiate payment.", "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <h1 className="font-display text-3xl text-maroon mb-8">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-[1fr_360px] gap-10"
      >
        <div className="flex flex-col gap-8">
          <section className="bg-white border border-beige-dark rounded-sm p-6">
            <h2 className="font-display text-xl text-brown mb-5">
              Delivery Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.customerName}>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={handleChange("customerName")}
                  className="input-field"
                  placeholder="e.g. Priya Sharma"
                />
              </Field>
              <Field label="Mobile Number" error={errors.mobileNumber}>
                <input
                  type="tel"
                  value={form.mobileNumber}
                  onChange={handleChange("mobileNumber")}
                  className="input-field"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </Field>
              <Field
                label="Email Address"
                error={errors.email}
                className="md:col-span-2"
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </Field>
              <Field
                label="Delivery Address"
                error={errors.addressLine}
                className="md:col-span-2"
              >
                <textarea
                  value={form.addressLine}
                  onChange={handleChange("addressLine")}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="House/Flat No., Street, Landmark"
                />
              </Field>
              <Field label="City" error={errors.city}>
                <input
                  type="text"
                  value={form.city}
                  onChange={handleChange("city")}
                  className="input-field"
                  placeholder="e.g. Mumbai"
                />
              </Field>
              <Field label="State" error={errors.state}>
                <select
                  value={form.state}
                  onChange={handleChange("state")}
                  className="input-field"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="PIN Code" error={errors.pinCode}>
                <input
                  type="text"
                  value={form.pinCode}
                  onChange={handleChange("pinCode")}
                  className="input-field"
                  placeholder="6-digit PIN code"
                  maxLength={6}
                />
              </Field>
            </div>
          </section>

          <section className="bg-white border border-beige-dark rounded-sm p-6">
            <h2 className="font-display text-xl text-brown mb-5">
              Payment Method
            </h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon, desc }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 border rounded-sm p-4 cursor-pointer transition-colors ${
                    paymentMethod === value
                      ? "border-maroon bg-maroon/5"
                      : "border-beige-dark hover:bg-beige/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="accent-maroon"
                  />
                  <Icon size={20} className="text-maroon" />
                  <div>
                    <p className="text-sm font-medium text-brown">{label}</p>
                    <p className="text-xs text-brown-light">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-brown-light mt-4">
              Use Razorpay checkout for UPI or card payments. Cash on delivery
              remains available as a standard checkout option.
            </p>
          </section>
        </div>

        <div className="bg-white border border-beige-dark rounded-sm p-6 h-fit sticky top-24">
          <h2 className="font-display text-xl text-brown mb-5">
            Order Summary
          </h2>
          <div className="flex flex-col gap-3 mb-5 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span className="text-brown-light">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-brown font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 text-sm border-t border-beige-dark pt-4">
            <div className="flex justify-between text-brown-light">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brown-light">
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-brown text-base border-t border-beige-dark pt-3">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full mt-6"
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, error, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-brown mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}
