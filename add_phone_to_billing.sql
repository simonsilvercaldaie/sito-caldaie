-- Migration: Aggiungi campo telefono ai profili di fatturazione
-- Rende il telefono obbligatorio per i prossimi acquisti 
-- (ma safe con default / check flessibili per chi già c'è)

ALTER TABLE billing_profiles
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

COMMENT ON COLUMN billing_profiles.phone IS 'Numero di telefono obbligatorio al checkout per assistenza fatturazione/contatti.';
