-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ITEMS TABLE
create table public.items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
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
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
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
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.swap_requests enable row level security;
alter table public.messages enable row level security;

-- PROFILES RLS Policies
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- ITEMS RLS Policies
create policy "Allow public read access to items" on public.items
  for select using (true);

create policy "Allow authenticated users to insert items" on public.items
  for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own items" on public.items
  for update using (auth.uid() = user_id);

create policy "Allow users to delete their own items" on public.items
  for delete using (auth.uid() = user_id);

-- SWAP REQUESTS RLS Policies
create policy "Allow users to read swaps they are involved in" on public.swap_requests
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Allow authenticated users to create swap requests" on public.swap_requests
  for insert with check (auth.uid() = sender_id);

create policy "Allow users to update swaps they are involved in" on public.swap_requests
  for update using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- MESSAGES RLS Policies
create policy "Allow users to read messages in their swaps" on public.messages
  for select using (
    exists (
      select 1 from public.swap_requests
      where swap_requests.id = messages.swap_request_id
      and (swap_requests.sender_id = auth.uid() or swap_requests.receiver_id = auth.uid())
    )
  );

create policy "Allow users to insert messages in their swaps" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.swap_requests
      where swap_requests.id = messages.swap_request_id
      and (swap_requests.sender_id = auth.uid() or swap_requests.receiver_id = auth.uid())
    )
  );

-- Trigger to automatically create a profile after user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
