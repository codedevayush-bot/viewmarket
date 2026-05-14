'use client';

import { useState } from 'react';
import styles from './Broker.module.css';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  description?: string;
}

interface BrokerModalProps {
  broker: {
    id: string;
    name: string;
    display_name?: string;
    form_schema: string | unknown;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function BrokerModal({
  broker,
  onClose,
  onSuccess,
}: BrokerModalProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle both array and object { fields: [...] } schema
  const rawSchema =
    typeof broker.form_schema === 'string'
      ? JSON.parse(broker.form_schema)
      : broker.form_schema || {};

  const formFields: FormField[] = Array.isArray(rawSchema)
    ? rawSchema
    : rawSchema.fields || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find the account_id from common field names if not explicitly provided
      const accountId =
        formData.account_id ||
        formData.client_id ||
        formData.client_code ||
        formData.user_id ||
        formData.ucc ||
        formData.login_id ||
        formData.api_key ||
        formData.phone; // Added phone as identifier for Nubra

      if (!accountId) {
        throw new Error(
          'Could not determine Account ID from provided fields. Please ensure identifying fields are filled.'
        );
      }

      const payload = {
        broker_id: broker.id,
        account_id: accountId,
        credentials: { ...formData },
      };

      const res = await fetch('/api/user/brokers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect broker');
      }

      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header / Drag Handle Style */}
        <div className={styles.dragHandle}>
          <h2 className={styles.heading}>Connect Broker</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.brokerInfo}>
            <div className={styles.brokerLogo}>
              {broker.name?.[0]?.toUpperCase()}
            </div>
            <div className={styles.brokerText}>
              <h3>{broker.display_name || broker.name}</h3>
              <p>Enter your account credentials to authorize connectivity.</p>
            </div>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form
            id="broker-connect-form"
            onSubmit={handleSubmit}
            className={styles.modalForm}
          >
            {formFields.map((field) => (
              <div
                key={field.name}
                className={`${styles.formGroup} ${field.type === 'checkbox' ? styles.checkboxGroup : ''}`}
              >
                {field.type === 'checkbox' ? (
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      id={field.name}
                      name={field.name}
                      checked={!!formData[field.name]}
                      onChange={handleChange}
                      className={styles.checkboxInput}
                    />
                    <div className={styles.checkboxLabelWrapper}>
                      <label
                        htmlFor={field.name}
                        className={styles.checkboxLabel}
                      >
                        {field.label}
                      </label>
                      {field.description && (
                        <p className={styles.fieldDescription}>
                          {field.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <label htmlFor={field.name}>{field.label}</label>
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      placeholder={
                        field.placeholder || `Your ${field.label.toLowerCase()}`
                      }
                      value={(formData[field.name] as string) || ''}
                      onChange={handleChange}
                      className={styles.inputField}
                    />
                    {field.description && (
                      <p className={styles.fieldDescription}>
                        {field.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </form>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.securityNotice}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Secured via AES-256 Encryption</span>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="broker-connect-form"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
