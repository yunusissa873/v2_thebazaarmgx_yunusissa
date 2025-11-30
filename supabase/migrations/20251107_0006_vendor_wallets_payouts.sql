-- ============================================================
-- THE BAZAAR - Migration 0006
-- Vendor Wallets, Payouts, and Financial Tracking
-- ============================================================

-- ============================================================
-- VENDOR WALLETS TABLE
-- ============================================================
COMMENT ON TABLE vendor_wallets IS 'Current vendor balance and payout tracking';

CREATE TABLE vendor_wallets (
    vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Balance
    balance NUMERIC(12, 2) DEFAULT 0, -- Current available balance
    pending_balance NUMERIC(12, 2) DEFAULT 0, -- In pending orders
    reserved_balance NUMERIC(12, 2) DEFAULT 0, -- Held for disputes/refunds
    
    -- Totals
    total_earned NUMERIC(12, 2) DEFAULT 0,
    total_paid_out NUMERIC(12, 2) DEFAULT 0,
    
    currency TEXT DEFAULT 'KES',
    
    last_payout_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_wallets_vendor_id ON vendor_wallets(vendor_id);

-- ============================================================
-- VENDOR PAYOUT REQUESTS TABLE
-- ============================================================
COMMENT ON TABLE vendor_payout_requests IS 'Vendor-initiated payout requests';

CREATE TABLE vendor_payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Request Details
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    
    -- Payout Method
    payout_method TEXT, -- 'bank_transfer', 'mpesa', 'paypal'
    details JSONB, -- Bank account, M-Pesa number, etc.
    payout_details JSONB, -- Alias
    
    -- Processing
    processed_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMPTZ,
    transaction_reference TEXT,
    
    -- Metadata
    notes TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_payout_requests_vendor_id ON vendor_payout_requests(vendor_id);
CREATE INDEX idx_vendor_payout_requests_status ON vendor_payout_requests(status);
CREATE INDEX idx_vendor_payout_requests_created_at ON vendor_payout_requests(created_at DESC);

-- ============================================================
-- VENDOR PAYOUT TRANSACTIONS TABLE
-- ============================================================
COMMENT ON TABLE vendor_payout_transactions IS 'Completed payout transactions';

CREATE TABLE vendor_payout_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_request_id UUID REFERENCES vendor_payout_requests(id) ON DELETE SET NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Transaction Details
    amount NUMERIC(10, 2) NOT NULL,
    fee NUMERIC(10, 2) DEFAULT 0,
    net_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    
    -- Payment Details
    payment_method TEXT,
    transaction_reference TEXT,
    gateway_response JSONB,
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'completed',
    
    -- Metadata
    description TEXT,
    processed_by UUID REFERENCES profiles(id),
    
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_payout_transactions_vendor_id ON vendor_payout_transactions(vendor_id);
CREATE INDEX idx_vendor_payout_transactions_payout_request_id ON vendor_payout_transactions(payout_request_id);
CREATE INDEX idx_vendor_payout_transactions_completed_at ON vendor_payout_transactions(completed_at DESC);

-- ============================================================
-- VENDOR STATEMENT ENTRIES TABLE
-- ============================================================
COMMENT ON TABLE vendor_statement_entries IS 'Detailed vendor financial statement';

CREATE TABLE vendor_statement_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Entry Type
    entry_type TEXT NOT NULL, -- 'sale', 'refund', 'payout', 'fee', 'adjustment'
    
    -- References
    order_id UUID, -- Link to orders table (will be created in next migration)
    payout_id UUID REFERENCES vendor_payout_transactions(id) ON DELETE SET NULL,
    
    -- Amount
    amount NUMERIC(10, 2) NOT NULL, -- Positive for credits, negative for debits
    balance_after NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    
    -- Description
    description TEXT,
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_statement_entries_vendor_id ON vendor_statement_entries(vendor_id);
CREATE INDEX idx_vendor_statement_entries_entry_type ON vendor_statement_entries(entry_type);
CREATE INDEX idx_vendor_statement_entries_created_at ON vendor_statement_entries(created_at DESC);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0006 complete: Vendor wallets and payout system created';
END $$;
