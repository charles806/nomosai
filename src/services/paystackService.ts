export interface PaystackConfig {
    email: string;
    amount: number; // in kobo (₦1 = 100 kobo)
    reference: string;
    onSuccess: (reference: string) => void;
    onClose: () => void;
}

export function generateReference(): string {
    return `lgee_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function initializePaystack(config: PaystackConfig) {
    const handler = (window as any).PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: config.email,
        amount: config.amount,
        currency: 'NGN',
        ref: config.reference,
        callback: (response: any) => config.onSuccess(response.reference),
        onClose: config.onClose,
    });
    handler.openIframe();
}
