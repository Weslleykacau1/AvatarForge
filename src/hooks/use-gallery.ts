"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Influencer } from '@/app/types';

const GALLERY_KEY = 'avatar-forge-gallery';

export function useGallery() {
  const [gallery, setGallery] = useState<Influencer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(GALLERY_KEY);
      if (items) {
        setGallery(JSON.parse(items));
      }
    } catch (error) {
      console.error('Failed to load gallery from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const saveGallery = useCallback((newGallery: Influencer[]) => {
    try {
      const sortedGallery = newGallery.sort((a, b) => a.name.localeCompare(b.name));
      setGallery(sortedGallery);
      window.localStorage.setItem(GALLERY_KEY, JSON.stringify(sortedGallery));
    } catch (error) {
      console.error('Failed to save gallery to localStorage', error);
    }
  }, []);

  const addOrUpdateInfluencer = useCallback((influencer: Influencer) => {
    const newGallery = [...gallery];
    const existingIndex = newGallery.findIndex(item => item.id === influencer.id);
    if (existingIndex > -1) {
      newGallery[existingIndex] = influencer;
    } else {
      newGallery.unshift(influencer);
    }
    saveGallery(newGallery);
  }, [gallery, saveGallery]);

  const removeInfluencer = useCallback((id: string) => {
    const newGallery = gallery.filter(item => item.id !== id);
    saveGallery(newGallery);
  }, [gallery, saveGallery]);

  return { gallery, addOrUpdateInfluencer, removeInfluencer, isLoaded };
}
