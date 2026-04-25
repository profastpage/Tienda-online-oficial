import { create } from 'zustand'
import type { Product, Category, Testimonial, StoreInfo, StoreContentData, PaymentMethod, CreatedOrder } from './storefront-types'

interface StorefrontState {
  // ── Store data ──────────────────────────────────────────────
  storeInfo: StoreInfo | null
  storeContent: StoreContentData
  products: Product[]
  categories: Category[]
  testimonials: Testimonial[]
  paymentMethods: PaymentMethod[]
  loading: boolean

  // ── Derived store info ──────────────────────────────────────
  storeWhatsApp: string
  storeName: string
  storeLogo: string
  storeDescription: string

  // ── Navigation & UI ─────────────────────────────────────────
  activeCategory: string | null
  searchQuery: string
  mobileMenuOpen: boolean
  scrollY: number
  currentHero: number
  newsletterEmail: string
  canInstallPwa: boolean
  showInstallDialog: boolean
  fabOpen: boolean
  showAiChat: boolean
  mpCheckoutStatus: string | null

  // ── Product detail ──────────────────────────────────────────
  selectedProduct: Product | null
  selectedSize: string
  selectedColor: string
  addedToCart: boolean
  selectedImageView: number

  // ── Checkout ────────────────────────────────────────────────
  checkoutOpen: boolean
  checkoutStep: 1 | 2 | 3
  checkoutLoading: boolean
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  orderNotes: string
  termsAccepted: boolean
  selectedPaymentMethod: string
  createdOrder: CreatedOrder | null

  // ── Actions: Data ───────────────────────────────────────────
  setStoreInfo: (info: StoreInfo | null) => void
  setStoreContent: (content: StoreContentData) => void
  setProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setTestimonials: (testimonials: Testimonial[]) => void
  setPaymentMethods: (methods: PaymentMethod[]) => void
  setLoading: (loading: boolean) => void
  setStoreWhatsApp: (w: string) => void
  setStoreName: (n: string) => void
  setStoreLogo: (l: string) => void
  setStoreDescription: (d: string) => void

  // ── Actions: UI ─────────────────────────────────────────────
  setActiveCategory: (cat: string | null) => void
  setSearchQuery: (q: string) => void
  setMobileMenuOpen: (open: boolean) => void
  setScrollY: (y: number) => void
  setCurrentHero: (h: number) => void
  setNewsletterEmail: (e: string) => void
  setCanInstallPwa: (can: boolean) => void
  setShowInstallDialog: (show: boolean) => void
  setFabOpen: (open: boolean) => void
  setShowAiChat: (show: boolean) => void
  setMpCheckoutStatus: (s: string | null) => void

  // ── Actions: Product detail ─────────────────────────────────
  setSelectedProduct: (p: Product | null) => void
  setSelectedSize: (s: string) => void
  setSelectedColor: (c: string) => void
  setAddedToCart: (a: boolean) => void
  setSelectedImageView: (i: number) => void
  openProduct: (product: Product) => void

  // ── Actions: Checkout ───────────────────────────────────────
  setCheckoutOpen: (open: boolean) => void
  setCheckoutStep: (step: 1 | 2 | 3) => void
  setCheckoutLoading: (loading: boolean) => void
  setCustomerName: (n: string) => void
  setCustomerPhone: (p: string) => void
  setCustomerAddress: (a: string) => void
  setOrderNotes: (n: string) => void
  setTermsAccepted: (a: boolean) => void
  setSelectedPaymentMethod: (m: string) => void
  setCreatedOrder: (o: CreatedOrder | null) => void
}

export const useStorefrontStore = create<StorefrontState>()((set) => ({
  // ── Store data ──────────────────────────────────────────────
  storeInfo: null,
  storeContent: {},
  products: [],
  categories: [],
  testimonials: [],
  paymentMethods: [],
  loading: false,

  // ── Derived store info ──────────────────────────────────────
  storeWhatsApp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  storeName: '',
  storeLogo: '',
  storeDescription: '',

  // ── Navigation & UI ─────────────────────────────────────────
  activeCategory: null,
  searchQuery: '',
  mobileMenuOpen: false,
  scrollY: 0,
  currentHero: 0,
  newsletterEmail: '',
  canInstallPwa: false,
  showInstallDialog: false,
  fabOpen: false,
  showAiChat: false,
  mpCheckoutStatus: null,

  // ── Product detail ──────────────────────────────────────────
  selectedProduct: null,
  selectedSize: '',
  selectedColor: '',
  addedToCart: false,
  selectedImageView: 0,

  // ── Checkout ────────────────────────────────────────────────
  checkoutOpen: false,
  checkoutStep: 1,
  checkoutLoading: false,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  orderNotes: '',
  termsAccepted: false,
  selectedPaymentMethod: '',
  createdOrder: null,

  // ── Actions: Data ───────────────────────────────────────────
  setStoreInfo: (info) => set({ storeInfo: info }),
  setStoreContent: (content) => set({ storeContent: content }),
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setTestimonials: (testimonials) => set({ testimonials }),
  setPaymentMethods: (methods) => set({ paymentMethods: methods }),
  setLoading: (loading) => set({ loading }),
  setStoreWhatsApp: (w) => set({ storeWhatsApp: w }),
  setStoreName: (n) => set({ storeName: n }),
  setStoreLogo: (l) => set({ storeLogo: l }),
  setStoreDescription: (d) => set({ storeDescription: d }),

  // ── Actions: UI ─────────────────────────────────────────────
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setScrollY: (y) => set({ scrollY: y }),
  setCurrentHero: (h) => set({ currentHero: h }),
  setNewsletterEmail: (e) => set({ newsletterEmail: e }),
  setCanInstallPwa: (can) => set({ canInstallPwa: can }),
  setShowInstallDialog: (show) => set({ showInstallDialog: show }),
  setFabOpen: (open) => set({ fabOpen: open }),
  setShowAiChat: (show) => set({ showAiChat: show }),
  setMpCheckoutStatus: (s) => set({ mpCheckoutStatus: s }),

  // ── Actions: Product detail ─────────────────────────────────
  setSelectedProduct: (p) => set({ selectedProduct: p }),
  setSelectedSize: (s) => set({ selectedSize: s }),
  setSelectedColor: (c) => set({ selectedColor: c }),
  setAddedToCart: (a) => set({ addedToCart: a }),
  setSelectedImageView: (i) => set({ selectedImageView: i }),
  openProduct: (product) =>
    set({
      selectedProduct: product,
      selectedSize: '',
      selectedColor: '',
      addedToCart: false,
      selectedImageView: 0,
    }),

  // ── Actions: Checkout ───────────────────────────────────────
  setCheckoutOpen: (open) => set({ checkoutOpen: open }),
  setCheckoutStep: (step) => set({ checkoutStep: step }),
  setCheckoutLoading: (loading) => set({ checkoutLoading: loading }),
  setCustomerName: (n) => set({ customerName: n }),
  setCustomerEmail: (e) => set({ customerEmail: e }),
  setCustomerPhone: (p) => set({ customerPhone: p }),
  setCustomerAddress: (a) => set({ customerAddress: a }),
  setOrderNotes: (n) => set({ orderNotes: n }),
  setTermsAccepted: (a) => set({ termsAccepted: a }),
  setSelectedPaymentMethod: (m) => set({ selectedPaymentMethod: m }),
  setCreatedOrder: (o) => set({ createdOrder: o }),
}))
