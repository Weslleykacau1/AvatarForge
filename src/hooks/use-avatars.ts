"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Avatar } from '@/app/types';

const AVATAR_GALLERY_KEY = 'avatar-forge-gallery-avatars';

export function useAvatars() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(AVATAR_GALLERY_KEY);
      if (items) {
        setAvatars(JSON.parse(items));
      }
    } catch (error) {
      console.error('Failed to load avatar gallery from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const saveAvatars = useCallback((newAvatars: Avatar[]) => {
    try {
      const sortedAvatars = newAvatars.sort((a, b) => a.name.localeCompare(b.name));
      setAvatars(sortedAvatars);
      window.localStorage.setItem(AVATAR_GALLERY_KEY, JSON.stringify(sortedAvatars));
    } catch (error) {
      console.error('Failed to save avatar gallery to localStorage', error);
    }
  }, []);

  const addOrUpdateAvatar = useCallback((avatar: Avatar) => {
    const newAvatars = [...avatars];
    const existingIndex = newAvatars.findIndex(item => item.id === avatar.id);
    if (existingIndex > -1) {
      newAvatars[existingIndex] = avatar;
    } else {
      newAvatars.unshift(avatar);
    }
    saveAvatars(newAvatars);
  }, [avatars, saveAvatars]);

  const removeAvatar = useCallback((id: string) => {
    const newAvatars = avatars.filter(item => item.id !== id);
    saveAvatars(newAvatars);
  }, [avatars, saveAvatars]);

  return { avatars, addOrUpdateAvatar, removeAvatar, isLoaded };
}
