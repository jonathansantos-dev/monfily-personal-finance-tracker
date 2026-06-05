'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadAvatar } from '@/app/(app)/profile/actions';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  displayName: string | null;
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function getInitials(name: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

/**
 * Client component for uploading a user avatar with client-side validation.
 * Validates file size (max 2 MB) and type (JPEG, PNG, GIF, WebP) before upload.
 *
 * Validates: Requirements 9.2, 9.3
 */
export function AvatarUpload({ currentAvatarUrl, displayName }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    setSuccessMessage(null);

    if (!file) return;

    // Client-side size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File must be less than 2 MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Client-side type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('File must be a JPEG, PNG, GIF, or WebP image');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    const result = await uploadAvatar(formData);

    if (result.success && result.data) {
      setAvatarUrl(result.data);
      setSuccessMessage('Avatar updated successfully');
    } else {
      setError(result.error ?? 'Failed to upload avatar');
    }

    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar preview */}
      <div className="relative">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName ?? 'User avatar'}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl border-2 border-gray-200 dark:border-gray-700">
            {getInitials(displayName)}
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="flex flex-col items-center gap-2">
        <label
          htmlFor="avatar-upload"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            isUploading
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          {isUploading ? 'Uploading...' : 'Upload Avatar'}
        </label>
        <input
          ref={fileInputRef}
          id="avatar-upload"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="sr-only"
          aria-label="Upload avatar image"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPEG, PNG, GIF, or WebP. Max 2 MB.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Success message */}
      {successMessage && (
        <p className="text-sm text-green-600 dark:text-green-400" role="status">
          {successMessage}
        </p>
      )}
    </div>
  );
}
