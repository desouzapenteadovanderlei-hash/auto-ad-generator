
CREATE TABLE public.financing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT,
  vehicle_price NUMERIC(12,2) NOT NULL,
  down_payment NUMERIC(12,2) NOT NULL,
  term_months INTEGER NOT NULL,
  interest_rate NUMERIC(6,3) NOT NULL,
  monthly_payment NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  total_interest NUMERIC(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.financing_leads TO anon;
GRANT SELECT, INSERT ON public.financing_leads TO authenticated;
GRANT ALL ON public.financing_leads TO service_role;

ALTER TABLE public.financing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a financing lead"
  ON public.financing_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 2 AND 120
    AND char_length(email) BETWEEN 5 AND 255
    AND char_length(phone) BETWEEN 8 AND 30
    AND vehicle_price > 0
    AND down_payment >= 0
    AND term_months BETWEEN 1 AND 120
    AND interest_rate >= 0
    AND interest_rate <= 20
  );
