-- Ajout de la colonne admin_temp_password sur school_registration_requests
-- Stocke le mot de passe temporaire généré à l'approbation pour pouvoir le réafficher

alter table school_registration_requests
  add column if not exists admin_temp_password text;
