"use client";

import React, { useState } from "react";
import styles from "./GetCallPage.module.css";

const countries = [{ code: "+91", name: "India (IN)" }];

interface FormData {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  companyName: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
}

export default function GetCallPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    countryCode: "+91",
    phone: "",
    companyName: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{7,15}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = "Required";
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = "Required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please provide some requirements";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className={styles.successTitle}>Request Submitted</h2>
          <p className={styles.successText}>
            Thank you, {formData.fullName}. We&apos;ve received your request for
            a callback on <strong>{formData.preferredDate}</strong> at{" "}
            <strong>{formData.preferredTime}</strong>. Our team will contact you
            at {formData.countryCode} {formData.phone} shortly.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                fullName: "",
                email: "",
                countryCode: "+91",
                phone: "",
                companyName: "",
                preferredDate: "",
                preferredTime: "",
                message: "",
              });
            }}
            className={styles.backButton}
          >
            New Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Get a Call</h1>
        <p className={styles.subtitle}>
          Schedule a professional consultation with our trading experts. Provide
          your details and preferred callback time below.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.formWrapper}>
        <div className={styles.formGrid}>
          {/* Row 1: Identity */}
          <div className={styles.fieldGroup}>
            <label htmlFor="fullName" className={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Alexander Pierce"
              className={`${styles.input} ${errors.fullName ? styles.error : ""}`}
            />
            {errors.fullName && (
              <span className={styles.errorMessage}>{errors.fullName}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex@company.com"
              className={`${styles.input} ${errors.email ? styles.error : ""}`}
            />
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          {/* Row 2: Phone & Company */}
          <div className={styles.fieldGroup}>
            <label htmlFor="phone" className={styles.label}>
              Phone Number
            </label>
            <div className={styles.phoneInputWrapper}>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className={styles.countrySelector}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="00000 00000"
                className={`${styles.input} ${errors.phone ? styles.error : ""}`}
              />
            </div>
            {errors.phone && (
              <span className={styles.errorMessage}>{errors.phone}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="companyName" className={styles.label}>
              Company Name (Optional)
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. ViewMarket Technologies"
              className={styles.input}
            />
          </div>

          {/* Row 3: Preferred Schedule */}
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Preferred Callback Time</label>
            <div className={styles.dateTimeGrid}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`${styles.input} ${errors.preferredDate ? styles.error : ""}`}
                />
                {errors.preferredDate && (
                  <span className={styles.errorMessage}>
                    {errors.preferredDate}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.preferredTime ? styles.error : ""}`}
                />
                {errors.preferredTime && (
                  <span className={styles.errorMessage}>
                    {errors.preferredTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Message */}
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label htmlFor="message" className={styles.label}>
              Message / Requirements
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Please describe your interest or specific requirements..."
              className={`${styles.textarea} ${errors.message ? styles.error : ""}`}
            />
            {errors.message && (
              <span className={styles.errorMessage}>{errors.message}</span>
            )}
          </div>
        </div>

        <div className={styles.formFooter}>
          <div className={styles.microcopy}>
            <span className={styles.dot} />
            Support Hours: 09:00 - 18:00 (UTC)
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                Schedule Callback
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
