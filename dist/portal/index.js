"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPortalLink = void 0;
const stripe_1 = require("../utils/stripe");
const createPortalLink = async (customer, returnUrl) => {
    try {
        const { url } = await stripe_1.stripe.billingPortal.sessions.create({
            customer: customer,
            return_url: returnUrl,
        });
        return url;
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
};
exports.createPortalLink = createPortalLink;
//# sourceMappingURL=index.js.map