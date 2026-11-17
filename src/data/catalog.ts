export type FinishId = 'sage' | 'basalt' | 'glacier';
export type SizeLabel = '750 ml' | '950 ml' | '1.2 L';
export type ProductCategory = 'Hydration' | 'Camp & Brew' | 'Accessories';
export type CurrencyCode = 'USD' | 'EUR' | 'BDT';

export const CURRENCY_OPTIONS: CurrencyCode[] = ['USD', 'EUR', 'BDT'];
export const EUR_PER_USD = 0.92;
export const BDT_PER_USD = 120;

export function convertUnitPrice(
  usdPrice: number,
  currency: CurrencyCode
): number {
  if (currency === 'EUR') return Math.round(usdPrice * EUR_PER_USD);
  if (currency === 'BDT') return Math.round(usdPrice * BDT_PER_USD);
  return usdPrice;
}

export function formatConvertedAmount(
  amount: number,
  currency: CurrencyCode
): string {
  const formatted = amount.toLocaleString('en-US');
  if (currency === 'EUR') return `€${formatted}`;
  if (currency === 'BDT') return `৳${formatted}`;
  return `$${formatted}`;
}

export function formatPrice(usdPrice: number, currency: CurrencyCode): string {
  return formatConvertedAmount(convertUnitPrice(usdPrice, currency), currency);
}

export interface FinishMeta {
  name: string;
  dot: string;
}

export const FINISH_META: Record<FinishId, FinishMeta> = {
  sage: { name: 'Alpine Sage', dot: '#48634B' },
  basalt: { name: 'Basalt Black', dot: '#222624' },
  glacier: { name: 'Glacier Silver', dot: '#B4BDB8' },
};

export const SIZE_OPTIONS: { size: SizeLabel; price: number; scale: number }[] = [
  { size: '750 ml', price: 42, scale: 0.94 },
  { size: '950 ml', price: 48, scale: 1.0 },
  { size: '1.2 L', price: 54, scale: 1.06 },
];

export interface CatalogProduct {
  id:
    | 'material-flask'
    | 'ridge-tumbler'
    | 'summit-canister'
    | 'basecamp-carafe'
    | 'trail-sling-kit';
  name: string;
  category: ProductCategory;
  price: number;
  capacityLabel: string;
  thermalSpec: string;
  summary: string;
  keywords: string[];
  configurable?: boolean;
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'material-flask',
    name: 'Material Flask',
    category: 'Hydration',
    price: 48,
    capacityLabel: '750 ml – 1.2 L',
    thermalSpec: '24h cold · 12h hot',
    summary:
      'Flagship double-wall 18/8 stainless steel bottle with dual-threaded leakproof chug lid.',
    keywords: [
      'bottle',
      'flask',
      'hydration',
      'water',
      'insulated',
      'chug',
      'stainless',
      '750',
      '950',
      '1.2',
    ],
    configurable: true,
  },
  {
    id: 'ridge-tumbler',
    name: 'Ridge Camp Tumbler',
    category: 'Camp & Brew',
    price: 34,
    capacityLabel: '450 ml',
    thermalSpec: '14h cold · 8h hot',
    summary:
      'Tapered vacuum-insulated camp mug with press-in sip lid that slides cleanly into pack pockets.',
    keywords: [
      'tumbler',
      'mug',
      'cup',
      'coffee',
      'tea',
      'camp',
      '450',
      'sip',
    ],
  },
  {
    id: 'summit-canister',
    name: 'Summit Trail Canister',
    category: 'Camp & Brew',
    price: 44,
    capacityLabel: '600 ml',
    thermalSpec: '18h cold · 10h hot',
    summary:
      'Wide-mouth insulated food and broth vessel with knurled pressure-release collar for alpine lunches.',
    keywords: [
      'canister',
      'food',
      'jar',
      'soup',
      'thermos',
      'lunch',
      'wide',
      '600',
    ],
  },
  {
    id: 'basecamp-carafe',
    name: 'Basecamp Pour-Over Carafe',
    category: 'Camp & Brew',
    price: 64,
    capacityLabel: '1.0 L',
    thermalSpec: '24h cold · 12h hot',
    summary:
      'Vacuum-sealed trail brewing carafe paired with a micro-etched stainless steel dripper collar.',
    keywords: [
      'carafe',
      'coffee',
      'pour-over',
      'dripper',
      'brew',
      'basecamp',
      '1.0',
    ],
  },
  {
    id: 'trail-sling-kit',
    name: 'Trail Sling & Boot Kit',
    category: 'Accessories',
    price: 26,
    capacityLabel: 'Fits 750 ml–1.2 L',
    thermalSpec: 'Ripstop · 110 g',
    summary:
      'Weatherproof recycled ripstop crossbody strap with anodized carabiner and molded silicone base boot.',
    keywords: [
      'sling',
      'strap',
      'boot',
      'sleeve',
      'carry',
      'carabiner',
      'accessory',
      'protection',
    ],
  },
];

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'shipping',
    category: 'Shipping',
    question: 'How fast do orders ship and arrive?',
    answer:
      'Orders placed before 2:00 PM local time dispatch the same business day from our regional fulfillment hub. Standard ground delivery arrives in 2–4 business days across the continental US, with express two-day options available at checkout.',
    keywords: ['delivery', 'dispatch', 'express', 'tracking', 'free shipping'],
  },
  {
    id: 'returns',
    category: 'Returns',
    question: 'What is your return and exchange policy?',
    answer:
      'Unused flasks, tumblers, and accessories in original packaging can be returned or exchanged for a different capacity or finish within 30 days of delivery with prepaid return shipping. If you are between sizes, we process direct swaps as soon as your return is scanned by the carrier.',
    keywords: ['refund', 'swap', 'exchange', '30 days', 'return label'],
  },
  {
    id: 'maintenance',
    category: 'Maintenance',
    question: 'How should I clean and care for the powder coat?',
    answer:
      'Hand-wash the 18/8 stainless steel body with warm soapy water and a bottle brush to preserve the matte powder-coated grip over years of trail use. The dual-threaded chug lid and silicone gasket are top-rack dishwasher safe and can be removed for a thorough rinse.',
    keywords: ['wash', 'dishwasher', 'cleaning', 'soap', 'gasket', 'lid'],
  },
  {
    id: 'thermal',
    category: 'Maintenance',
    question: 'Can I use carbonated drinks, coffee, or boiling water?',
    answer:
      'Yes. The 18/8 food-grade interior resists flavor transfer between morning espresso and afternoon trail water, and handles boiling liquids safely. For carbonated beverages, leave a small headspace below the collar and open slowly after elevation changes.',
    keywords: ['soda', 'espresso', 'hot', 'cold', 'boiling', 'pressure'],
  },
  {
    id: 'warranty',
    category: 'Warranty',
    question: 'What does the lifetime replacement warranty cover?',
    answer:
      'Every Material vessel is backed against vacuum-seal failure, manufacturing defects, and lid thread wear for life. Cosmetic trail scuffs are part of the gear’s mileage, while compromised insulation or cracked gaskets are replaced free of charge.',
    keywords: ['guarantee', 'broken', 'defect', 'seal', 'replacement'],
  },
  {
    id: 'accessories',
    category: 'Compatibility',
    question: 'Do the Trail Sling, silicone boot, and chug lids fit multiple sizes?',
    answer:
      'The Trail Sling & Boot Kit fits our 750 ml, 950 ml, and 1.2 L Material Flask bodies using an adjustable tension cinch. Chug lids and brushed steel collars share one standardized neck diameter across all three flask capacities.',
    keywords: ['fit', 'size', 'compatible', 'boot', 'sling', 'lid', 'cap'],
  },
];
