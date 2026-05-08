"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import styles from "./TicketDetail.module.css";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load");
    return res.json();
  });

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
}

interface Message {
  id: string;
  message: string;
  sender_role: string;
  created_at: string;
  attachments?: Attachment[];
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  category: string;
  created_at: string;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const {
    data: ticketData,
    error,
    isLoading,
    mutate,
  } = useSWR<{ ticket: Ticket; messages: Message[] }>(
    `/api/tickets/${id}`,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds for chat updates
    },
  );

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const getStatusClass = (status: string) => {
    switch (status) {
      case "open":
        return styles.statusOpen;
      case "in_progress":
        return styles.statusInProgress;
      case "resolved":
        return styles.statusResolved;
      case "closed":
        return styles.statusClosed;
      default:
        return styles.statusOpen;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const invalidFile = selectedFiles.find((f) => f.size > 5 * 1024 * 1024);

      if (invalidFile) {
        setUploadError(`File ${invalidFile.name} exceeds 5MB limit`);
        return;
      }

      setUploadError("");
      setFiles((prev) => [...prev, ...selectedFiles]);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;

    setIsSubmitting(true);
    setUploadError("");

    try {
      const attachments = [];

      for (const file of files) {
        const presignedRes = await fetch("/api/tickets/presigned-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
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

      const res = await fetch(`/api/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          attachments,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setMessage("");
      setFiles([]);
      mutate(); // Immediately re-fetch messages
    } catch (err) {
      console.error(err);
      setUploadError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error)
    return <div className={styles.container}>Failed to load ticket.</div>;
  if (isLoading || !ticketData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Opening your ticket...</span>
      </div>
    );
  }

  const { ticket, messages } = ticketData;
  const isClosed = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className={styles.container}>
      <div className={styles.backLinkWrapper}>
        <Link
          href="/user-dashboard/support/my-tickets"
          className={styles.backLink}
        >
          ← Back to My Tickets
        </Link>
      </div>

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>{ticket.title}</h1>
            <div className={styles.meta}>
              <span>#{ticket.id.substring(0, 8)}</span>
              <span>•</span>
              <span>{ticket.category}</span>
              <span>•</span>
              <span>{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div className={`${styles.status} ${getStatusClass(ticket.status)}`}>
            {formatStatus(ticket.status)}
          </div>
        </div>
      </div>

      <div className={styles.chatContainer}>
        {/* Render Thread - First message is the original description */}
        {messages.map((msg: Message, index: number) => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.sender_role === "admin" ? styles.messageAdmin : styles.messageUser}`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.messageSender}>
                {index === 0
                  ? msg.sender_role === "admin"
                    ? "Support Team"
                    : "You (Original Request)"
                  : msg.sender_role === "admin"
                    ? "Support Team"
                    : "You"}
              </span>
              <span>{new Date(msg.created_at).toLocaleString()}</span>
            </div>
            <div className={styles.messageContent}>{msg.message}</div>

            {msg.attachments && msg.attachments.length > 0 && (
              <div className={styles.attachmentList}>
                {msg.attachments.map((att: Attachment) => (
                  <a
                    key={att.id}
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.attachmentItem}
                  >
                    📎 {att.file_name} (
                    {(att.file_size_bytes / 1024).toFixed(1)} KB)
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!isClosed ? (
        <form className={styles.replyForm} onSubmit={handleReply}>
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

          <div className={styles.replyInner}>
            <label className={styles.fileLabel} title="Attach files">
              <input
                type="file"
                className={styles.fileInput}
                accept="image/jpeg,image/png,application/pdf"
                multiple
                onChange={handleFileChange}
              />
              <svg viewBox="0 0 24 24" className={styles.svgIcon}>
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </label>

            <textarea
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReply(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Type your reply here..."
              required={files.length === 0}
              rows={1}
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting || (!message.trim() && files.length === 0)}
            >
              {isSubmitting ? (
                <div
                  className={styles.spinner}
                  style={{ width: "16px", height: "16px", borderWidth: "1px" }}
                ></div>
              ) : (
                <svg viewBox="0 0 24 24" className={styles.sendIcon}>
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
          {uploadError && <p className={styles.error}>{uploadError}</p>}
        </form>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            padding: "24px",
          }}
        >
          This ticket is {ticket.status}. No further replies can be added.
        </div>
      )}
    </div>
  );
}
