"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/mock-products";
import { currentSeason, SeasonConfig } from "@/config/season.config";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

// Define the Cart Item type (extends Product with quantity)
export interface CartItem extends Product {
    quantity: number;
}

export interface UserProfile {
    full_name: string;
    phone: string;
    address: string;
}

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number | string) => void;
    clearCart: () => void;
    totalAmount: number;
    season: SeasonConfig;
    isLoading: boolean;
    user: User | null;
    profile: UserProfile | null;
    logout: () => Promise<void>;
    updateQuantity: (productId: number | string, delta: number) => void;
    saveProfile: (newProfile: UserProfile) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [season] = useState<SeasonConfig>(currentSeason);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // 1. Initialize Auth & Load Cart
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Load Cart from DB
                const { data: cartData } = await supabase
                    .from('carts')
                    .select('items')
                    .eq('user_id', user.id)
                    .single();

                if (cartData && cartData.items) {
                    setCartItems(cartData.items as CartItem[]);
                } else {
                    const local = localStorage.getItem('cart-storage');
                    if (local) {
                        try {
                            const parsed = JSON.parse(local);
                            if (parsed.length > 0) {
                                setCartItems(parsed);
                                await supabase.from('carts').upsert({ user_id: user.id, items: parsed });
                            }
                        } catch (e) { }
                    }
                }

                // Load Profile from DB
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    setProfile({
                        full_name: profileData.full_name || '',
                        phone: profileData.phone || '',
                        address: profileData.address || ''
                    });
                }
            } else {
                // Guest Info
                const localCart = localStorage.getItem('cart-storage');
                if (localCart) {
                    try { setCartItems(JSON.parse(localCart)); } catch (e) { }
                }

                const localProfile = localStorage.getItem('user-profile-storage');
                if (localProfile) {
                    try { setProfile(JSON.parse(localProfile)); } catch (e) { }
                }
            }
            setIsLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    setUser(session.user);
                    // Reload DB cart logic could be here if needed to force refresh
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setCartItems([]);
            }
        });

        init();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // 2. Persist Cart Logic
    useEffect(() => {
        if (isLoading) return;

        localStorage.setItem('cart-storage', JSON.stringify(cartItems));

        if (user) {
            const saveToDB = async () => {
                await supabase.from('carts').upsert({
                    user_id: user.id,
                    items: cartItems,
                });
            };
            saveToDB();
        }
    }, [cartItems, user, isLoading]);


    const addToCart = (product: Product, quantity: number = 1) => {
        setCartItems((prev) => {
            const existingItem = prev.find((item) => item.id === product.id);
            if (existingItem) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId: number | string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        // State update handled by onAuthStateChange
    };

    const updateQuantity = (productId: number | string, delta: number) => {
        setCartItems((prev) => {
            return prev.map((item) => {
                if (item.id === productId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
    };

    const saveProfile = async (newProfile: UserProfile) => {
        setProfile(newProfile);
        localStorage.setItem('user-profile-storage', JSON.stringify(newProfile));

        if (user) {
            await supabase.from('profiles').upsert({
                id: user.id,
                ...newProfile,
                updated_at: new Date().toISOString()
            });
        }
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const totalAmount = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                addToCart,
                removeFromCart,
                clearCart,
                totalAmount,
                season,
                isLoading,
                user,
                profile,
                logout,
                updateQuantity,
                saveProfile
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
