alter table articles
  add column if not exists inline_image text,
  add column if not exists inline_image_credit text;
