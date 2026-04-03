import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
}

interface WishlistState {
  items: WishlistItem[]
  isOpen: boolean
  openWishlist: () => void
  closeWishlist: () => void
  toggleWishlist: () => void
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
  toggleItem: (item: WishlistItem) => void
  clearWishlist: () => void
  totalItems: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (item) => {
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) return state
          return { items: [...state.items, item] }
        })
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },
      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id)
      },
      toggleItem: (item) => {
        const exists = get().isInWishlist(item.id)
        if (exists) {
          get().removeItem(item.id)
        } else {
          get().addItem(item)
        }
      },
      clearWishlist: () => set({ items: [] }),
      totalItems: () => get().items.length,
    }),
    {
      name: 'urban-style-wishlist',
    }
  )
)
