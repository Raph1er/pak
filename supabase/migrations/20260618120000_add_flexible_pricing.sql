-- Add flexible pricing: upfront and monthly payments
ALTER TABLE public.products
ADD COLUMN price_upfront integer,
ADD COLUMN price_monthly integer;

-- Add comments for clarity
COMMENT ON COLUMN public.products.price_upfront IS 'Initial payment (deposit) before delivery - NULL if single payment model';
COMMENT ON COLUMN public.products.price_monthly IS 'Monthly payment amount (if installment plan) - NULL if single payment model';
COMMENT ON COLUMN public.products.price_xof IS 'Total product price (same for both models)';
COMMENT ON COLUMN public.products.duration_months IS 'Number of months for monthly payments - only used if price_monthly is set';
