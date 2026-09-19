-- =====================================================================
-- SYNCHRONISATION DES PRODUITS EXISTANTS VERS PUBLIC.PRODUCTS
-- Total produits analysés : 105
-- Idempotent et sans doublon : ON CONFLICT (id) DO UPDATE SET
-- =====================================================================

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_1', 'Miel Sauvage Élite de Kpalimé', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Miel Sauvage Élite", cette référence est sublimée par son esthétique "de Kpalimé". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 2500, 3255, 'Made in Togo Premium', 10, true, '["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1590156546746-c589fbfb31d6?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-0#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_9', 'Beurre de Karité Origin de Kovié', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Beurre de Karité Origin", cette référence est sublimée par son esthétique "de Kovié". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 7300, NULL, 'Made in Togo Premium', 130, true, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-8#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_17', 'Huile de Coco Vierge d''Atakpamé', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Huile de Coco Vierge", cette référence est sublimée par son esthétique "d''Atakpamé". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 12100, NULL, 'Made in Togo Premium', 100, false, '["https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-16#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_25', 'Café Moulu Arabica de Badou', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Café Moulu Arabica", cette référence est sublimée par son esthétique "de Badou". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 16900, 22155, 'Made in Togo Premium', 70, false, '["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1590156546746-c589fbfb31d6?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-24#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_33', 'Thé de Bissap Infusion des Monts Kabyè', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Thé de Bissap Infusion", cette référence est sublimée par son esthétique "des Monts Kabyè". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 6700, NULL, 'Made in Togo Premium', 40, false, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-32#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_41', 'Chocolat Noir Artisanal de Kpalimé', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Chocolat Noir Artisanal", cette référence est sublimée par son esthétique "de Kpalimé". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 11500, NULL, 'Made in Togo Premium', 10, false, '["https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-40#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_49', 'Savon Bio Goyave de Kovié', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Savon Bio Goyave", cette référence est sublimée par son esthétique "de Kovié". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 16300, 21315, 'Made in Togo Premium', 130, false, '["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1590156546746-c589fbfb31d6?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-48#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_57', 'Coffre en Bois de Teck d''Atakpamé', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Coffre en Bois de Teck", cette référence est sublimée par son esthétique "d''Atakpamé". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 6100, NULL, 'Made in Togo Premium', 100, false, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-56#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_65', 'Statue Argile Sculptée de Badou', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Statue Argile Sculptée", cette référence est sublimée par son esthétique "de Badou". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 10900, NULL, 'Made in Togo Premium', 70, false, '["https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-64#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_73', 'Huile Essentielle Pure des Monts Kabyè', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Huile Essentielle Pure", cette référence est sublimée par son esthétique "des Monts Kabyè". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 15700, 20580, 'Made in Togo Premium', 40, false, '["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1590156546746-c589fbfb31d6?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-72#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_81', 'Chapeau de Paille Fine de Kpalimé', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Chapeau de Paille Fine", cette référence est sublimée par son esthétique "de Kpalimé". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 5500, NULL, 'Made in Togo Premium', 10, false, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-80#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_89', 'Écrin d''Ébène Travaillé de Kovié', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Écrin d''Ébène Travaillé", cette référence est sublimée par son esthétique "de Kovié". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 10300, NULL, 'Made in Togo Premium', 130, false, '["https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-88#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_97', 'Panier Raphia Tissé d''Atakpamé', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Panier Raphia Tissé", cette référence est sublimée par son esthétique "d''Atakpamé". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 15100, 19740, 'Made in Togo Premium', 100, false, '["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1590156546746-c589fbfb31d6?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-96#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_105', 'Liqueur de Mangue de Badou', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Liqueur de Mangue", cette référence est sublimée par son esthétique "de Badou". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 4900, NULL, 'Made in Togo Premium', 70, false, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-104#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_2', 'T-shirt Designer Lomé Sénégalais', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "T-shirt Designer Lomé", cette référence est sublimée par son esthétique "Sénégalais". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 36500, NULL, 'Vêtements & Mode', 25, true, '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-1#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_3', 'Mocassins Cuir Noble Confort Absolu', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mocassins Cuir Noble", cette référence est sublimée par son esthétique "Confort Absolu". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 41100, NULL, 'Chaussures Premium', 40, true, '["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE2?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_4', 'Montre Chronographe Impériale', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Montre Chronographe", cette référence est sublimée par son esthétique "Impériale". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 17900, 23415, 'Montres & Accessoires', 55, true, '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate3', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_5', 'Superbe Plateau Fufu Sauce Arachide', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Superbe Plateau Fufu", cette référence est sublimée par son esthétique "Sauce Arachide". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 5400, NULL, 'Plats & Gastronomie', 70, true, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_6', 'Écouteurs Pro Active Aero Pro', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Écouteurs Pro Active", cette référence est sublimée par son esthétique "Aero Pro". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 51500, NULL, 'Importations Trends', 85, true, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-5#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_7', 'Panier Maraîcher Complet Mûries au Soleil', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Panier Maraîcher Complet", cette référence est sublimée par son esthétique "Mûries au Soleil". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 8900, 11655, 'Paniers Frais & Épicerie', 100, true, '["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_8', 'Mug en Céramique Fine Couleurs d''Afrique', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mug en Céramique Fine", cette référence est sublimée par son esthétique "Couleurs d''Afrique". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 9900, NULL, 'Print-on-Demand Localisé', 115, true, '["https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-7', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_10', 'Boubou Brodé Impérial Élite', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Boubou Brodé Impérial", cette référence est sublimée par son esthétique "Élite". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 10600, 13860, 'Vêtements & Mode', 145, true, '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-9', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_11', 'Sneakers Sport Prestige', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sneakers Sport", cette référence est sublimée par son esthétique "Prestige". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 55500, NULL, 'Chaussures Premium', 10, true, '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE10?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_12', 'Lunettes de Soleil Lomé Sunset', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Lunettes de Soleil", cette référence est sublimée par son esthétique "Lomé Sunset". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 29100, NULL, 'Montres & Accessoires', 25, true, '["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-11', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_13', 'Assiette d''Ayimolou Royale', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Assiette d''Ayimolou", cette référence est sublimée par son esthétique "Royale". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 9200, 12075, 'Plats & Gastronomie', 40, true, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_14', 'Mini Projecteur Smart Waterproof Bass', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mini Projecteur Smart", cette référence est sublimée par son esthétique "Waterproof Bass". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 17500, NULL, 'Importations Trends', 55, true, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE13?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_15', 'Avocats Bio Onctueux Coopérative Locale', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Avocats Bio Onctueux", cette référence est sublimée par son esthétique "Coopérative Locale". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 2100, NULL, 'Paniers Frais & Épicerie', 70, true, '["https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_16', 'Coussin de Déco Salon Miawoezon', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Coussin de Déco Salon", cette référence est sublimée par son esthétique "Miawoezon". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 14700, 19215, 'Print-on-Demand Localisé', 85, false, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-15', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_18', 'Chemise en Coton Confort', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Chemise en Coton", cette référence est sublimée par son esthétique "Confort". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 22800, NULL, 'Vêtements & Mode', 115, false, '["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE17?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_19', 'Sandales de Cuir Koutammakou', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sandales de Cuir", cette référence est sublimée par son esthétique "Koutammakou". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 24900, 32655, 'Chaussures Premium', 130, false, '["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE18?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_20', 'Portefeuille Raffiné Quartz Pro', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Portefeuille Raffiné", cette référence est sublimée par son esthétique "Quartz Pro". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 5300, NULL, 'Montres & Accessoires', 145, false, '["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'ClickBank', 'https://asime.hop.clickbank.net/?tid=item19', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_21', 'Gboma Dessi Poulet Épicé au Gingembre', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Gboma Dessi Poulet", cette référence est sublimée par son esthétique "Épicé au Gingembre". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 13100, NULL, 'Plats & Gastronomie', 10, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_22', 'Chargeur Solaire Extérieur Vlogger Duo', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Chargeur Solaire Extérieur", cette référence est sublimée par son esthétique "Vlogger Duo". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 33500, 43890, 'Importations Trends', 25, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate21', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_23', 'Mangues Mûres Juteuses de Kovié', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mangues Mûres Juteuses", cette référence est sublimée par son esthétique "de Kovié". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 5300, NULL, 'Paniers Frais & Épicerie', 40, false, '["https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_24', 'Affiche Graphique Lomé Skyline Lomé', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Affiche Graphique Lomé", cette référence est sublimée par son esthétique "Skyline Lomé". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 4500, NULL, 'Print-on-Demand Localisé', 55, false, '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-23', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_26', 'Veste Safari Stylée Horizon', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Veste Safari Stylée", cette référence est sublimée par son esthétique "Horizon". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 35000, NULL, 'Vêtements & Mode', 85, false, '["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-25#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_27', 'Bottines Designer Vibe', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Bottines Designer", cette référence est sublimée par son esthétique "Vibe". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 39300, NULL, 'Chaussures Premium', 100, false, '["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE26?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_28', 'Ceinture Double Face Black Gold', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Ceinture Double Face", cette référence est sublimée par son esthétique "Black Gold". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 16500, 21630, 'Montres & Accessoires', 115, false, '["https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate27', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_29', 'Riz Jollof Festif Feu de Bois', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Riz Jollof Festif", cette référence est sublimée par son esthétique "Feu de Bois". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 4900, NULL, 'Plats & Gastronomie', 130, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_30', 'Anneau Lumineux LED Noise Cancelling', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Anneau Lumineux LED", cette référence est sublimée par son esthétique "Noise Cancelling". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 49500, NULL, 'Importations Trends', 145, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-29#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_31', 'Racines de Gingembre de la Ferme', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Racines de Gingembre", cette référence est sublimée par son esthétique "de la Ferme". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 8500, 11130, 'Paniers Frais & Épicerie', 10, false, '["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_32', 'Coque Rigide Mobile Togo Patriote', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Coque Rigide Mobile", cette référence est sublimée par son esthétique "Togo Patriote". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 9300, NULL, 'Print-on-Demand Localisé', 25, false, '["https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-31', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_34', 'Robe Longue Fleurie Sahara', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Robe Longue Fleurie", cette référence est sublimée par son esthétique "Sahara". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 9100, 11865, 'Vêtements & Mode', 55, false, '["https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-33', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_35', 'Baskets Elite Run Sahélienne', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Baskets Elite Run", cette référence est sublimée par son esthétique "Sahélienne". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 53700, NULL, 'Chaussures Premium', 70, false, '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE34?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_36', 'Sac-à-main Élégant Ébène', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sac-à-main Élégant", cette référence est sublimée par son esthétique "Ébène". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 27700, NULL, 'Montres & Accessoires', 85, false, '["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-35', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_37', 'Poisson Grillé Braisé Gourmet', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Poisson Grillé Braisé", cette référence est sublimée par son esthétique "Gourmet". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 8700, 11340, 'Plats & Gastronomie', 100, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_38', 'Mini Console Vidéo Cinema Pocket', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mini Console Vidéo", cette référence est sublimée par son esthétique "Cinema Pocket". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 15500, NULL, 'Importations Trends', 115, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE37?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_39', 'Sélection d''Épices de Saison', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sélection d''Épices", cette référence est sublimée par son esthétique "de Saison". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 1700, NULL, 'Paniers Frais & Épicerie', 130, false, '["https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_40', 'Carnet d''Inspirations Édition Limitée', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Carnet d''Inspirations", cette référence est sublimée par son esthétique "Édition Limitée". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 14100, 18480, 'Print-on-Demand Localisé', 145, false, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-39', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_42', 'Sweat-shirt Togo Sénégalais', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sweat-shirt Togo", cette référence est sublimée par son esthétique "Sénégalais". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 21300, NULL, 'Vêtements & Mode', 25, false, '["https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE41?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_43', 'Derbies en Cuir Sovereign', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Derbies en Cuir", cette référence est sublimée par son esthétique "Sovereign". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 23100, 30240, 'Chaussures Premium', 40, false, '["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE42?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_44', 'Bracelet de Perles Milanaise', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Bracelet de Perles", cette référence est sublimée par son esthétique "Milanaise". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 38900, NULL, 'Montres & Accessoires', 55, false, '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'ClickBank', 'https://asime.hop.clickbank.net/?tid=item43', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_45', 'Ragout d''Igname Douce Maison', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Ragout d''Igname Douce", cette référence est sublimée par son esthétique "Maison". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 12600, NULL, 'Plats & Gastronomie', 70, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_46', 'Enceinte sans fil Hyper-Charge', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Enceinte sans fil", cette référence est sublimée par son esthétique "Hyper-Charge". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 31500, 41265, 'Importations Trends', 85, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate45', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_47', 'Tomates Grappes Fermes du Jardin Bio', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Tomates Grappes Fermes", cette référence est sublimée par son esthétique "du Jardin Bio". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 4900, NULL, 'Paniers Frais & Épicerie', 100, false, '["https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_48', 'Gourde Isolante Sport Sérigraphie Or', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Gourde Isolante Sport", cette référence est sublimée par son esthétique "Sérigraphie Or". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 3900, NULL, 'Print-on-Demand Localisé', 115, false, '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-47', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_50', 'Polo Classique Élite', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Polo Classique", cette référence est sublimée par son esthétique "Élite". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 33400, NULL, 'Vêtements & Mode', 145, false, '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-49#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_51', 'Slippers Confort Impérial', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Slippers Confort", cette référence est sublimée par son esthétique "Impérial". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 37500, NULL, 'Chaussures Premium', 10, false, '["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE50?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_52', 'Bague d''Argent Gravée Futura', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Bague d''Argent Gravée", cette référence est sublimée par son esthétique "Futura". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 15100, 19740, 'Montres & Accessoires', 25, false, '["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate51', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_53', 'Salade Composée Togo Terroir Secrêt', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Salade Composée Togo", cette référence est sublimée par son esthétique "Terroir Secrêt". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 4400, NULL, 'Plats & Gastronomie', 40, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_54', 'Smartband Sport Halo Glow', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Smartband Sport", cette référence est sublimée par son esthétique "Halo Glow". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 47500, NULL, 'Importations Trends', 55, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-53#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_55', 'Ananas Pain de Sucre Volcaniques', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Ananas Pain de Sucre", cette référence est sublimée par son esthétique "Volcaniques". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 8100, 10605, 'Paniers Frais & Épicerie', 70, false, '["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_56', 'Tote Bag Écolo Toile Minimaliste', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Tote Bag Écolo Toile", cette référence est sublimée par son esthétique "Minimaliste". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 8700, NULL, 'Print-on-Demand Localisé', 85, false, '["https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-55', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_58', 'Pantalon Chino Confort', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Pantalon Chino", cette référence est sublimée par son esthétique "Confort". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 7600, 9975, 'Vêtements & Mode', 115, false, '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-57', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_59', 'Espadrilles Riviera Rhéa', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Espadrilles Riviera", cette référence est sublimée par son esthétique "Rhéa". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 51900, NULL, 'Chaussures Premium', 130, false, '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE58?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_60', 'Sac de Voyage Cuir Astral', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sac de Voyage Cuir", cette référence est sublimée par son esthétique "Astral". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 26300, NULL, 'Montres & Accessoires', 145, false, '["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-59', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_61', 'Soupe de Poisson Royale Traditionnel', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Soupe de Poisson Royale", cette référence est sublimée par son esthétique "Traditionnel". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 8300, 10815, 'Plats & Gastronomie', 10, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_62', 'Micro Cravate Studio Portable Retro', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Micro Cravate Studio", cette référence est sublimée par son esthétique "Portable Retro". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 13500, NULL, 'Importations Trends', 25, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE61?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_63', 'Bananes Alloco Sucrées Fraîches', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Bananes Alloco Sucrées", cette référence est sublimée par son esthétique "Fraîches". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 11300, NULL, 'Paniers Frais & Épicerie', 40, false, '["https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_64', 'Cadre Mural Décoratif E-Lomé Vibe', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Cadre Mural Décoratif", cette référence est sublimée par son esthétique "E-Lomé Vibe". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 13500, 17640, 'Print-on-Demand Localisé', 55, false, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-63', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_66', 'Blouson Léger Horizon', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Blouson Léger", cette référence est sublimée par son esthétique "Horizon". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 19800, NULL, 'Vêtements & Mode', 85, false, '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE65?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_67', 'Babouches Apprêtées Course Pro', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Babouches Apprêtées", cette référence est sublimée par son esthétique "Course Pro". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 21300, 27930, 'Chaussures Premium', 100, false, '["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE66?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_68', 'Pendentif Totem Safari', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Pendentif Totem", cette référence est sublimée par son esthétique "Safari". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 37500, NULL, 'Montres & Accessoires', 115, false, '["https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'ClickBank', 'https://asime.hop.clickbank.net/?tid=item67', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_69', 'Superbe Plateau Fufu Sauce Arachide', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Superbe Plateau Fufu", cette référence est sublimée par son esthétique "Sauce Arachide". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 12100, NULL, 'Plats & Gastronomie', 130, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_70', 'Écouteurs Pro Active Aero Pro', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Écouteurs Pro Active", cette référence est sublimée par son esthétique "Aero Pro". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 29500, 38640, 'Importations Trends', 145, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate69', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_71', 'Panier Maraîcher Complet Mûries au Soleil', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Panier Maraîcher Complet", cette référence est sublimée par son esthétique "Mûries au Soleil". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 4500, NULL, 'Paniers Frais & Épicerie', 10, false, '["https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_72', 'Mug en Céramique Fine Couleurs d''Afrique', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mug en Céramique Fine", cette référence est sublimée par son esthétique "Couleurs d''Afrique". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 3300, NULL, 'Print-on-Demand Localisé', 25, false, '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-71', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_74', 'Tunique Bohème Sahara', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Tunique Bohème", cette référence est sublimée par son esthétique "Sahara". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 31900, NULL, 'Vêtements & Mode', 55, false, '["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-73#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_75', 'Tennis Légères Urbaines', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Tennis Légères", cette référence est sublimée par son esthétique "Urbaines". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 35700, NULL, 'Chaussures Premium', 70, false, '["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE74?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_76', 'Montre Automatique Nomade', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Montre Automatique", cette référence est sublimée par son esthétique "Nomade". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 13700, 17955, 'Montres & Accessoires', 85, false, '["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate75', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_77', 'Assiette d''Ayimolou Royale', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Assiette d''Ayimolou", cette référence est sublimée par son esthétique "Royale". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 3900, NULL, 'Plats & Gastronomie', 100, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_78', 'Mini Projecteur Smart Waterproof Bass', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mini Projecteur Smart", cette référence est sublimée par son esthétique "Waterproof Bass". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 45500, NULL, 'Importations Trends', 115, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-77#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_79', 'Avocats Bio Onctueux Coopérative Locale', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Avocats Bio Onctueux", cette référence est sublimée par son esthétique "Coopérative Locale". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 7700, 10080, 'Paniers Frais & Épicerie', 130, false, '["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_80', 'Coussin de Déco Salon Miawoezon', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Coussin de Déco Salon", cette référence est sublimée par son esthétique "Miawoezon". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 8100, NULL, 'Print-on-Demand Localisé', 145, false, '["https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-79', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_82', 'Gilet Traditionnel Wax Sénégalais', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Gilet Traditionnel Wax", cette référence est sublimée par son esthétique "Sénégalais". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 44100, 57855, 'Vêtements & Mode', 25, false, '["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-81', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_83', 'Mocassins Cuir Noble Confort Absolu', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mocassins Cuir Noble", cette référence est sublimée par son esthétique "Confort Absolu". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 50100, NULL, 'Chaussures Premium', 40, false, '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE82?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_84', 'Montre Chronographe Impériale', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Montre Chronographe", cette référence est sublimée par son esthétique "Impériale". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 24900, NULL, 'Montres & Accessoires', 55, false, '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-83', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_85', 'Gboma Dessi Poulet Épicé au Gingembre', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Gboma Dessi Poulet", cette référence est sublimée par son esthétique "Épicé au Gingembre". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 7800, 10185, 'Plats & Gastronomie', 70, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_86', 'Chargeur Solaire Extérieur Vlogger Duo', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Chargeur Solaire Extérieur", cette référence est sublimée par son esthétique "Vlogger Duo". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 11500, NULL, 'Importations Trends', 85, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE85?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_87', 'Mangues Mûres Juteuses de Kovié', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mangues Mûres Juteuses", cette référence est sublimée par son esthétique "de Kovié". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 10900, NULL, 'Paniers Frais & Épicerie', 100, false, '["https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_88', 'Affiche Graphique Lomé Skyline Lomé', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Affiche Graphique Lomé", cette référence est sublimée par son esthétique "Skyline Lomé". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 12900, 16905, 'Print-on-Demand Localisé', 115, false, '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-87', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_90', 'Robe de Prestige Élite', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Robe de Prestige", cette référence est sublimée par son esthétique "Élite". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 18200, NULL, 'Vêtements & Mode', 145, false, '["https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE89?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_91', 'Sneakers Sport Prestige', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sneakers Sport", cette référence est sublimée par son esthétique "Prestige". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 19500, 25515, 'Chaussures Premium', 10, false, '["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE90?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_92', 'Lunettes de Soleil Lomé Sunset', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Lunettes de Soleil", cette référence est sublimée par son esthétique "Lomé Sunset". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 36100, NULL, 'Montres & Accessoires', 25, false, '["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'ClickBank', 'https://asime.hop.clickbank.net/?tid=item91', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_93', 'Riz Jollof Festif Feu de Bois', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Riz Jollof Festif", cette référence est sublimée par son esthétique "Feu de Bois". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 11600, NULL, 'Plats & Gastronomie', 40, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_94', 'Anneau Lumineux LED Noise Cancelling', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Anneau Lumineux LED", cette référence est sublimée par son esthétique "Noise Cancelling". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 27500, 36015, 'Importations Trends', 55, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate93', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_95', 'Racines de Gingembre de la Ferme', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Racines de Gingembre", cette référence est sublimée par son esthétique "de la Ferme". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 4100, NULL, 'Paniers Frais & Épicerie', 70, false, '["https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_96', 'Coque Rigide Mobile Togo Patriote', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Coque Rigide Mobile", cette référence est sublimée par son esthétique "Togo Patriote". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 2700, NULL, 'Print-on-Demand Localisé', 85, false, '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-95', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_98', 'Costume Sur-Mesure Confort', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Costume Sur-Mesure", cette référence est sublimée par son esthétique "Confort". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 30400, NULL, 'Vêtements & Mode', 115, false, '["https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-97#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_99', 'Sandales de Cuir Koutammakou', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sandales de Cuir", cette référence est sublimée par son esthétique "Koutammakou". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 33900, NULL, 'Chaussures Premium', 130, false, '["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Amazon', 'https://www.amazon.com/dp/B00AFFILIATE98?tag=asimetogo-20', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_100', 'Portefeuille Raffiné Quartz Pro', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Portefeuille Raffiné", cette référence est sublimée par son esthétique "Quartz Pro". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 12300, 16065, 'Montres & Accessoires', 145, false, '["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'AliExpress', 'https://s.click.aliexpress.com/e/_Daffiliate99', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_101', 'Poisson Grillé Braisé Gourmet', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Poisson Grillé Braisé", cette référence est sublimée par son esthétique "Gourmet". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 3500, NULL, 'Plats & Gastronomie', 10, false, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_102', 'Mini Console Vidéo Cinema Pocket', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Mini Console Vidéo", cette référence est sublimée par son esthétique "Cinema Pocket". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 43500, NULL, 'Importations Trends', 25, false, '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Jumia', 'https://www.jumia.tg/catalog/?q=asime-item-101#affiliate', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_103', 'Sélection d''Épices de Saison', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Sélection d''Épices", cette référence est sublimée par son esthétique "de Saison". Fier d''encourager la production nationale togolaise et le consommer local au quotidien. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 7300, 9555, 'Paniers Frais & Épicerie', 40, false, '["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Boutique en Direct', '', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

INSERT INTO public.products (id, nom, description, prix, prix_barre, categorie, stock, phare, images, partenaire, lien_affilie, seller_type, condition, country_origin, currency_code, is_cross_border_eligible, weight_kg, status)
VALUES ('prod_pop_104', 'Carnet d''Inspirations Édition Limitée', 'Un article d''exception sélectionné méticuleusement par l''équipe d''experts de Asime Togo. De type "Carnet d''Inspirations", cette référence est sublimée par son esthétique "Édition Limitée". Un standard de qualité internationale au service exclusif de notre clientèle locale. Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.', 7500, NULL, 'Print-on-Demand Localisé', 55, false, '["https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'CJ Affiliate', 'https://www.commission-junction.com/member/asime/link-103', 'professionnel', 'neuf', 'TG', 'XOF', true, 0.5, 'actif')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    description = EXCLUDED.description,
    prix = EXCLUDED.prix,
    prix_barre = EXCLUDED.prix_barre,
    categorie = EXCLUDED.categorie,
    stock = EXCLUDED.stock,
    phare = EXCLUDED.phare,
    images = EXCLUDED.images,
    partenaire = EXCLUDED.partenaire,
    lien_affilie = EXCLUDED.lien_affilie,
    updated_at = now();

