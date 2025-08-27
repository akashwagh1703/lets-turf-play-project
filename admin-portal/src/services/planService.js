import planData from "../mock/plan.json";

// Get all plans
export const listPlans = async () =>
  new Promise((resolve) => setTimeout(() => resolve([...planData.plans]), 300));

// Save or update a plan (Admin only)
export const savePlan = async (plan) => {
  const index = planData.plans.findIndex((p) => p.id === plan.id);
  if (index > -1) {
    planData.plans[index] = plan;
  } else {
    planData.plans.push({ ...plan, id: Date.now() });
  }
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, plans: planData.plans }), 300)
  );
};

// Get all turf owners
export const listTurfOwners = async () =>
  new Promise((resolve) =>
    setTimeout(() => resolve([...planData.turfOwners]), 300)
  );

// Assign a plan to a turf owner (Admin only)
export const assignPlan = async (turfOwnerId, planId) => {
  const owner = planData.turfOwners.find((t) => t.id === turfOwnerId);
  if (owner) {
    owner.planId = planId;
    // Assign billing only if subscription plan
    const assignedPlan = planData.plans.find((p) => p.id === planId);
    if (assignedPlan.billingCycle !== "Per Booking") {
      owner.nextBillingDate = new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      )
        .toISOString()
        .split("T")[0];
    } else {
      owner.nextBillingDate = null;
    }
  }
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, turfOwners: planData.turfOwners }), 300)
  );
};

// Get promotional codes
export const listPromoCodes = async () =>
  new Promise((resolve) =>
    setTimeout(() => resolve([...planData.promoCodes]), 300)
  );

// Add or update promo code (Admin only)
export const savePromoCode = async (code) => {
  const index = planData.promoCodes.findIndex((c) => c.code === code.code);
  if (index > -1) {
    planData.promoCodes[index] = code;
  } else {
    planData.promoCodes.push(code);
  }
  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ success: true, promoCodes: planData.promoCodes }),
      300
    )
  );
};

// Get plan for a specific turf owner (Manager)
export const getManagerPlan = async (managerId) =>
  new Promise((resolve) => {
    const owner = planData.turfOwners.find((t) => t.id === managerId);
    if (!owner) return resolve(null);
    const plan = planData.plans.find((p) => p.id === owner.planId);
    resolve({
      ...plan,
      status: owner.status,
      joinedDate: owner.joinedDate,
      nextBillingDate: owner.nextBillingDate
    });
  });
