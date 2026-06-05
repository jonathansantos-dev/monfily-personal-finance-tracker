'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';
import type { Profile } from '../../../../lib/types/database';

/**
 * Structured result type for profile actions.
 */
interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Fetches the current user's profile.
 *
 * Validates: Requirements 9.1
 */
export async function getProfile(): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Profile };
  } catch {
    return { success: false, error: 'Failed to fetch profile' };
  }
}

/**
 * Updates the current user's display name.
 *
 * Validates: Requirements 9.1
 */
export async function updateProfile(data: {
  display_name: string;
}): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        display_name: data.display_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/profile');
    revalidatePath('/');

    return { success: true, data: profile as Profile };
  } catch {
    return { success: false, error: 'Failed to update profile' };
  }
}

/**
 * Uploads an avatar image to Supabase Storage and updates the profile.
 * The file must be validated client-side (max 2 MB, image types only)
 * before calling this action.
 *
 * Validates: Requirements 9.2, 9.3
 */
export async function uploadAvatar(formData: FormData): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const file = formData.get('avatar') as File | null;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Server-side size validation as a safety net
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return { success: false, error: 'File must be less than 2 MB' };
    }

    // Determine file extension from MIME type
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };

    const ext = mimeToExt[file.type];
    if (!ext) {
      return { success: false, error: 'File must be a JPEG, PNG, GIF, or WebP image' };
    }

    const filePath = `${user.id}/avatar.${ext}`;

    // Upload to Supabase Storage (upsert to replace existing)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update the profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/profile');
    revalidatePath('/');

    return { success: true, data: avatarUrl };
  } catch {
    return { success: false, error: 'Failed to upload avatar' };
  }
}
