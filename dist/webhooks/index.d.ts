type WebhookEvent = {
    body: string;
    signature: string;
};
export declare const webhookHandler: (upsertProduct: Function, upsertPrice: Function, manageSubscriptionChange: Function, event: WebhookEvent) => Promise<{
    received: boolean;
    message?: string;
}>;
export {};
