import { storage } from "./storage";
import crypto from "crypto";

interface PaymobConfig {
    apiKey: string;
    integrationId: string;
    iframeId: string;
    hmacSecret: string;
}

interface AuthTokenResponse {
    token: string;
}

interface OrderResponse {
    id: number;
    [key: string]: any;
}

interface PaymentKeyResponse {
    token: string;
}

export class PaymobService {
    private baseUrl = "https://accept.paymob.com/api";

    async getConfig(): Promise<PaymobConfig> {
        const apiKey = await storage.getSystemSetting("paymob_api_key");
        const integrationId = await storage.getSystemSetting("paymob_integration_id");
        const iframeId = await storage.getSystemSetting("paymob_iframe_id");
        const hmacSecret = await storage.getSystemSetting("paymob_hmac_secret");

        if (!apiKey?.value || !integrationId?.value || !iframeId?.value || !hmacSecret?.value) {
            throw new Error("Paymob configuration is incomplete. Please configure all settings in admin panel.");
        }

        return {
            apiKey: apiKey.value,
            integrationId: integrationId.value,
            iframeId: iframeId.value,
            hmacSecret: hmacSecret.value,
        };
    }

    async getAuthToken(): Promise<string> {
        const config = await this.getConfig();

        const response = await fetch(`${this.baseUrl}/auth/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: config.apiKey,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to get auth token: ${response.statusText}`);
        }

        const data: AuthTokenResponse = await response.json();
        return data.token;
    }

    async registerOrder(
        authToken: string,
        amountCents: number,
        currency: string,
        userId: string,
        planId: string
    ): Promise<number> {
        const response = await fetch(`${this.baseUrl}/ecommerce/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_token: authToken,
                delivery_needed: "false",
                amount_cents: amountCents,
                currency: currency,
                merchant_order_id: `${userId}_${planId}_${Date.now()}`,
                items: [],
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to register order: ${response.statusText}`);
        }

        const data: OrderResponse = await response.json();
        return data.id;
    }

    async getPaymentKey(
        authToken: string,
        orderId: number,
        amountCents: number,
        currency: string,
        billingData: any
    ): Promise<string> {
        const config = await this.getConfig();

        const response = await fetch(`${this.baseUrl}/acceptance/payment_keys`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_token: authToken,
                amount_cents: amountCents,
                expiration: 3600,
                order_id: orderId,
                billing_data: {
                    apartment: billingData?.apartment || "NA",
                    email: billingData?.email || "user@example.com",
                    floor: billingData?.floor || "NA",
                    first_name: billingData?.first_name || "User",
                    street: billingData?.street || "NA",
                    building: billingData?.building || "NA",
                    phone_number: billingData?.phone_number || "+20100000000",
                    shipping_method: "NA",
                    postal_code: billingData?.postal_code || "NA",
                    city: billingData?.city || "Cairo",
                    country: billingData?.country || "EG",
                    last_name: billingData?.last_name || "Name",
                    state: billingData?.state || "NA",
                },
                currency: currency,
                integration_id: parseInt(config.integrationId),
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to get payment key: ${response.statusText}`);
        }

        const data: PaymentKeyResponse = await response.json();
        return data.token;
    }

    verifyWebhookSignature(data: any, receivedHmac: string, hmacSecret: string): boolean {
        const {
            amount_cents,
            created_at,
            currency,
            error_occured,
            has_parent_transaction,
            id,
            integration_id,
            is_3d_secure,
            is_auth,
            is_capture,
            is_refunded,
            is_standalone_payment,
            is_voided,
            order,
            owner,
            pending,
            source_data_pan,
            source_data_sub_type,
            source_data_type,
            success,
        } = data;

        const concatenatedString = [
            amount_cents,
            created_at,
            currency,
            error_occured,
            has_parent_transaction,
            id,
            integration_id,
            is_3d_secure,
            is_auth,
            is_capture,
            is_refunded,
            is_standalone_payment,
            is_voided,
            order,
            owner,
            pending,
            source_data_pan,
            source_data_sub_type,
            source_data_type,
            success,
        ].join("");

        const calculatedHmac = crypto
            .createHmac("sha512", hmacSecret)
            .update(concatenatedString)
            .digest("hex");

        return calculatedHmac === receivedHmac;
    }

    async processPaymentCallback(transactionData: any): Promise<void> {
        const { obj } = transactionData;

        if (!obj) {
            throw new Error("Invalid transaction data");
        }

        const orderId = obj.order?.id?.toString();
        if (!orderId) {
            throw new Error("Order ID not found in transaction data");
        }

        const transaction = await storage.getPaymobTransactionByOrderId(orderId);
        if (!transaction) {
            throw new Error(`Transaction not found for order ID: ${orderId}`);
        }

        const isSuccess = obj.success === true || obj.success === "true";
        const status = isSuccess ? "success" : "failed";

        await storage.updatePaymobTransaction(transaction.id, {
            paymob_transaction_id: obj.id?.toString(),
            status,
            payment_method: obj.source_data?.type || "unknown",
        });

        if (isSuccess && transaction.subscription_id) {
            await storage.updateSubscription(transaction.subscription_id, {
                status: "active",
                current_period_start: new Date(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            });
        } else if (isSuccess && !transaction.subscription_id) {
            const subscription = await storage.createSubscription({
                user_id: transaction.user_id,
                plan_id: transaction.plan_id,
                status: "active",
                current_period_start: new Date(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            await storage.updatePaymobTransaction(transaction.id, {
                subscription_id: subscription.id,
            });
        }
    }

    async getIframeUrl(paymentToken: string): Promise<string> {
        const config = await this.getConfig();
        return `https://accept.paymob.com/api/acceptance/iframes/${config.iframeId}?payment_token=${paymentToken}`;
    }
}

export const paymobService = new PaymobService();
