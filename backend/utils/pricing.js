// Centralized pricing & discount computation logic.
// Computes effective discounted price based on event-level or global discount.
// Priority: event.discountActive -> global env variables -> no discount.

import dotenv from "dotenv";
dotenv.config();

/**
 * Compute discount details for an event.
 * @param {object} event - Mongoose Event doc or plain object with price, discountActive, discountPercent.
 * @param {object} [options]
 * @param {boolean} [options.forceRecompute=false] - Placeholder if future cache logic is added.
 * @returns {{
 *  originalPrice: number;
 *  discountPercent: number;
 *  discountedPrice: number;
 *  discountAmount: number;
 *  source: 'event' | 'global' | 'none';
 * }}
 */
export function computeDiscount(event, options = {}) {
  const originalPrice = Number(event?.price || 0);
  let percent = 0;
  let source = "none";

  if (event?.discountActive && event?.discountPercent > 0) {
    percent = clampPercent(event.discountPercent);
    source = "event";
  } else if (
    process.env.GLOBAL_DISCOUNT_ACTIVE === "true" &&
    process.env.GLOBAL_DISCOUNT_PERCENT
  ) {
    const globalP = parseFloat(process.env.GLOBAL_DISCOUNT_PERCENT);
    if (!isNaN(globalP) && globalP > 0) {
      percent = clampPercent(globalP);
      source = "global";
    }
  }

  const discountAmount = round2(originalPrice * (percent / 100));
  const discountedPrice = round2(originalPrice - discountAmount);

  return {
    originalPrice,
    discountPercent: percent,
    discountedPrice,
    discountAmount,
    source,
  };
}

function clampPercent(p) {
  return Math.min(100, Math.max(0, Number(p) || 0));
}

function round2(v) {
  return Math.round((Number(v) + Number.EPSILON) * 100) / 100;
}

/**
 * Given a registration and its event, produce authoritative pricing info.
 * Registration may already have locked discount fields.
 * @param {object} registration - Registration document
 * @param {object} event - Event document
 * @returns {{
 *  locked: boolean;
 *  originalPrice: number;
 *  discountPercent: number;
 *  discountedPrice: number;
 *  discountAmount: number;
 * }}
 */
export function resolveRegistrationPricing(registration, event) {
  if (
    registration?.appliedDiscountPercent != null &&
    registration.originalAmount > 0
  ) {
    const originalPrice = registration.originalAmount;
    const discountPercent = clampPercent(registration.appliedDiscountPercent);
    const discountAmount = round2(originalPrice * (discountPercent / 100));
    const discountedPrice = round2(originalPrice - discountAmount);
    return {
      locked: true,
      originalPrice,
      discountPercent,
      discountAmount,
      discountedPrice,
    };
  }
  const computed = computeDiscount(event || {});
  return { locked: false, ...computed };
}
