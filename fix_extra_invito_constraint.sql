-- Rimuovi il vecchio constraint obsoleto
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_product_code_check;

-- Ricrea il constraint includendo il nuovo prodotto per gli inviti extra
ALTER TABLE purchases ADD CONSTRAINT purchases_product_code_check 
CHECK (product_code IN (
    'base', 'intermediate', 'advanced', 'complete', 'complete_bundle',
    'multi_5', 'multi_10', 'multi_25',
    'scuola_10',
    'upgrade_to_multi_5', 'upgrade_to_multi_10', 'upgrade_to_multi_25',
    'extra_invito_1' -- Aggiunto nuovo prodotto extra invito
));

-- Inoltre, per recuperare l'account test ed erogargli direttamente la licenza che ha pagato 
-- in modo che non debba rifare l'acquisto, lanciamo anche:
UPDATE team_licenses 
SET max_invites_total = max_invites_total + 1 
WHERE owner_user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'simonsilvercaldaie@gmail.com'
);

-- Ricarica lo schema
NOTIFY pgrst, 'reload schema';
