/**
 * Profile Service - React Query hooks for profile operations
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Profile, CreateProfileFormData } from '@/lib/validators';

// ============================================
// QUERY KEYS
// ============================================

export const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  list: (filters: string) => [...profileKeys.lists(), { filters }] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: number) => [...profileKeys.details(), id] as const,
  my: () => [...profileKeys.all, 'my'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Search/List profiles with optional filters
 * Used in /empresa/explorar page
 */
export function useSearchProfiles(params?: {
  skip?: number;
  limit?: number;
  min_followers?: number;
  max_rate?: number;
}) {
  return useQuery({
    queryKey: profileKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      const response = await api.get<Profile[]>('/profiles/', { params });
      return response.data;
    },
  });
}

/**
 * Get single profile by ID
 * CRITICAL: This triggers trial logic on backend
 */
export function useGetProfile(id: number) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Profile>(`/profiles/${id}`);
      return response.data;
    },
    enabled: !!id,
    retry: false, // Don't retry on 403 (trial blocked)
  });
}

/**
 * Get current user's profile (for influencers)
 */
export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.my(),
    queryFn: async () => {
      const response = await api.get<Profile>('/profiles/me');
      return response.data;
    },
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create profile (influencers only)
 */
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProfileFormData) => {
      const response = await api.post<Profile>('/profiles/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.my() });
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });
}

/**
 * Update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateProfileFormData>) => {
      const response = await api.put<Profile>('/profiles/me', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.my() });
    },
  });
}
