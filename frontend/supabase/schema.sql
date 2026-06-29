-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist to start fresh
drop table if exists public.messages cascade;
drop table if exists public.swap_requests cascade;
drop table if exists public.items cascade;
drop table if exists public.profiles cascade;

-- PROFILES TABLE (linked to Clerk user.id text)
create table public.profiles (
  id text primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ITEMS TABLE
create table public.items (
  id uuid default gen_random_uuid() primary key,
  user_id text references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  condition text not null,
  image_url text,
  preferred_trade text,
  status text default 'Available'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint status_check check (status in ('Available', 'Pending', 'Swapped'))
);

-- SWAP REQUESTS TABLE
create table public.swap_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id text references public.profiles(id) on delete cascade not null,
  receiver_id text references public.profiles(id) on delete cascade not null,
  sender_item_id uuid references public.items(id) on delete set null,
  receiver_item_id uuid references public.items(id) on delete cascade not null,
  status text default 'Pending'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint swap_status_check check (status in ('Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'))
);

-- MESSAGES TABLE (for negotiation)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  swap_request_id uuid references public.swap_requests(id) on delete cascade not null,
  sender_id text references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.swap_requests enable row level security;
alter table public.messages enable row level security;

-- Create Open RLS Policies (since Clerk is used for auth and connects via anon key)
create policy "Allow all profiles" on public.profiles for all using (true) with check (true);
create policy "Allow all items" on public.items for all using (true) with check (true);
create policy "Allow all swap_requests" on public.swap_requests for all using (true) with check (true);
create policy "Allow all messages" on public.messages for all using (true) with check (true);

-- Storage bucket setup for item-images
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

-- Storage policies for item-images bucket to allow anyone to upload/read/delete
create policy "Public Access" on storage.objects for select using (bucket_id = 'item-images');
create policy "Allow Uploads" on storage.objects for insert with check (bucket_id = 'item-images');
create policy "Allow Deletes" on storage.objects for delete using (bucket_id = 'item-images');
