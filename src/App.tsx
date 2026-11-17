import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initHeroCanvas } from './webgl/heroCanvas';
import { initSpecsCanvas } from './webgl/specsCanvas';
import { FaqSection } from './components/FaqSection';
import { CollectionSection } from './components/CollectionSection';
import { ProductArtwork } from './components/ProductArtwork';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ToastContainer, type ToastItem } from './components/ToastContainer';
import {
  FINISH_META,
  SIZE_OPTIONS,
  convertUnitPrice,
  formatConvertedAmount,
  formatPrice,
  type CatalogProduct,
  type CurrencyCode,
  type FinishId,
  type SizeLabel,
} from './data/catalog';

gsap.registerPlugin(ScrollTrigger);

interface BagItem {
  productId: CatalogProduct['id'];
  name: string;
  finish: FinishId;
  variantLabel: string;
  price: number;
  qty: number;
}

interface BagFlyState {
  id: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  color: string;
  active: boolean;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface ConfirmedOrderSummary {
  orderNumber: string;
  customer: CustomerInfo;
  totalUsd: number;
}

const SHOWCASE_STAGES = [
  {
    src: 'https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-showcase-studio.webp',
    alt: 'Material Flask standing on honed dark basalt slate in an architectural studio',
    title: 'Alpine Sage Matte',
    sub: 'Powder-coated 18/8 stainless steel',
  },
  {
    src: 'https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-showcase-river.webp',
    alt: 'Material Flask on a sunlit cedar picnic table beside a clear mountain river',
    title: 'Made for the Outside',
    sub: 'Zero condensation from morning trails to sunny riverbanks',
  },
  {
    src: 'https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-showcase-trail.webp',
    alt: 'Material Flask resting on a sunlit granite boulder overlooking golden alpine meadows',
    title: 'Machined Steel Collar',
    sub: 'Leakproof chug lid built to take a knock',
  },
  {
    src: 'https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-showcase-lake.webp',
    alt: 'Material Flask on a stone lakeside dock at dusk overlooking calm alpine water',
    title: 'All-Day Carry',
    sub: 'Built to go from sunny ridge hikes to quiet evening camp',
  },
];

export default function App() {
  // Always open in light mode regardless of browser dark-mode preference
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [finish, setFinish] = useState<FinishId>('sage');
  const [size, setSize] = useState<SizeLabel>('950 ml');
  const [price, setPrice] = useState<number>(48);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [captionBlur, setCaptionBlur] = useState<boolean>(false);
  const [splitPct, setSplitPct] = useState<number>(50);
  const [splitAnimate, setSplitAnimate] = useState<boolean>(false);
  const [bag, setBag] = useState<BagItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<
    'bag' | 'customer' | 'confirmed'
  >('bag');
  const [lastConfirmedOrder, setLastConfirmedOrder] =
    useState<ConfirmedOrderSummary | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [showPromoBanner, setShowPromoBanner] = useState<boolean>(true);
  const [checkedOut, setCheckedOut] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [recentlyAddedProductId, setRecentlyAddedProductId] = useState<
    string | null
  >(null);
  const [bagPopping, setBagPopping] = useState<boolean>(false);
  const [bagFly, setBagFly] = useState<BagFlyState | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [orderZoomActive, setOrderZoomActive] = useState<boolean>(false);

  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const specsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const tiltWrapRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<HTMLElement | null>(null);
  const frameRefs = useRef<(HTMLElement | null)[]>([]);
  const bentoGridRef = useRef<HTMLDivElement | null>(null);
  const compWrapRef = useRef<HTMLDivElement | null>(null);
  const heroScrollCueRef = useRef<HTMLAnchorElement | null>(null);
  const orderZoomStageRef = useRef<HTMLDivElement | null>(null);
  const addToBagBtnRef = useRef<HTMLButtonElement | null>(null);
  const bagTriggerRef = useRef<HTMLButtonElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const stageIdxRef = useRef<number>(0);
  const stageTimerRef = useRef<number | null>(null);
  const checkoutTimerRef = useRef<number | null>(null);
  const addedTimerRef = useRef<number | null>(null);
  const flyRafRef = useRef<number | null>(null);
  const flyTimerRef = useRef<number | null>(null);
  const bagPopTimerRef = useRef<number | null>(null);
  const drawerDelayTimerRef = useRef<number | null>(null);
  const flyIdRef = useRef<number>(0);
  const orderCounterRef = useRef<number>(1042);
  const toastIdRef = useRef<number>(0);
  const toastTimersRef = useRef<Map<number, number>>(new Map());
  const selectedConfigRef = useRef<{
    finish: FinishId;
    size: SizeLabel;
    price: number;
  }>({ finish: 'sage', size: '950 ml', price: 48 });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--promo-offset',
      showPromoBanner ? '36px' : '0px'
    );
  }, [showPromoBanner]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const cleanupHeroGl = initHeroCanvas(heroCanvasRef.current);
    const cleanupSpecsGl = initSpecsCanvas(specsCanvasRef.current);

    let lenis: InstanceType<typeof Lenis> | null = null;
    let lenisTicker: ((time: number) => void) | null = null;
    if (!prefersReduced) {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      lenisTicker = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(lenisTicker);
      gsap.ticker.lagSmoothing(0);
    }

    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;
    let velX = 0;
    let velY = 0;
    let tiltTicker: (() => void) | null = null;

    const heroStage = heroStageRef.current;
    const onHeroMove = (e: PointerEvent) => {
      if (!heroStage) return;
      const rect = heroStage.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = nx * 14;
      targetRotX = -ny * 10;
    };
    const onHeroLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    if (heroStage && tiltWrapRef.current && !prefersReduced) {
      heroStage.addEventListener('pointermove', onHeroMove);
      heroStage.addEventListener('pointerleave', onHeroLeave);
      tiltTicker = () => {
        const ax = (targetRotX - curRotX) * 0.08;
        const ay = (targetRotY - curRotY) * 0.08;
        velX = (velX + ax) * 0.82;
        velY = (velY + ay) * 0.82;
        curRotX += velX;
        curRotY += velY;
        if (tiltWrapRef.current) {
          tiltWrapRef.current.style.transform = `rotateX(${curRotX.toFixed(2)}deg) rotateY(${curRotY.toFixed(2)}deg)`;
        }
        if (shadowRef.current) {
          shadowRef.current.style.transform = `translateX(${(-curRotY * 1.4).toFixed(1)}px) scale(${1 - Math.abs(curRotX) * 0.01})`;
        }
      };
      gsap.ticker.add(tiltTicker);
    }

    const gsapCtx = gsap.context(() => {
      if (prefersReduced) return;

      const frames = frameRefs.current.filter(
        (el): el is HTMLElement => el !== null
      );
      if (showcaseRef.current && frames.length === 4) {
        // Explicit dwell + wipe cadence: caption advances only once incoming image is >= 90% revealed
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: showcaseRef.current,
            start: 'top top',
            end: '+=280%',
            pin: true,
            scrub: 0.65,
            onUpdate: (self: { progress: number }) => {
              const t = self.progress * 3.5;
              let nextIdx = 0;
              if (t >= 3.07) nextIdx = 3;
              else if (t >= 2.02) nextIdx = 2;
              else if (t >= 0.97) nextIdx = 1;

              if (nextIdx !== stageIdxRef.current) {
                stageIdxRef.current = nextIdx;
                setCaptionBlur(true);
                if (stageTimerRef.current !== null) {
                  window.clearTimeout(stageTimerRef.current);
                }
                stageTimerRef.current = window.setTimeout(() => {
                  stageTimerRef.current = null;
                  setActiveStage(nextIdx);
                  setCaptionBlur(false);
                }, 100);
              }
            },
          },
        });

        const wipeStarts = [0.25, 1.3, 2.35];
        frames.forEach((frame, i) => {
          if (i === 0) return;
          tl.fromTo(
            frame,
            { clipPath: 'inset(0 0 0 100%)' },
            { clipPath: 'inset(0 0 0 0%)', ease: 'none', duration: 0.8 },
            wipeStarts[i - 1]
          );
        });
        tl.set({}, {}, 3.5);
      }

      if (bentoGridRef.current) {
        gsap.from('.reveal-tile', {
          y: 28,
          scale: 0.96,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: bentoGridRef.current,
            start: 'top 82%',
            once: true,
          },
        });
      }
    });

    return () => {
      if (stageTimerRef.current !== null) {
        window.clearTimeout(stageTimerRef.current);
        stageTimerRef.current = null;
      }
      if (checkoutTimerRef.current !== null) {
        window.clearTimeout(checkoutTimerRef.current);
        checkoutTimerRef.current = null;
      }
      if (addedTimerRef.current !== null) {
        window.clearTimeout(addedTimerRef.current);
        addedTimerRef.current = null;
      }
      if (flyTimerRef.current !== null) {
        window.clearTimeout(flyTimerRef.current);
        flyTimerRef.current = null;
      }
      if (bagPopTimerRef.current !== null) {
        window.clearTimeout(bagPopTimerRef.current);
        bagPopTimerRef.current = null;
      }
      if (drawerDelayTimerRef.current !== null) {
        window.clearTimeout(drawerDelayTimerRef.current);
        drawerDelayTimerRef.current = null;
      }
      if (flyRafRef.current !== null) {
        window.cancelAnimationFrame(flyRafRef.current);
        flyRafRef.current = null;
      }
      toastTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      toastTimersRef.current.clear();
      cleanupHeroGl();
      cleanupSpecsGl();
      gsapCtx.revert();
      if (tiltTicker) gsap.ticker.remove(tiltTicker);
      if (lenisTicker) gsap.ticker.remove(lenisTicker);
      lenis?.destroy();
      heroStage?.removeEventListener('pointermove', onHeroMove);
      heroStage?.removeEventListener('pointerleave', onHeroLeave);
    };
  }, []);

  useEffect(() => {
    const updateHeroScrollCue = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (heroScrollCueRef.current) {
        const fade = Math.max(0, Math.min(1, 1 - scrollTop / 140));
        heroScrollCueRef.current.style.opacity = fade.toFixed(3);
        heroScrollCueRef.current.style.pointerEvents =
          fade < 0.08 ? 'none' : 'auto';
      }
    };

    updateHeroScrollCue();
    window.addEventListener('scroll', updateHeroScrollCue, { passive: true });
    window.addEventListener('resize', updateHeroScrollCue, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeroScrollCue);
      window.removeEventListener('resize', updateHeroScrollCue);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const selectStage = (idx: number) => {
    stageIdxRef.current = idx;
    setCaptionBlur(true);
    if (stageTimerRef.current !== null) {
      window.clearTimeout(stageTimerRef.current);
    }
    stageTimerRef.current = window.setTimeout(() => {
      stageTimerRef.current = null;
      setActiveStage(idx);
      setCaptionBlur(false);
    }, 110);
    frameRefs.current.forEach((frame, i) => {
      if (!frame) return;
      frame.style.clipPath =
        i <= idx ? 'inset(0 0 0 0%)' : 'inset(0 0 0 100%)';
    });
  };

  const updateSplit = (pct: number, animate: boolean) => {
    const clamped = Math.max(0, Math.min(100, pct));
    setSplitAnimate(animate);
    setSplitPct(clamped);
  };

  const handleCompPointerDown = (e: {
    currentTarget: HTMLDivElement;
    pointerId: number;
    clientX: number;
  }) => {
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    updateSplit(((e.clientX - rect.left) / rect.width) * 100, false);
  };

  const handleCompPointerMove = (e: {
    currentTarget: HTMLDivElement;
    clientX: number;
  }) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    updateSplit(((e.clientX - rect.left) / rect.width) * 100, false);
  };

  const handleCompPointerUp = () => {
    isDraggingRef.current = false;
  };

  const updateOrderZoomPoint = (
    el: HTMLDivElement,
    clientX: number,
    clientY: number
  ) => {
    if (!orderZoomStageRef.current) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const xPct = Math.max(
      4,
      Math.min(96, ((clientX - rect.left) / rect.width) * 100)
    );
    const yPct = Math.max(
      4,
      Math.min(96, ((clientY - rect.top) / rect.height) * 100)
    );
    orderZoomStageRef.current.style.setProperty(
      '--zoom-x',
      `${xPct.toFixed(2)}%`
    );
    orderZoomStageRef.current.style.setProperty(
      '--zoom-y',
      `${yPct.toFixed(2)}%`
    );
  };

  const selectFinish = (nextFinish: FinishId) => {
    selectedConfigRef.current.finish = nextFinish;
    setFinish(nextFinish);
  };

  const selectSize = (nextSize: SizeLabel, nextPrice: number) => {
    selectedConfigRef.current.size = nextSize;
    selectedConfigRef.current.price = nextPrice;
    setSize(nextSize);
    setPrice(nextPrice);
  };

  const cancelPendingCheckout = () => {
    if (checkoutTimerRef.current !== null) {
      window.clearTimeout(checkoutTimerRef.current);
      checkoutTimerRef.current = null;
      setCheckedOut(false);
    }
  };

  const triggerBagFlyFromElement = (
    sourceEl: HTMLElement | null,
    dotColor: string
  ) => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!prefersReduced && sourceEl && bagTriggerRef.current) {
      const btnRect = sourceEl.getBoundingClientRect();
      const bagRect = bagTriggerRef.current.getBoundingClientRect();
      const startX = btnRect.left + btnRect.width / 2;
      const startY = btnRect.top + btnRect.height / 2;
      const targetX = bagRect.left + bagRect.width / 2;
      const targetY = bagRect.top + bagRect.height / 2;

      if (flyRafRef.current !== null) {
        window.cancelAnimationFrame(flyRafRef.current);
      }
      if (flyTimerRef.current !== null) {
        window.clearTimeout(flyTimerRef.current);
      }
      if (bagPopTimerRef.current !== null) {
        window.clearTimeout(bagPopTimerRef.current);
      }
      if (drawerDelayTimerRef.current !== null) {
        window.clearTimeout(drawerDelayTimerRef.current);
      }

      const nextId = ++flyIdRef.current;
      setBagFly({
        id: nextId,
        startX,
        startY,
        dx: targetX - startX,
        dy: targetY - startY,
        color: dotColor,
        active: false,
      });

      flyRafRef.current = window.requestAnimationFrame(() => {
        flyRafRef.current = window.requestAnimationFrame(() => {
          flyRafRef.current = null;
          setBagFly((prev) =>
            prev && prev.id === nextId ? { ...prev, active: true } : prev
          );
        });
      });

      bagPopTimerRef.current = window.setTimeout(() => {
        setBagPopping(true);
        bagPopTimerRef.current = window.setTimeout(() => {
          bagPopTimerRef.current = null;
          setBagPopping(false);
        }, 320);
      }, 380);

      flyTimerRef.current = window.setTimeout(() => {
        flyTimerRef.current = null;
        setBagFly((prev) => (prev && prev.id === nextId ? null : prev));
      }, 500);

      drawerDelayTimerRef.current = window.setTimeout(() => {
        drawerDelayTimerRef.current = null;
        setDrawerOpen(true);
      }, 460);
    } else {
      setDrawerOpen(true);
    }
  };

  const dismissToast = (id: number) => {
    const existingTimer = toastTimersRef.current.get(id);
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    const removeTimer = window.setTimeout(() => {
      toastTimersRef.current.delete(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 220);
    toastTimersRef.current.set(id, removeTimer);
  };

  const showToast = (
    message: string,
    detail?: string,
    tone: 'success' | 'info' = 'success'
  ) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, detail, tone }]);
    const timer = window.setTimeout(() => {
      dismissToast(id);
    }, 3200);
    toastTimersRef.current.set(id, timer);
  };

  const updateCurrency = (next: CurrencyCode) => {
    if (next === currency) return;
    setCurrency(next);
    showToast(
      `Prices switched to ${next}`,
      next === 'EUR' ? 'Converted from USD base pricing' : 'Showing US Dollar pricing',
      'info'
    );
  };

  const addItemToBag = (
    itemToAdd: Omit<BagItem, 'qty'>,
    sourceEl: HTMLElement | null
  ) => {
    cancelPendingCheckout();
    setBag((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productId === itemToAdd.productId &&
          item.finish === itemToAdd.finish &&
          item.variantLabel === itemToAdd.variantLabel
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...itemToAdd, qty: 1 }];
    });

    if (addedTimerRef.current !== null) {
      window.clearTimeout(addedTimerRef.current);
    }
    if (itemToAdd.productId === 'material-flask') {
      setJustAdded(true);
    }
    setRecentlyAddedProductId(itemToAdd.productId);
    addedTimerRef.current = window.setTimeout(() => {
      addedTimerRef.current = null;
      setJustAdded(false);
      setRecentlyAddedProductId(null);
    }, 1000);

    showToast(
      'Item added to bag',
      `${itemToAdd.name} · ${FINISH_META[itemToAdd.finish].name} (${itemToAdd.variantLabel})`
    );
    triggerBagFlyFromElement(sourceEl, FINISH_META[itemToAdd.finish].dot);
  };

  const handleAddCollectionProduct = (
    product: CatalogProduct,
    chosenFinish: FinishId,
    sourceEl: HTMLButtonElement
  ) => {
    addItemToBag(
      {
        productId: product.id,
        name: product.name,
        finish: chosenFinish,
        variantLabel:
          product.id === 'material-flask' ? '950 ml' : product.capacityLabel,
        price: product.price,
      },
      sourceEl
    );
  };

  const addItemToBagWithReset = (
    itemToAdd: Omit<BagItem, 'qty'>,
    sourceEl: HTMLElement | null
  ) => {
    if (checkoutStep === 'confirmed') {
      setCheckoutStep('bag');
      setLastConfirmedOrder(null);
    }
    addItemToBag(itemToAdd, sourceEl);
  };

  const updateBagQty = (idx: number, delta: number) => {
    cancelPendingCheckout();
    setBag((prev) => {
      const next = [...prev];
      const updatedQty = next[idx].qty + delta;
      if (updatedQty <= 0) {
        next.splice(idx, 1);
      } else {
        next[idx] = { ...next[idx], qty: updatedQty };
      }
      return next;
    });
  };

  const handleCheckout = () => {
    if (bag.length === 0) return;
    setCheckoutError(null);
    setCheckoutStep('customer');
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkedOut || bag.length === 0) return;

    const trimmed: CustomerInfo = {
      fullName: customerInfo.fullName.trim(),
      email: customerInfo.email.trim(),
      phone: customerInfo.phone.trim(),
      address: customerInfo.address.trim(),
      city: customerInfo.city.trim(),
      postalCode: customerInfo.postalCode.trim(),
    };

    if (
      !trimmed.fullName ||
      !trimmed.email ||
      !trimmed.phone ||
      !trimmed.address ||
      !trimmed.city
    ) {
      setCheckoutError(
        'Please enter your name, email, phone, street address, and city.'
      );
      return;
    }

    setCheckoutError(null);
    setCheckedOut(true);

    const nextOrderNumber = `MF-${++orderCounterRef.current}`;
    const newOrder: ConfirmedOrderSummary = {
      orderNumber: nextOrderNumber,
      customer: trimmed,
      totalUsd: bag.reduce((sum, item) => sum + item.price * item.qty, 0),
    };

    setLastConfirmedOrder(newOrder);
    setBag([]);
    setCheckedOut(false);
    setCheckoutStep('confirmed');
    showToast(
      `Order #${newOrder.orderNumber} confirmed`,
      `Receipt prepared for ${newOrder.customer.fullName}`
    );
  };

  const totalQty = bag.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = bag.reduce(
    (sum, item) => sum + convertUnitPrice(item.price, currency) * item.qty,
    0
  );
  const activeScale =
    SIZE_OPTIONS.find((s) => s.size === size)?.scale ?? 1.0;

  return (
    <>
      <div className="grain-overlay" aria-hidden="true" />

      {showPromoBanner && (
        <div
          className="promo-banner"
          role="region"
          aria-label="Seasonal offer"
        >
          <div className="container promo-banner-inner">
            <p className="promo-banner-text">
              <span>Free shipping on orders over $45</span>
              <span className="promo-sep" aria-hidden="true">
                ·
              </span>
              <span>Autumn Trail Season</span>
              <span className="promo-sep promo-hide-sm" aria-hidden="true">
                ·
              </span>
              <a href="#order" className="promo-banner-link promo-hide-sm">
                Shop Flask
              </a>
            </p>
            <button
              type="button"
              className="promo-dismiss-btn"
              aria-label="Dismiss free shipping announcement"
              onClick={() => setShowPromoBanner(false)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <header className="site-header" id="site-header">
        <div className="container header-inner">
          <a href="#hero" className="brand-lockup" aria-label="Material Flask Home">
            <svg
              className="brand-mark"
              width="24"
              height="15"
              viewBox="0 0 28 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 16L10.5 3L16 11.5L19.5 6.5L26 16H2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span className="brand-wordmark">Material</span>
          </a>

          <nav className="header-nav" aria-label="Primary">
            <a href="#showcase" className="nav-link">
              Showcase
            </a>
            <a href="#collection" className="nav-link">
              Collection
            </a>
            <a href="#faq" className="nav-link">
              FAQ
            </a>
            <button
              type="button"
              className="icon-btn theme-toggle"
              id="theme-toggle"
              aria-label="Toggle color theme"
              title="Switch light or dark theme"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <svg
                id="theme-icon-sun"
                width="19"
                height="19"
                viewBox="0 0 256 256"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="128" cy="128" r="56" stroke="currentColor" strokeWidth="18" />
                <line x1="128" y1="24" x2="128" y2="44" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
                <line x1="128" y1="212" x2="128" y2="232" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
                <line x1="24" y1="128" x2="44" y2="128" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
                <line x1="212" y1="128" x2="232" y2="128" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
                <line x1="54" y1="54" x2="68" y2="68" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
                <line x1="188" y1="188" x2="202" y2="202" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
                <line x1="54" y1="202" x2="68" y2="188" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
                <line x1="188" y1="68" x2="202" y2="54" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
              </svg>
              <svg
                id="theme-icon-moon"
                width="19"
                height="19"
                viewBox="0 0 256 256"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M210.69 158.18A96.78 96.78 0 0 1 192 160 96.11 96.11 0 0 1 96 64a96.78 96.78 0 0 1 1.82-18.69A96.04 96.04 0 1 0 210.69 158.18Z"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              ref={bagTriggerRef}
              type="button"
              className={`icon-btn bag-trigger${bagPopping ? ' is-popping' : ''}`}
              id="bag-trigger"
              aria-label="Open order bag"
              onClick={() => {
                if (drawerDelayTimerRef.current !== null) {
                  window.clearTimeout(drawerDelayTimerRef.current);
                  drawerDelayTimerRef.current = null;
                }
                if (bag.length > 0 && checkoutStep === 'confirmed') {
                  setCheckoutStep('bag');
                }
                setDrawerOpen(true);
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 256 256"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="32"
                  y="72"
                  width="192"
                  height="144"
                  rx="16"
                  stroke="currentColor"
                  strokeWidth="18"
                />
                <path
                  d="M88 72V64a40 40 0 0 1 80 0v8"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              </svg>
              <span className="bag-count" id="bag-count">
                {totalQty}
              </span>
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* SECTION 1: Asymmetric Split Hero */}
        <section id="hero" className="hero">
          <canvas
            ref={heroCanvasRef}
            id="hero-gl-canvas"
            className="hero-canvas"
            aria-hidden="true"
          />

          <div className="container hero-grid">
            <div className="hero-copy">
              <h1 className="hero-title">Built for altitude.</h1>
              <p className="hero-sub">
                A sturdy stainless steel bottle made for long trail days and
                everyday commutes, keeping drinks cold or steaming without ever
                sweating in your bag.
              </p>

              <div className="hero-actions">
                <a href="#order" className="btn btn-primary magnetic-btn">
                  Shop Flask
                </a>
                <a href="#showcase" className="btn btn-ghost">
                  Explore
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 256 256"
                    fill="none"
                    aria-hidden="true"
                  >
                    <line
                      x1="64"
                      y1="64"
                      x2="192"
                      y2="192"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="88 192 192 192 192 88"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="hero-stage" ref={heroStageRef} id="hero-stage">
              <div
                className="flask-tilt-wrap"
                ref={tiltWrapRef}
                id="flask-tilt-wrap"
              >
                <img
                  src="https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-cutout.webp"
                  alt="Material Flask 950 ml in matte olive-sage green powder coat with black chug lid"
                  className="flask-hero-img"
                  id="hero-flask-img"
                  data-finish={finish}
                  width={519}
                  height={940}
                />
              </div>
              <div className="flask-shadow" ref={shadowRef} aria-hidden="true" />

              <div
                className="hero-swatches"
                role="radiogroup"
                aria-label="Select flask finish"
              >
                {(Object.keys(FINISH_META) as FinishId[]).map((key) => {
                  const meta = FINISH_META[key];
                  const isActive = finish === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      className={`swatch-btn${isActive ? ' is-active' : ''}`}
                      data-finish={key}
                      aria-checked={isActive}
                      aria-label={`${meta.name} finish`}
                      onClick={() => selectFinish(key)}
                    >
                      <span
                        className="swatch-dot"
                        style={{ background: meta.dot }}
                      />
                      <span className="swatch-label">{meta.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <a
            ref={heroScrollCueRef}
            href="#showcase"
            className="hero-scroll-cue"
            aria-label="Scroll down to explore more"
          >
            <span className="hero-scroll-label">Scroll</span>
            <span className="hero-scroll-arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v13m0 0-5.5-5.5M12 18l5.5-5.5"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </section>

        {/* SECTION 2: Pinned 4-Angle Environmental Showcase */}
        <section id="showcase" ref={showcaseRef} className="showcase-pin">
          <div className="showcase-viewport" id="showcase-viewport">
            <div className="showcase-frames" id="showcase-frames">
              {SHOWCASE_STAGES.map((stage, i) => (
                <figure
                  key={stage.src}
                  ref={(el: HTMLElement | null) => {
                    frameRefs.current[i] = el;
                  }}
                  className={`showcase-frame${i === 0 ? ' is-active' : ''}`}
                  data-index={i}
                >
                  <img
                    src={stage.src}
                    alt={stage.alt}
                    className="showcase-img"
                  />
                </figure>
              ))}
            </div>

            <div className="showcase-hud">
              <div
                className={`showcase-caption${captionBlur ? ' is-blurring' : ''}`}
                id="showcase-caption"
              >
                <h2 className="caption-title" id="caption-title">
                  {SHOWCASE_STAGES[activeStage].title}
                </h2>
                <p className="caption-sub" id="caption-sub">
                  {SHOWCASE_STAGES[activeStage].sub}
                </p>
              </div>

              <div
                className="showcase-dots"
                role="tablist"
                aria-label="Showcase angles"
              >
                {SHOWCASE_STAGES.map((stage, i) => (
                  <button
                    key={stage.title}
                    type="button"
                    role="tab"
                    aria-selected={activeStage === i}
                    className={`stage-dot${activeStage === i ? ' is-active' : ''}`}
                    aria-label={`Angle ${i + 1}`}
                    onClick={() => selectStage(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Interactive Thermal Comparison Slider */}
        <section id="thermal" className="thermal-section">
          <div className="container thermal-grid">
            <div
              className="comparison-wrap"
              ref={compWrapRef}
              id="comparison-wrap"
              onPointerDown={handleCompPointerDown}
              onPointerMove={handleCompPointerMove}
              onPointerUp={handleCompPointerUp}
              onPointerCancel={handleCompPointerUp}
            >
              <div className="comparison-layer comparison-hot">
                <img
                  src="https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-thermal-hot.webp"
                  alt="Material Flask in warm alpine sunrise light"
                  className="comparison-img"
                />
              </div>

              <div
                className="comparison-layer comparison-cold"
                id="comparison-cold"
                style={{
                  clipPath: `inset(0 ${100 - splitPct}% 0 0)`,
                  transition: splitAnimate
                    ? 'clip-path 380ms var(--ease-out)'
                    : 'none',
                }}
              >
                <img
                  src="https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-thermal-cold.webp"
                  alt="Material Flask dry on frost-covered alpine ledge in sub-zero air"
                  className="comparison-img"
                />
              </div>

              <div
                className={`comparison-handle${
                  splitPct <= 2 || splitPct >= 98 ? ' is-edge' : ''
                }`}
                id="comparison-handle"
                role="slider"
                tabIndex={0}
                aria-label="Compare cold and hot insulation"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(splitPct)}
                style={{
                  left: `clamp(22px, ${splitPct}%, calc(100% - 22px))`,
                  transition: splitAnimate
                    ? 'left 380ms var(--ease-out)'
                    : 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') updateSplit(splitPct - 8, true);
                  if (e.key === 'ArrowRight') updateSplit(splitPct + 8, true);
                }}
              >
                <div className="handle-line" />
                <div className="handle-knob">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 256 256"
                    fill="none"
                    aria-hidden="true"
                  >
                    <polyline
                      points="176 144 208 176 176 208"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="48"
                      y1="176"
                      x2="208"
                      y2="176"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="80 112 48 80 80 48"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="208"
                      y1="80"
                      x2="48"
                      y2="80"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="thermal-copy">
              <h2 className="section-title">Icy cold or piping hot.</h2>
              <p className="section-sub">
                Thick double-wall steel keeps water icy for 24 hours and morning
                coffee steaming for 12, while the outside stays completely dry.
              </p>

              <div
                className="segmented-control"
                role="tablist"
                aria-label="Thermal performance"
              >
                <button
                  type="button"
                  role="tab"
                  className={`seg-btn${splitPct >= 98 ? ' is-active' : ''}`}
                  aria-selected={splitPct >= 98}
                  onClick={() => updateSplit(100, true)}
                >
                  24h Cold
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`seg-btn${splitPct <= 2 ? ' is-active' : ''}`}
                  aria-selected={splitPct <= 2}
                  onClick={() => updateSplit(0, true)}
                >
                  12h Hot
                </button>
              </div>

              <div className="thermal-metrics">
                <div className="metric-item">
                  <span className="metric-value">4°C</span>
                  <span className="metric-label">Cold retention</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">85°C</span>
                  <span className="metric-label">Heat retention</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Asymmetric 3-Tile Editorial Bento */}
        <section id="craft" className="bento-section">
          <div className="container">
            <div className="section-header-stack">
              <h2 className="section-title">Engineered to endure.</h2>
            </div>

            <div className="bento-grid" ref={bentoGridRef}>
              <article className="bento-tile bento-tall reveal-tile">
                <img
                  src="https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-bento-lid.webp"
                  alt="Close-up of threaded black chug cap and brushed steel neck"
                  className="bento-img"
                />
                <div className="bento-footer">
                  <h3 className="bento-title">Leakproof Chug Lid</h3>
                  <p className="bento-sub">
                    Dual-threaded seal with integrated carry loop
                  </p>
                </div>
              </article>

              <article className="bento-tile bento-top reveal-tile">
                <img
                  src="https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-bento-sunny.webp"
                  alt="Matte olive-sage green powder coat resting on sunlit trail timber"
                  className="bento-img"
                />
                <div className="bento-footer">
                  <h3 className="bento-title">Powder Coat</h3>
                  <p className="bento-sub">
                    Tactile matte grip that never slips wet
                  </p>
                </div>
              </article>

              <article className="bento-tile bento-bottom reveal-tile">
                <canvas
                  ref={specsCanvasRef}
                  id="specs-gl-canvas"
                  className="specs-canvas"
                  aria-hidden="true"
                />
                <div className="bento-footer bento-footer-specs">
                  <div>
                    <h3 className="bento-title">950 ml</h3>
                    <p className="bento-sub">520 g empty weight</p>
                  </div>
                  <span className="spec-badge">18/8 Steel</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* SECTION 5: Customer Testimonials Carousel */}
        <TestimonialsSection />

        {/* SECTION 6: Trail Carry Lineup Collection */}
        <CollectionSection
          currency={currency}
          recentlyAddedId={recentlyAddedProductId}
          onAddProduct={(product, chosenFinish, sourceEl) => {
            if (checkoutStep === 'confirmed') {
              setCheckoutStep('bag');
              setLastConfirmedOrder(null);
            }
            handleAddCollectionProduct(product, chosenFinish, sourceEl);
          }}
          onConfigureFlask={(chosenFinish) => selectFinish(chosenFinish)}
        />

        {/* SECTION 7: Interactive Finish & Size Configurator + Order */}
        <section id="order" className="order-section">
          <div className="container order-grid">
            <div
              className={`order-preview${orderZoomActive ? ' is-zoomed' : ''}`}
              id="order-preview"
              tabIndex={0}
              role="button"
              aria-pressed={orderZoomActive}
              aria-label="Hover or click to zoom and inspect product finish detail"
              onPointerEnter={(e) => {
                if (e.pointerType !== 'touch') {
                  updateOrderZoomPoint(e.currentTarget, e.clientX, e.clientY);
                  setOrderZoomActive(true);
                }
              }}
              onPointerMove={(e) => {
                if (orderZoomActive || e.pointerType !== 'touch') {
                  updateOrderZoomPoint(e.currentTarget, e.clientX, e.clientY);
                }
              }}
              onPointerLeave={() => setOrderZoomActive(false)}
              onClick={(e) => {
                updateOrderZoomPoint(e.currentTarget, e.clientX, e.clientY);
                setOrderZoomActive((prev) => !prev);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOrderZoomActive((prev) => !prev);
                } else if (e.key === 'Escape' && orderZoomActive) {
                  setOrderZoomActive(false);
                }
              }}
            >
              <div className="order-plinth" aria-hidden="true" />
              <div
                ref={orderZoomStageRef}
                className={`order-zoom-stage${orderZoomActive ? ' is-zoomed' : ''}`}
              >
                <img
                  src="https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-order-cutout.webp"
                  alt="Configured Material Flask three-quarter preview"
                  className="order-flask-img"
                  id="order-flask-img"
                  data-finish={finish}
                  width={519}
                  height={940}
                  style={{ transform: `scale(${activeScale})` }}
                  draggable={false}
                />
              </div>
              <div className="order-zoom-hint" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="16.5"
                    y1="16.5"
                    x2="21"
                    y2="21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {!orderZoomActive && (
                    <>
                      <line
                        x1="11"
                        y1="8"
                        x2="11"
                        y2="14"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <line
                        x1="8"
                        y1="11"
                        x2="14"
                        y2="11"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
                <span>
                  {orderZoomActive
                    ? `${FINISH_META[finish].name} · 2.25×`
                    : 'Hover to inspect finish'}
                </span>
              </div>
            </div>

            <div className="order-panel">
              <h2 className="section-title">Material Flask</h2>
              <div className="order-price-row">
                <p className="order-price" id="order-price">
                  {formatPrice(price, currency)}
                </p>
                <div
                  className="currency-toggle"
                  role="group"
                  aria-label="Display currency"
                >
                  {(['USD', 'EUR'] as CurrencyCode[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      className={`currency-btn${currency === code ? ' is-active' : ''}`}
                      aria-pressed={currency === code}
                      onClick={() => updateCurrency(code)}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="config-group">
                <span className="config-label">Finish</span>
                <div className="option-row" id="order-finish-row">
                  {(Object.keys(FINISH_META) as FinishId[]).map((key) => {
                    const meta = FINISH_META[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`pill-option${
                          finish === key ? ' is-active' : ''
                        }`}
                        onClick={() => selectFinish(key)}
                      >
                        <span
                          className="dot"
                          style={{ background: meta.dot }}
                        />
                        {meta.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="config-group">
                <span className="config-label">Capacity</span>
                <div className="option-row" id="order-size-row">
                  {SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.size}
                      type="button"
                      className={`pill-option${
                        size === opt.size ? ' is-active' : ''
                      }`}
                      onClick={() => {
                        selectSize(opt.size, opt.price);
                      }}
                    >
                      {opt.size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="spec-list">
                <div className="spec-row">
                  <span className="spec-key">Insulation</span>
                  <span className="spec-val">24h cold, 12h hot</span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Steel</span>
                  <span className="spec-val">18/8 pro-grade double wall</span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Warranty</span>
                  <span className="spec-val">Lifetime replacement</span>
                </div>
              </div>

              <button
                ref={addToBagBtnRef}
                type="button"
                className={`btn btn-primary btn-full magnetic-btn add-bag-btn${justAdded ? ' is-added' : ''}`}
                id="add-to-bag-btn"
                onClick={() => {
                  const activeCfg = selectedConfigRef.current;
                  addItemToBagWithReset(
                    {
                      productId: 'material-flask',
                      name: 'Material Flask',
                      finish: activeCfg.finish,
                      variantLabel: activeCfg.size,
                      price: activeCfg.price,
                    },
                    addToBagBtnRef.current
                  );
                }}
              >
                <span className="btn-label add-bag-label" id="add-to-bag-label">
                  {justAdded ? (
                    <>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <polyline
                          points="20 6 9 17 4 12"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Added to Bag
                    </>
                  ) : (
                    `Add to Bag - ${formatPrice(price, currency)}`
                  )}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 8: Frequently Asked Questions */}
        <FaqSection />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span className="footer-brand">Material</span>
          <span className="footer-tag">Built for altitude.</span>
          <span className="footer-copy">© 2026 Material</span>
        </div>
      </footer>

      {/* Slide-Over Order Bag Drawer */}
      <div
        className="drawer-backdrop"
        id="drawer-backdrop"
        hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className="bag-drawer"
        id="bag-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        hidden={!drawerOpen}
      >
        <div className="drawer-header">
          <h2 id="drawer-title" className="drawer-title">
            {checkoutStep === 'customer'
              ? 'Customer Info'
              : checkoutStep === 'confirmed'
                ? 'Order Confirmed'
                : 'Bag'}
          </h2>
          <button
            type="button"
            className="icon-btn"
            id="drawer-close"
            aria-label="Close bag"
            onClick={() => setDrawerOpen(false)}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 256 256"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="200"
                y1="56"
                x2="56"
                y2="200"
                stroke="currentColor"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <line
                x1="200"
                y1="200"
                x2="56"
                y2="56"
                stroke="currentColor"
                strokeWidth="20"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="drawer-body" id="drawer-body">
          {checkoutStep === 'confirmed' && lastConfirmedOrder ? (
            <div className="checkout-confirmed-box">
              <div className="checkout-confirmed-check" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polyline
                    points="20 6 9 17 4 12"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="checkout-confirmed-title">
                Order #{lastConfirmedOrder.orderNumber} Confirmed
              </h3>
              <p className="checkout-confirmed-sub">
                Receipt sent to {lastConfirmedOrder.customer.email}. Preparing
                shipment to {lastConfirmedOrder.customer.address},{' '}
                {lastConfirmedOrder.customer.city}.
              </p>

              <div className="checkout-confirmed-summary">
                <div>
                  <span>Customer</span>
                  <strong>{lastConfirmedOrder.customer.fullName}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>
                    {formatPrice(lastConfirmedOrder.totalUsd, currency)}
                  </strong>
                </div>
              </div>

              <div className="checkout-confirmed-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => {
                    setCheckoutStep('bag');
                    setDrawerOpen(false);
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="drawer-empty"
                id="drawer-empty"
                hidden={bag.length > 0}
              >
                <p>Your bag is empty.</p>
                <a
                  href="#order"
                  className="btn btn-primary btn-sm"
                  id="drawer-empty-cta"
                  onClick={() => setDrawerOpen(false)}
                >
                  Select Flask
                </a>
              </div>

              {bag.length > 0 && checkoutStep === 'customer' ? (
                <form
                  id="customer-checkout-form"
                  className="checkout-form"
                  onSubmit={handleConfirmOrder}
                >
                  <div className="checkout-form-grid">
                    <label className="checkout-field">
                      <span>Full Name</span>
                      <input
                        type="text"
                        required
                        value={customerInfo.fullName}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Nadia Karim"
                      />
                    </label>
                    <label className="checkout-field">
                      <span>Email</span>
                      <input
                        type="email"
                        required
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="nadia@example.com"
                      />
                    </label>
                    <label className="checkout-field">
                      <span>Phone</span>
                      <input
                        type="tel"
                        required
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+880 1711-000000"
                      />
                    </label>
                    <label className="checkout-field">
                      <span>Street Address</span>
                      <input
                        type="text"
                        required
                        value={customerInfo.address}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="House 18, Road 11, Banani"
                      />
                    </label>
                    <div className="checkout-field-row">
                      <label className="checkout-field">
                        <span>City / District</span>
                        <input
                          type="text"
                          required
                          value={customerInfo.city}
                          onChange={(e) =>
                            setCustomerInfo((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          placeholder="Dhaka"
                        />
                      </label>
                      <label className="checkout-field">
                        <span>Postal Code</span>
                        <input
                          type="text"
                          value={customerInfo.postalCode}
                          onChange={(e) =>
                            setCustomerInfo((prev) => ({
                              ...prev,
                              postalCode: e.target.value,
                            }))
                          }
                          placeholder="1213"
                        />
                      </label>
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="checkout-error" role="status">
                      {checkoutError}
                    </div>
                  )}

                  <div className="checkout-form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary btn-full"
                      disabled={checkedOut}
                    >
                      Place Order · {formatConvertedAmount(totalPrice, currency)}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-full"
                      onClick={() => {
                        setCheckoutError(null);
                        setCheckoutStep('bag');
                      }}
                    >
                      Back to Bag
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className="drawer-items"
                  id="drawer-items"
                  hidden={bag.length === 0}
                >
                  {bag.map((item, idx) => (
                    <div
                      key={`${item.productId}-${item.finish}-${item.variantLabel}`}
                      className="bag-item"
                    >
                      <div className="bag-item-thumb-wrap">
                        <ProductArtwork
                          productId={item.productId}
                          finish={item.finish}
                          className="bag-item-thumb"
                        />
                      </div>
                      <div className="bag-item-info">
                        <div className="bag-item-name">{item.name}</div>
                        <div className="bag-item-meta">
                          {FINISH_META[item.finish].name} · {item.variantLabel} (
                          {formatPrice(item.price, currency)})
                        </div>
                        <div className="bag-qty-row">
                          <button
                            type="button"
                            className="qty-btn"
                            aria-label="Decrease quantity"
                            onClick={() => updateBagQty(idx, -1)}
                          >
                            -
                          </button>
                          <span className="bag-qty">{item.qty}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            aria-label="Increase quantity"
                            onClick={() => updateBagQty(idx, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div
          className="drawer-footer"
          id="drawer-footer"
          hidden={bag.length === 0 || checkoutStep !== 'bag'}
        >
          <div className="drawer-total-row">
            <div className="drawer-total-label-group">
              <span>Total</span>
              <div
                className="currency-toggle currency-toggle-sm"
                role="group"
                aria-label="Bag currency"
              >
                {(['USD', 'EUR'] as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={`currency-btn${currency === code ? ' is-active' : ''}`}
                    aria-pressed={currency === code}
                    onClick={() => updateCurrency(code)}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
            <span className="drawer-total" id="drawer-total">
              {formatConvertedAmount(totalPrice, currency)}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-full"
            id="checkout-btn"
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      </aside>

      {bagFly && (
        <div
          key={bagFly.id}
          aria-hidden="true"
          className={`bag-fly-token${bagFly.active ? ' is-flying' : ''}`}
          style={
            {
              left: `${bagFly.startX}px`,
              top: `${bagFly.startY}px`,
              '--fly-dx': `${bagFly.dx}px`,
              '--fly-dy': `${bagFly.dy}px`,
            } as React.CSSProperties
          }
        >
          <span
            className="bag-fly-dot"
            style={{ background: bagFly.color }}
          />
          <span className="bag-fly-text">+1</span>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
