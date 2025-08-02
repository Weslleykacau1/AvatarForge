"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/app/types';

const PRODUCT_GALLERY_KEY = 'avatar-forge-gallery-products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(PRODUCT_GALLERY_KEY);
      if (items) {
        setProducts(JSON.parse(items));
      }
    } catch (error) {
      console.error('Failed to load product gallery from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const saveProducts = useCallback((newProducts: Product[]) => {
    try {
      const sortedProducts = newProducts.sort((a, b) => a.productName.localeCompare(b.productName));
      setProducts(sortedProducts);
      window.localStorage.setItem(PRODUCT_GALLERY_KEY, JSON.stringify(sortedProducts));
    } catch (error) {
      console.error('Failed to save product gallery to localStorage', error);
    }
  }, []);

  const addOrUpdateProduct = useCallback((product: Product) => {
    setProducts(prevProducts => {
        const newProducts = [...prevProducts];
        const existingIndex = newProducts.findIndex(item => item.id === product.id);
        if (existingIndex > -1) {
            newProducts[existingIndex] = product;
        } else {
            newProducts.unshift(product);
        }
        saveProducts(newProducts);
        return newProducts.sort((a, b) => a.productName.localeCompare(b.productName));
    });
  }, [saveProducts]);

  const removeProduct = useCallback((id: string) => {
    setProducts(prevProducts => {
      const newProducts = prevProducts.filter(item => item.id !== id);
      saveProducts(newProducts);
      return newProducts;
    });
  }, [saveProducts]);

  return { products, addOrUpdateProduct, removeProduct, isLoaded };
}
