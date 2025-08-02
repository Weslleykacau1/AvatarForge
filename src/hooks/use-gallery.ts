"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Scene } from '@/app/types';

const GALLERY_KEY = 'avatar-forge-gallery-scenes';

export function useGallery() {
  const [gallery, setGallery] = useState<Scene[]>([]);
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

  const saveGallery = useCallback((newGallery: Scene[]) => {
    try {
      const sortedGallery = newGallery.sort((a, b) => a.name.localeCompare(b.name));
      setGallery(sortedGallery);
      window.localStorage.setItem(GALLERY_KEY, JSON.stringify(sortedGallery));
    } catch (error) {
      console.error('Failed to save gallery to localStorage', error);
    }
  }, []);

  const addOrUpdateScene = useCallback((scene: Scene) => {
    setGallery(prevGallery => {
      const newGallery = [...prevGallery];
      const existingIndex = newGallery.findIndex(item => item.id === scene.id);
      if (existingIndex > -1) {
        newGallery[existingIndex] = scene;
      } else {
        newGallery.unshift(scene);
      }
      saveGallery(newGallery);
      return newGallery.sort((a, b) => a.name.localeCompare(b.name));
    });
  }, [saveGallery]);

  const removeScene = useCallback((id: string) => {
    setGallery(prevGallery => {
      const newGallery = prevGallery.filter(item => item.id !== id);
      saveGallery(newGallery);
      return newGallery;
    });
  }, [saveGallery]);

  return { gallery, addOrUpdateScene, removeScene, isLoaded };
}
