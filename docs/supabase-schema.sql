-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Construction Materials Platform
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('user', 'store_owner', 'driver', 'service_worker');
CREATE TYPE vehicle_type AS ENUM ('walking', 'bike', 'moped', 'mini_truck');
CREATE TYPE order_status AS ENUM ('negotiating', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE chat_type AS ENUM ('store', 'service', 'driver');
CREATE TYPE chat_status AS ENUM ('negotiating', 'agreed', 'cancelled');
CREATE TYPE delivery_status AS ENUM ('assigned', 'picked_up', 'in_transit', 'delivered');
CREATE TYPE job_status AS ENUM ('pending', 'quoted', 'accepted', 'in_progress', 'completed');
CREATE TYPE message_type AS ENUM ('text', 'image', 'deal_proposal', 'deal_accepted', 'deal_rejected', 'system', 'price_proposal');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  avatar TEXT,
  vehicle_type vehicle_type,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', 'Хэрэглэгч'),
    new.raw_user_meta_data ->> 'phone',
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'user')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- STORES TABLE
-- ============================================

CREATE TABLE public.stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  logo TEXT,
  rating NUMERIC(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  category TEXT,
  location TEXT,
  phone TEXT,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STORE CATEGORIES TABLE
-- ============================================

CREATE TABLE public.store_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================

CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  unit TEXT DEFAULT 'ширхэг',
  image TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  specifications JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE WORKERS TABLE
-- ============================================

CREATE TABLE public.service_workers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  specialty TEXT NOT NULL,
  description TEXT,
  hourly_rate NUMERIC(10, 2),
  rating NUMERIC(2, 1) DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.service_workers(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  chat_id UUID,
  type TEXT NOT NULL CHECK (type IN ('delivery', 'service')),
  status order_status DEFAULT 'pending',
  expected_price NUMERIC(12, 2),
  agreed_price NUMERIC(12, 2),
  total_amount NUMERIC(12, 2),
  delivery_address TEXT,
  service_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================

CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12, 2) NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHATS TABLE
-- ============================================

CREATE TABLE public.chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.service_workers(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type chat_type NOT NULL,
  status chat_status DEFAULT 'negotiating',
  expected_price NUMERIC(12, 2),
  agreed_price NUMERIC(12, 2),
  service_description TEXT,
  last_message TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key from orders to chats
ALTER TABLE public.orders
  ADD CONSTRAINT orders_chat_id_fkey
  FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE SET NULL;

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================

CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  sender_role TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  message_type message_type DEFAULT 'text',
  deal_amount NUMERIC(12, 2),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DELIVERY TASKS TABLE
-- ============================================

CREATE TABLE public.delivery_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  status delivery_status DEFAULT 'assigned',
  estimated_time INTEGER, -- in minutes
  distance NUMERIC(6, 2), -- in km
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE JOBS TABLE
-- ============================================

CREATE TABLE public.service_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  worker_id UUID REFERENCES public.service_workers(id) ON DELETE SET NULL NOT NULL,
  description TEXT,
  status job_status DEFAULT 'pending',
  quoted_price NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MILESTONES TABLE
-- ============================================

CREATE TABLE public.milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES public.service_jobs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  photo_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Product images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- User avatars bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Chat images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);

-- Store images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('store-images', 'store-images', true);

-- Milestone photos bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('milestone-photos', 'milestone-photos', true);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Stores policies
CREATE POLICY "Stores are viewable by everyone" ON public.stores
  FOR SELECT USING (true);

CREATE POLICY "Store owners can manage their stores" ON public.stores
  FOR ALL USING (auth.uid() = owner_id);

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Store owners can manage their products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- Store categories policies
CREATE POLICY "Store categories are viewable by everyone" ON public.store_categories
  FOR SELECT USING (true);

CREATE POLICY "Store owners can manage their categories" ON public.store_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = store_categories.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- Service workers policies
CREATE POLICY "Service workers are viewable by everyone" ON public.service_workers
  FOR SELECT USING (true);

CREATE POLICY "Workers can manage their profile" ON public.service_workers
  FOR ALL USING (auth.uid() = profile_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = driver_id OR
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = orders.store_id
      AND stores.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.service_workers
      WHERE service_workers.id = orders.worker_id
      AND service_workers.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants can update orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() = driver_id OR
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = orders.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- Order items policies
CREATE POLICY "Order items are viewable by order participants" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid() OR
        orders.driver_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.stores
          WHERE stores.id = orders.store_id
          AND stores.owner_id = auth.uid()
        )
      )
    )
  );

-- Chats policies
CREATE POLICY "Users can view their chats" ON public.chats
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = driver_id OR
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = chats.store_id
      AND stores.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.service_workers
      WHERE service_workers.id = chats.worker_id
      AND service_workers.profile_id = auth.uid()
    )
  );

-- Chat messages policies
CREATE POLICY "Chat participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_messages.chat_id
      AND (
        chats.user_id = auth.uid() OR
        chats.driver_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.stores
          WHERE stores.id = chats.store_id
          AND stores.owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Chat participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Delivery tasks policies
CREATE POLICY "Drivers can view their tasks" ON public.delivery_tasks
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their tasks" ON public.delivery_tasks
  FOR UPDATE USING (auth.uid() = driver_id);

-- Service jobs policies
CREATE POLICY "Participants can view jobs" ON public.service_jobs
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.service_workers
      WHERE service_workers.id = service_jobs.worker_id
      AND service_workers.profile_id = auth.uid()
    )
  );

-- Milestones policies
CREATE POLICY "Job participants can view milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_jobs
      WHERE service_jobs.id = milestones.job_id
      AND (
        service_jobs.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.service_workers
          WHERE service_workers.id = service_jobs.worker_id
          AND service_workers.profile_id = auth.uid()
        )
      )
    )
  );

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Product images - public read, store owners write
CREATE POLICY "Product images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Store owners can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.owner_id = auth.uid()
    )
  );

-- Avatars - public read, users can upload own
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Chat images - accessible to chat participants
CREATE POLICY "Chat images are accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-images');

CREATE POLICY "Users can upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images' AND
    auth.uid() IS NOT NULL
  );

-- Store images - public read, store owners write
CREATE POLICY "Store images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-images');

CREATE POLICY "Store owners can upload store images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'store-images' AND
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.owner_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_store_id ON public.orders(store_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_chats_store_id ON public.chats(store_id);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_delivery_tasks_driver_id ON public.delivery_tasks(driver_id);
CREATE INDEX idx_delivery_tasks_status ON public.delivery_tasks(status);
CREATE INDEX idx_service_workers_profile_id ON public.service_workers(profile_id);
CREATE INDEX idx_service_jobs_worker_id ON public.service_jobs(worker_id);
CREATE INDEX idx_milestones_job_id ON public.milestones(job_id);
CREATE INDEX idx_store_categories_store_id ON public.store_categories(store_id);
CREATE INDEX idx_store_categories_name ON public.store_categories(name);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_tasks_updated_at BEFORE UPDATE ON public.delivery_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_jobs_updated_at BEFORE UPDATE ON public.service_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_workers_updated_at BEFORE UPDATE ON public.service_workers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_categories_updated_at BEFORE UPDATE ON public.store_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
