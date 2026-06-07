-- Create doctors table
create table if not exists public.doctores (
  id bigint primary key generated always as identity,
  nombre text not null,
  especialidad_principal text not null,
  frase text,
  acerca_de text,
  imagen_url text,
  estadisticas jsonb default '{"experience":"","patients":"","awards":"","publications":""}'::jsonb,
  rating numeric(2,1) default 0,
  num_resenas integer default 0,
  especialidades text[] default '{}',
  idiomas text[] default '{}',
  disponibilidad text,
  hospital text,
  direccion text,
  experiencia jsonb default '[]'::jsonb,
  educacion jsonb default '[]'::jsonb,
  certificaciones jsonb default '[]'::jsonb,
  premios jsonb default '[]'::jsonb,
  testimonios jsonb default '[]'::jsonb,
  publicado boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add user_id to articles for author tracking
alter table public.articulos add column if not exists autor_id uuid references public.perfiles(id);

-- Enable RLS
alter table public.doctores enable row level security;

-- RLS: anyone can read published doctors
create policy "Anyone can read published doctors"
  on public.doctores for select
  using (publicado = true);

-- RLS: admins can manage doctors
create policy "Admins can manage doctors"
  on public.doctores for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'administrador'
    )
  );

-- RLS: admins can read all articles (including unpublished)
drop policy if exists "Anyone can read published articles" on public.articulos;
create policy "Anyone can read published articles"
  on public.articulos for select
  using (publicado = true);

create policy "Admins can read all articles"
  on public.articulos for select
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'administrador'
    )
  );

-- Insert sample doctors from static data
insert into public.doctores (nombre, especialidad_principal, frase, acerca_de, imagen_url, estadisticas, rating, num_resenas, especialidades, idiomas, disponibilidad, hospital, direccion, experiencia, educacion, certificaciones, premios, testimonios, publicado) values
(
  'Dr. Sarah Jenkins',
  'Cardiology',
  'Healing the physical heart is my medical duty, but bringing peace to the anxious soul is my true calling.',
  'Dr. Sarah Jenkins is a board-certified cardiologist with over 15 years of experience in interventional cardiology. She completed her medical degree at Johns Hopkins University and her fellowship at the Mayo Clinic. Dr. Jenkins is dedicated to combining cutting-edge cardiac care with compassionate patient relationships.',
  'AB6AXuAEVoMDLvTzpuk46GOo8lj9JgBORU1iZwCf4sWnvtHUko5w8etAQWu5K9UGeKaueOECOKjZGhwHwnEpPpIHJJLppbhavNhCqkN7uDZxfmFzV8wfw2lg2cJLm82aF8qjSvvbZ19gJ6STAhCWjNekq-qGbWm1Lyw6ZL5rowp3w0rek9Mgj1PikNrhA8odQVp9fHNkiUBXDIR6Sugo_HbcjEm-OKFs-8t5lhAWUu-vE18I4afS_Uo-quEmNLDcLO_nba5UlyyaArZp-Wc',
  '{"experience":"15+","patients":"10,000+","awards":"12","publications":"45+"}'::jsonb,
  4.8, 128,
  array['Cardiology', 'Interventional Cardiology', 'Preventive Cardiology'],
  array['English', 'Spanish'],
  'Monday — Friday, 8:00 AM — 4:00 PM',
  'IKMA Heart Institute',
  '123 Healing Way, Suite 400, New York, NY 10001',
  '[{"period":"2018 — Present","title":"Chief of Cardiology","org":"IKMA Heart Institute","icon":"business"},{"period":"2012 — 2018","title":"Senior Cardiologist","org":"Mercy Medical Center","icon":"local_hospital"},{"period":"2008 — 2012","title":"Resident Physician","org":"University Teaching Hospital","icon":"school"}]'::jsonb,
  '[{"degree":"Doctor of Medicine","school":"Johns Hopkins University"},{"degree":"Internal Medicine Residency","school":"Mayo Clinic"},{"degree":"Cardiology Fellowship","school":"Cleveland Clinic"}]'::jsonb,
  '[{"cert":"Board Certified — Cardiology","issuer":"American Board of Internal Medicine"},{"cert":"Advanced Cardiac Life Support","issuer":"American Heart Association"},{"cert":"Medical License","issuer":"State Medical Board of New York"}]'::jsonb,
  '[{"title":"Excellence in Cardiac Care Award","org":"International Medical Association","year":"2023"},{"title":"Top Physician Honor","org":"Healthcare Leadership Forum","year":"2021"},{"title":"Compassionate Care Recognition","org":"IKMA Foundation","year":"2020"}]'::jsonb,
  '[{"name":"Maria G.","type":"Cardiology Patient","text":"Dr. Jenkins transformed my life with her care. She took the time to explain every step of my treatment plan."},{"name":"Robert K.","type":"Heart Surgery Patient","text":"The team at IKMA is exceptional. Dr. Jenkins brought both expertise and genuine compassion to my care."},{"name":"Sarah T.","type":"Preventive Care Patient","text":"From the first consultation to follow-up, every interaction was professional, warm, and thorough."}]'::jsonb,
  true
),
(
  'Dr. Marcus Chen',
  'Pediatrics',
  'Every child holds a promise for the future. We provide the care they need to realize that promise fully.',
  'Dr. Marcus Chen is a compassionate pediatrician specializing in adolescent medicine and developmental pediatrics. He earned his medical degree from Stanford University and completed his residency at Boston Children''s Hospital.',
  'AB6AXuAfGdBCg-iG913EqelruRwaNM-8HyF5Nxj2n9txUYVU0Irx_FUOLiq7_taCXGqo_7iO_NsXe8cKZv_l1EPb58JKfou2LswTqY0_wnvRE_CD0q9YRuZnj9gq_ThAppsyO7rXeYXbs3urywmvmiqBMlhpYL2FnHq1yforqQvuR_b-qnvu-0mP5kHyA2xnRC7GbIqYm5MwkcOPe5iTeePAWTwx9zwNkelV0wkYgxLbVYb1S3P8kBdjkd5wnU6eyz2bxhwn66h4785Sz4k',
  '{"experience":"12+","patients":"8,000+","awards":"8","publications":"20+"}'::jsonb,
  4.9, 156,
  array['Pediatrics', 'Adolescent Medicine', 'Developmental Pediatrics'],
  array['English', 'Mandarin'],
  'Monday — Friday, 9:00 AM — 5:00 PM',
  'IKMA Children''s Center',
  '456 Wellness Ave, Suite 200, New York, NY 10002',
  '[{"period":"2019 — Present","title":"Lead Pediatrician","org":"IKMA Children''s Center","icon":"business"},{"period":"2013 — 2019","title":"Staff Pediatrician","org":"Boston Children''s Hospital","icon":"local_hospital"},{"period":"2009 — 2013","title":"Pediatric Resident","org":"Boston Children''s Hospital","icon":"school"}]'::jsonb,
  '[{"degree":"Doctor of Medicine","school":"Stanford University"},{"degree":"Pediatric Residency","school":"Boston Children''s Hospital"},{"degree":"Adolescent Medicine Fellowship","school":"UCSF Benioff Children''s Hospital"}]'::jsonb,
  '[{"cert":"Board Certified — Pediatrics","issuer":"American Board of Pediatrics"},{"cert":"Neonatal Resuscitation Program","issuer":"American Academy of Pediatrics"},{"cert":"Pediatric Advanced Life Support","issuer":"American Heart Association"}]'::jsonb,
  '[{"title":"Excellence in Pediatric Care Award","org":"American Academy of Pediatrics","year":"2023"},{"title":"Community Health Champion","org":"IKMA Foundation","year":"2021"},{"title":"Outstanding Educator Award","org":"Medical Teachers Association","year":"2019"}]'::jsonb,
  '[{"name":"Lisa M.","type":"Parent","text":"Dr. Chen is amazing with kids. My daughter actually looks forward to her checkups now!"},{"name":"James P.","type":"Adolescent Patient","text":"Dr. Chen made me feel comfortable talking about things I was nervous about."},{"name":"Amanda R.","type":"Parent","text":"The care and patience Dr. Chen shows is remarkable. Highly recommend."}]'::jsonb,
  true
),
(
  'Dr. Elena Rodriguez',
  'Oncology',
  'Walking alongside families during their toughest battles is a profound privilege. We fight with science and support with faith.',
  'Dr. Elena Rodriguez is a medical oncologist specializing in breast cancer and hematologic malignancies. She received her training at MD Anderson Cancer Center and is committed to holistic, patient-centered cancer care.',
  'AB6AXuBvJ_sDLH8kRg-mitYacKkeltAoQ0a1YB1jm2GNDwKcS4quE4CCwkirBnlIXfs-M_A1vAJYGQzmMlSON4VVL9zXuzy2KMj5kTVtWS2DbePBei-wBKDWD4EK35XS1ypWFfvVvp9p_tBwK-AnSZvY7EutSunVCIPMqzJcEXwYPZFHyJCa7PWMHCqI5iuom1cr5ocN9InU_JvTMgAQbfc6oFK9q0Vkp7j-avr7yS6ZGw4IIgwLcnmrXsXRgK2ylFJOxc5GcDP5BwzNbYo',
  '{"experience":"18+","patients":"7,500+","awards":"15","publications":"60+"}'::jsonb,
  4.9, 198,
  array['Oncology', 'Hematology', 'Breast Cancer'],
  array['English', 'Portuguese', 'Spanish'],
  'Monday — Friday, 8:30 AM — 4:30 PM',
  'IKMA Cancer Center',
  '789 Hope Boulevard, New York, NY 10003',
  '[{"period":"2017 — Present","title":"Senior Oncologist","org":"IKMA Cancer Center","icon":"business"},{"period":"2011 — 2017","title":"Staff Oncologist","org":"MD Anderson Cancer Center","icon":"local_hospital"},{"period":"2007 — 2011","title":"Oncology Fellow","org":"MD Anderson Cancer Center","icon":"school"}]'::jsonb,
  '[{"degree":"Doctor of Medicine","school":"University of Texas Southwestern"},{"degree":"Internal Medicine Residency","school":"Brigham and Women''s Hospital"},{"degree":"Hematology-Oncology Fellowship","school":"MD Anderson Cancer Center"}]'::jsonb,
  '[{"cert":"Board Certified — Oncology","issuer":"American Board of Internal Medicine"},{"cert":"Hematology Certification","issuer":"American Board of Pathology"},{"cert":"Chemotherapy Provider","issuer":"ASCO"}]'::jsonb,
  '[{"title":"Women in Medicine Leadership Award","org":"Healthcare Women''s Alliance","year":"2023"},{"title":"Excellence in Clinical Research","org":"ASCO","year":"2021"},{"title":"Compassionate Caregiver Award","org":"IKMA Foundation","year":"2020"}]'::jsonb,
  '[{"name":"Patricia L.","type":"Breast Cancer Survivor","text":"Dr. Rodriguez gave me hope when I needed it most. Her expertise and warmth carried me through treatment."},{"name":"Michael D.","type":"Lymphoma Patient","text":"She explained everything clearly and involved me in every decision. Truly exceptional care."},{"name":"Carmen V.","type":"Family Caregiver","text":"Dr. Rodriguez supported not just my mother, but our entire family. We are forever grateful."}]'::jsonb,
  true
),
(
  'Dr. David Osei',
  'Neurology',
  'The complexity of the human mind is a testament to divine design. I seek to restore balance through rigorous care.',
  'Dr. David Osei is a neurologist with expertise in epilepsy and neurodegenerative disorders. He completed his medical training at the University of Ghana and his fellowship at the Cleveland Clinic.',
  'AB6AXuDaielhLpt8F5ZpHLyNvjXoLQ61P7zmx6A9EmmTvVxBepzlBSul6EywbHpcEKNe96UBHgQKKRbO2IKWvbOvJ_6-4ScK2E9qxAk2O3QK4usubN69vWlEpxbfPbHwKkD6PzwmlHzzCQYHTivRGLJpzn4Z2ynMjM3st4XLteasVZtH7VQMQ6ZzbXJnwvp8jwuXkl811SNs-E6Ov7B3_nKzS9azeZyI_SFz9f7aIpx4EkplIpcJQI3oYOrs838yvNs81yHObkG7OAxZEeU',
  '{"experience":"20+","patients":"12,000+","awards":"10","publications":"35+"}'::jsonb,
  4.7, 142,
  array['Neurology', 'Epilepsy', 'Neurodegenerative Disorders'],
  array['English', 'Twi', 'French'],
  'Monday — Friday, 9:00 AM — 5:00 PM',
  'IKMA Neuroscience Institute',
  '321 Brain Science Drive, New York, NY 10004',
  '[{"period":"2016 — Present","title":"Chief of Neurology","org":"IKMA Neuroscience Institute","icon":"business"},{"period":"2010 — 2016","title":"Neurologist","org":"Cleveland Clinic","icon":"local_hospital"},{"period":"2006 — 2010","title":"Neurology Resident","org":"Cleveland Clinic","icon":"school"}]'::jsonb,
  '[{"degree":"Doctor of Medicine","school":"University of Ghana"},{"degree":"Internal Medicine Residency","school":"Korle Bu Teaching Hospital"},{"degree":"Neurology Fellowship","school":"Cleveland Clinic"}]'::jsonb,
  '[{"cert":"Board Certified — Neurology","issuer":"American Board of Psychiatry and Neurology"},{"cert":"Epilepsy Specialist","issuer":"National Association of Epilepsy Centers"},{"cert":"Neurocritical Care","issuer":"United Council for Neurologic Subspecialties"}]'::jsonb,
  '[{"title":"Global Health Impact Award","org":"World Neurology Foundation","year":"2023"},{"title":"Excellence in Epilepsy Care","org":"Epilepsy Foundation","year":"2021"},{"title":"Humanitarian Service Award","org":"IKMA Foundation","year":"2019"}]'::jsonb,
  '[{"name":"David A.","type":"Epilepsy Patient","text":"Dr. Osei helped me gain control of my seizures when other doctors had given up. A true gift."},{"name":"Grace N.","type":"Parkinson''s Caregiver","text":"His patience and deep knowledge made such a difference for my husband''s quality of life."},{"name":"Samuel K.","type":"Neurology Patient","text":"Dr. Osei takes time to listen and truly understands. Best neurologist I''ve ever seen."}]'::jsonb,
  true
);
