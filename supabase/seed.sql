-- Seed catalog for Mello. Run after schema.sql. Prices are in paisa.
insert into public.products (slug, title, description, price, mrp, image_url, images, sizes, rating, reviews_count, badge, best_price_note, category)
values
  (
    'crisp-white-tee',
    'Crisp White Tee',
    'Clean look. Breathable fabric for everyday wear.',
    54900, 119900,
    'https://images.unsplash.com/photo-1589902860314-e910697dea18?auto=format&fit=crop&q=80&w=687',
    array[
      'https://images.unsplash.com/photo-1589902860314-e910697dea18?auto=format&fit=crop&q=80&w=687',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=687',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=687'
    ],
    array['S','M','L','XL'], 4.6, 195, 'TRENDING', 'Best price ₹499', 'tshirt'
  ),
  (
    'classic-black-tee',
    'Classic Black Tee',
    'Timeless. Essential black tee for any wardrobe.',
    49900, 99900,
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=687',
    array[
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=687',
      'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=687'
    ],
    array['S','M','L','XL'], 4.8, 230, 'BEST SELLER', 'Best price ₹449', 'tshirt'
  ),
  (
    'royal-blue-tee',
    'Royal Blue Tee',
    'Vibrant. Stand out with this bold royal blue.',
    54900, 119900,
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=687',
    array[
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=687',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=687'
    ],
    array['S','M','L','XL'], 4.5, 142, 'NEW', 'Best price ₹499', 'tshirt'
  )
on conflict (slug) do nothing;

-- To make yourself an admin after registering, run (replace the email):
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
