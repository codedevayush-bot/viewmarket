'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './RaiseTicket.module.css';

export default function RaiseTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const invalidFile = selectedFiles.find((f) => f.size > 5 * 1024 * 1024);
      if (invalidFile) {
        setError(`File ${invalidFile.name} exceeds 5MB limit`);
        return;
      }
      setError('');
      setFiles((prev) => [...prev, ...selectedFiles]);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const attachments = [];

      for (const file of files) {
        const presignedRes = await fetch('/api/tickets/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!presignedRes.ok)
          throw new Error(`Failed to initialize upload for ${file.name}`);
        const { signedUrl, fileUrl, fileKey } = await presignedRes.json();

        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        if (!uploadRes.ok) throw new Error(`Failed to upload ${file.name}`);

        attachments.push({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl,
          fileKey,
        });
      }

      // 3. Create Ticket
      const ticketRes = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          attachments,
        }),
      });

      if (!ticketRes.ok) throw new Error('Failed to create ticket');

      const { id } = await ticketRes.json();
      router.push(`/user-dashboard/support/my-tickets/${id}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Raise a Ticket</h1>
        <p className={styles.description}>
          Submit a support request and our team will get back to you shortly.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Subject</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your issue"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="General">General Inquiry</option>
            <option value="Technical">Technical Support</option>
            <option value="Billing">Billing & Subscriptions</option>
            <option value="Broker">Broker Integration</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide as much detail as possible..."
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Attachments (Optional, Max 5MB each)
          </label>
          <input
            type="file"
            className={styles.fileInput}
            accept="image/jpeg,image/png,application/pdf"
            multiple
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <div className={styles.filePreviews}>
              {files.map((f, i) => (
                <div key={i} className={styles.filePreviewItem}>
                  <span>📎 {f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className={styles.removeFileBtn}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}
