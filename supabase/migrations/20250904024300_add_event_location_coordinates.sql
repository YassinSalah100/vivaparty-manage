alter table "public"."events" 
add column if not exists "latitude" double precision,
add column if not exists "longitude" double precision;
