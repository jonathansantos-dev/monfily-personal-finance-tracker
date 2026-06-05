'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';
import type { Category } from '../../../../lib/types/database';

/** Structured result type for all category actions */
interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Fetches all categories for the current authenticated user,
 * ordered by created_at ascending.
 *
 * Validates: Requirement 8.1
 */
export async function getCategories(): Promise<ActionResult<Category[]>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Category[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    return { success: false, error: message };
  }
}

/**
 * Creates a new category for the current authenticated user.
 *
 * Validates: Requirement 8.1
 */
export async function createCategory(
  data: { name: string; icon: string; color: string }
): Promise<ActionResult<Category>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/categories');
    return { success: true, data: category as Category };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category';
    return { success: false, error: message };
  }
}

/**
 * Updates an existing category for the current authenticated user.
 *
 * Validates: Requirement 8.2
 */
export async function updateCategory(
  id: string,
  data: { name?: string; icon?: string; color?: string }
): Promise<ActionResult<Category>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/categories');
    return { success: true, data: category as Category };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update category';
    return { success: false, error: message };
  }
}

/**
 * Deletes a category for the current authenticated user.
 * First checks if any transactions reference this category — if so,
 * prevents deletion and returns an error.
 *
 * Validates: Requirement 8.3
 */
export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if any transactions reference this category
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('user_id', user.id);

    if (countError) {
      return { success: false, error: countError.message };
    }

    if (count !== null && count > 0) {
      return { success: false, error: 'Category is in use and cannot be deleted' };
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/categories');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    return { success: false, error: message };
  }
}
