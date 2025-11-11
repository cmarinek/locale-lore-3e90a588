// Type declarations for Deno edge functions
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  
  export interface ConnInfo {
    localAddr: Addr;
    remoteAddr: Addr;
  }

  export interface Addr {
    transport: string;
    hostname: string;
    port: number;
  }

  export interface ServeInit {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export function serve(
    handler: (request: Request, connInfo?: ConnInfo) => Response | Promise<Response>,
    options?: ServeOptions
  ): void;

  export function serve(
    options: ServeInit & {
      handler: (request: Request, connInfo?: ConnInfo) => Response | Promise<Response>;
    }
  ): void;

  export const cron: {
    (name: string, schedule: string, handler: () => void | Promise<void>): void;
  };
}

// Declare global serve function
declare function serve(
  handler: (request: Request) => Response | Promise<Response>
): void;

declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: any
  ): void;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: any
  ): void;
}

declare module "https://deno.land/std@0.208.0/http/server.ts" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: any
  ): void;
}

declare module "std/http/server.ts" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: any
  ): void;
}

declare module "https://esm.sh/stripe@14.21.0" {
  export namespace Stripe {
    interface SubscriptionUpdateParams {
      items?: any[];
      cancel_at_period_end?: boolean;
      payment_behavior?: string;
      proration_behavior?: string;
    }
    interface Customer {
      id: string;
      email?: string;
      metadata?: Record<string, any>;
    }
    interface Subscription {
      id: string;
      status: string;
      customer?: string;
      items: {
        data: Array<{
          price: {
            id: string;
          };
        }>;
      };
    }
    interface Event {
      type: string;
      data: {
        object: any;
      };
    }
    interface PaymentMethod {
      id: string;
      type: string;
    }
    interface Invoice {
      id: string;
      customer: string;
      subscription?: string;
    }
    interface Price {
      id: string;
    }
    interface Checkout {
      Session: any;
    }
  }
  
  interface Stripe {
    customers: any;
    checkout: {
      sessions: any;
    };
    subscriptions: any;
    paymentIntents: any;
    refunds: any;
    promotionCodes: any;
    coupons: any;
    billingPortal: {
      sessions: any;
    };
    invoices: any;
    paymentMethods: any;
    webhooks: {
      constructEvent: (payload: any, signature: string, secret: string) => any;
    };
    prices: any;
  }
  
  interface StripeConstructor {
    new (apiKey: string, config?: any): Stripe;
    (apiKey: string, config?: any): Stripe;
  }
  
  const Stripe: StripeConstructor;
  export = Stripe;
}

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  export function createClient(url: string, key: string, options?: any): any;
  export type User = any;
  export type Session = any;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string, options?: any): any;
  export type User = any;
  export type Session = any;
}

declare module "https://esm.sh/@supabase/supabase-js@2.7.1" {
  export function createClient(url: string, key: string, options?: any): any;
  export type User = any;
  export type Session = any;
}

declare module "npm:resend@4.0.0" {
  export class Resend {
    constructor(apiKey: string);
    emails: any;
  }
}

declare module "npm:resend@2.0.0" {
  export class Resend {
    constructor(apiKey: string);
    emails: any;
  }
}
