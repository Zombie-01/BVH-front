import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Stores from "./pages/Stores";
import Services from "./pages/Services";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// User Detail Pages
import StoreDetail from "./pages/user/StoreDetail";
import ProductDetail from "./pages/user/ProductDetail";
import ServiceDetail from "./pages/user/ServiceDetail";
import OrderDetail from "./pages/user/OrderDetail";
import ChatDetail from "./pages/user/ChatDetail";
import Checkout from "./pages/user/Checkout";

// Driver Pages
import DriverTasks from "./pages/driver/DriverTasks";
import DriverMap from "./pages/driver/DriverMap";
import DriverCompleted from "./pages/driver/DriverCompleted";
import DriverEarnings from "./pages/driver/DriverEarnings";

// Service Worker Pages
import WorkerJobs from "./pages/worker/WorkerJobs";
import WorkerQuotes from "./pages/worker/WorkerQuotes";
import WorkerMilestones from "./pages/worker/WorkerMilestones";
import WorkerRatings from "./pages/worker/WorkerRatings";

// Store Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerProducts from "./pages/owner/OwnerProducts";
import OwnerOrders from "./pages/owner/OwnerOrders";
import OwnerChats from "./pages/owner/OwnerChats";
import OwnerChatDetail from "./pages/owner/OwnerChatDetail";

// Worker Chat Detail
import WorkerChatDetail from "./pages/worker/WorkerChatDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Onboarding */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* User Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route
              path="/stores/:storeId/products/:productId"
              element={<ProductDetail />}
            />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat/:id" element={<ChatDetail />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Driver Routes */}
            <Route path="/driver/tasks" element={<DriverTasks />} />
            <Route path="/driver/tasks/:id" element={<DriverTasks />} />
            <Route path="/driver/map" element={<DriverMap />} />
            <Route path="/driver/completed" element={<DriverCompleted />} />
            <Route path="/driver/earnings" element={<DriverEarnings />} />

            {/* Service Worker Routes */}
            <Route path="/worker/jobs" element={<WorkerJobs />} />
            <Route path="/worker/quotes" element={<WorkerQuotes />} />
            <Route path="/worker/milestones" element={<WorkerMilestones />} />
            <Route path="/worker/ratings" element={<WorkerRatings />} />

            {/* Store Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/products" element={<OwnerProducts />} />
            <Route path="/owner/orders" element={<OwnerOrders />} />
            <Route path="/owner/orders/:id" element={<OwnerOrders />} />
            <Route path="/owner/chats" element={<OwnerChats />} />
            <Route path="/owner/chats/:id" element={<OwnerChatDetail />} />

            {/* Service Worker Chat Route */}
            <Route path="/worker/chats/:id" element={<WorkerChatDetail />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
