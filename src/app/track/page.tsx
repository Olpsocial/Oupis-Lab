"use client";

import { useState, useEffect, Suspense } from "react";
import Header from "../components/header";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Search, Package, Calendar, MapPin, Phone, CreditCard, XCircle, CheckCircle2, Clock, Truck, ShoppingBag, Edit3, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Define the steps and their corresponding status codes
const stepConfig = [
  { status: 'pending', label: "Chờ xác nhận", icon: Clock, desc: "Đơn hàng đang chờ cửa hàng xác nhận." },
  { status: 'processing', label: "Đang đóng gói", icon: Package, desc: "Sản phẩm đang được chuẩn bị và đóng gói." },
  { status: 'shipping', label: "Đang giao", icon: Truck, desc: "Shipper đang trên đường giao đến bạn." },
  { status: 'completed', label: "Hoàn thành", icon: CheckCircle2, desc: "Giao hàng thành công." },
];

const getStatusIndex = (status: string) => {
  if (!status) return 0;
  const s = status.toLowerCase();
  const map: Record<string, number> = {
    'pending': 0,
    'processing': 1,
    'shipping': 2,
    'completed': 3,
    'cancelled': -1
  };
  return map[s] ?? 0;
};

// Định nghĩa kiểu dữ liệu cho Order
type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  variant?: string;
  product_id?: string;
  image_url?: string;
  products?: {
    id: string;
    // We try to get image from different fields just in case
    images?: string[];
    image_url?: string;
    slug?: string;
  } | null;
};

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  payment_method: string;
  total_amount: number;
  status: string;
  user_id?: string;
};

function TrackPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    payment_method: ""
  });
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useCart();
  const [recentPhones, setRecentPhones] = useState<string[]>([]);

  useEffect(() => {
    // Load recent phones from local storage
    const stored = localStorage.getItem("track_recent_phones");
    if (stored) {
      try {
        setRecentPhones(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing recent phones", e);
      }
    }
  }, []);

  const saveRecentPhone = (phone: string) => {
    // Check if valid phone (simple check: mostly digits, length 9-12)
    const cleanPhone = phone.trim();
    if (!/^\d{9,12}$/.test(cleanPhone)) return;

    setRecentPhones(prev => {
      const newList = [cleanPhone, ...prev.filter(p => p !== cleanPhone)].slice(0, 5); // Max 5 items
      localStorage.setItem("track_recent_phones", JSON.stringify(newList));
      return newList;
    });
  };

  const removeRecentPhone = (phone: string) => {
    setRecentPhones(prev => {
      const newList = prev.filter(p => p !== phone);
      localStorage.setItem("track_recent_phones", JSON.stringify(newList));
      return newList;
    });
  };

  const supabase = createClient();

  const [isInitialized, setIsInitialized] = useState(false);

  // Perform backend search
  const performSearch = async (term: string) => {
    setLoading(true);
    setOrders(null);
    setHasSearched(true);

    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term);

      if (isUUID) {
        query = query.eq('id', term);
      } else {
        query = query.ilike('phone', `%${term}%`);
        saveRecentPhone(term);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(data);
      } else {
        toast.info("Không tìm thấy đơn hàng nào.");
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      toast.error("Có lỗi xảy ra khi tra cứu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOneOrder = async (orderId: string) => {
    if (orders) {
      const existing = orders.find(o => o.id === orderId);
      if (existing) {
        setSelectedOrder(existing);
        return;
      }
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setSelectedOrder(data);
    } catch (error) {
      console.error("Err fetch one:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = searchParams.get('q');
    const orderId = searchParams.get('order');

    if (q) {
      if (searchTerm !== q) setSearchTerm(q);
      if (!orders) {
        performSearch(q);
      }
    }

    if (orderId) {
      if (selectedOrder?.id !== orderId) {
        fetchOneOrder(orderId);
      }
    } else {
      if (selectedOrder) setSelectedOrder(null);
    }

    setIsInitialized(true);
  }, [searchParams]);

  useEffect(() => {
    if (user && isInitialized && !searchParams.get('q') && !searchParams.get('order')) {
      fetchUserOrders();
    }
  }, [user, isInitialized, searchParams]);

  useEffect(() => {
    if (selectedOrder) {
      fetchOrderItems(selectedOrder.id);

      // Đăng ký nhận thông báo thay đổi tức thì (Realtime)
      const channel = supabase
        .channel(`order-changes-${selectedOrder.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${selectedOrder.id}`,
          },
          (payload) => {
            console.log('Đơn hàng đã cập nhật realtime:', payload.new);
            setSelectedOrder(payload.new as Order);
            toast.info(`Trạng thái đơn hàng của bạn đã thay đổi thành: ${getStatusLabel(payload.new.status)}`);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setOrderItems([]);
    }
  }, [selectedOrder]);

  const fetchOrderItems = async (orderId: string) => {
    setLoadingItems(true);
    try {
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;

      if (!items || items.length === 0) {
        setOrderItems([]);
        return;
      }

      // Collect product names for "soft join" if product_id is missing
      const productNamesToFetch = items
        .filter(item => !item.product_id && !item.products)
        .map(item => item.product_name);

      let productMap: Record<string, any> = {};

      if (productNamesToFetch.length > 0) {
        // Fetch products by name
        const { data: products } = await supabase
          .from('products')
          .select('id, name, images')
          .in('name', productNamesToFetch);

        if (products) {
          products.forEach(p => {
            productMap[p.name] = p;
          });
        }
      }

      // Merge data
      const enrichedItems = items.map(item => {
        // If we have explicit product_id (future orders), it's good (though logic above doesn't fetch 'products' relation yet in this simple select, unless we used the join syntax. 
        // But since we reverted join syntax due to error, we rely on this manual patch or manual fetch if we had product_id.)

        // Actually, if we have product_id but no relation loaded, we might want to fetch that too. 
        // For simplicity, let's just match by Name which is robust for this specific "snapshot" issue.
        const matchedProduct = productMap[item.product_name];

        return {
          ...item,
          // Fallback to matched product if current item lacks info
          product_id: item.product_id || matchedProduct?.id,
          // Use matched image if item has no image_url
          image_url: item.image_url || matchedProduct?.images?.[0]
        };
      });

      setOrderItems(enrichedItems);
    } catch (e) {
      console.error("Lỗi lấy chi tiết đơn hàng:", e);
    } finally {
      setLoadingItems(false);
    }
  };

  const startEditing = () => {
    if (!selectedOrder) return;
    setEditForm({
      customer_name: selectedOrder.customer_name,
      phone: selectedOrder.phone,
      address: selectedOrder.address,
      payment_method: selectedOrder.payment_method
    });
    setIsEditing(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          customer_name: editForm.customer_name,
          phone: editForm.phone,
          address: editForm.address,
          payment_method: editForm.payment_method
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      setSelectedOrder({
        ...selectedOrder,
        ...editForm
      });
      setIsEditing(false);
      toast.success("Cập nhật thông tin đơn hàng thành công!");
    } catch (e: any) {
      toast.error("Lỗi cập nhật: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      setSelectedOrder({
        ...selectedOrder,
        status: 'cancelled'
      });
      toast.success("Đã hủy đơn hàng thành công!");
    } catch (e: any) {
      toast.error("Lỗi hủy đơn: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data);
      setHasSearched(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Vui lòng nhập mã đơn hoặc số điện thoại");
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set('q', searchTerm.trim());
    params.delete('order');
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'shipping': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing': return 'text-orange-600 bg-orange-100 border-orange-200';
      default: return 'text-stone-500 bg-stone-50 border-stone-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang đóng gói';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-body pb-32">
      <Header />

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-brand-brown font-hand">
            {user ? "Lịch Sử Đơn Hàng" : "Tra Cứu Đơn Hàng"}
          </h1>
          <p className="text-stone-500 text-sm">
            {user ? `Chào mừng ${user.email}, đây là các đơn hàng của bạn.` : "Nhập Mã đơn hàng (UUID) hoặc Số điện thoại đặt hàng"}
          </p>
        </div>

        {/* Search Box (Always show to allow tracking other orders) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-brand-terracotta focus:ring-4 focus:ring-brand-terracotta/10 transition-all"
              placeholder="VD: 0912345678 hoặc mã đơn..."
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-brand-terracotta text-white px-4 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Tìm kiếm"}
            </button>
          </form>

          {/* Recent Phone Suggestions */}
          {recentPhones.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-stone-400">Đã nhập gần đây:</span>
              {recentPhones.map((phone) => (
                <button
                  key={phone}
                  onClick={() => {
                    setSearchTerm(phone);
                    const params = new URLSearchParams(searchParams);
                    params.set('q', phone);
                    params.delete('order');
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="px-3 py-1 bg-stone-100 hover:bg-orange-100 hover:text-orange-700 text-stone-600 rounded-full text-xs font-medium transition-colors border border-stone-200 flex items-center gap-1 group"
                >
                  <Phone size={10} className="text-stone-400 group-hover:text-orange-500" />
                  {phone}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentPhone(phone);
                    }}
                    className="ml-1 p-0.5 rounded-full hover:bg-orange-200 text-stone-400 hover:text-orange-700"
                  >
                    <X size={10} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="max-w-3xl mx-auto">

          {/* Case: List of orders */}
          {orders && orders.length > 0 && !selectedOrder && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-bold text-brand-brown mb-4 px-2 flex items-center gap-2">
                <ShoppingBag className="text-brand-terracotta" size={20} />
                {user ? "Đơn hàng của bạn:" : `Tìm thấy ${orders.length} đơn hàng:`}
              </h3>
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('order', order.id);
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm hover:border-brand-terracotta/50 hover:shadow-md cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(order.status).split(' ')[1]}`}>
                      <Package className={getStatusColor(order.status).split(' ')[0]} size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors">#{order.id.slice(0, 8)}...</p>
                      <p className="text-xs text-stone-500">Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <p className="text-sm font-bold text-brand-terracotta mt-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Case: Single Order Detail View */}
          {selectedOrder && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Back button if came from list */}
              {((orders && orders.length > 1) || user) && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('order');
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="text-stone-500 text-sm hover:text-brand-terracotta mb-4 flex items-center gap-1 group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Quay lại danh sách
                </button>
              )}

              <div className="bg-white rounded-3xl border border-orange-100 shadow-xl shadow-orange-50/50 overflow-hidden">
                {/* Order Header */}
                <div className="bg-orange-50/30 p-6 border-b border-orange-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-brand-brown">Đơn hàng #{selectedOrder.id.slice(0, 8)}</h2>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 uppercase ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status === 'cancelled' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <p className="text-stone-500 text-sm flex items-center gap-2">
                      <Calendar size={14} />
                      Đặt ngày: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 mb-1">Tổng thanh toán</p>
                    <p className="text-2xl font-bold text-brand-terracotta">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.total_amount)}
                    </p>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Info */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-brand-brown flex items-center gap-2">
                          <MapPin size={18} className="text-brand-terracotta" />
                          Thông tin nhận hàng
                        </h3>
                        {selectedOrder.status === 'pending' && !isEditing && (
                          <button
                            onClick={startEditing}
                            className="text-[10px] font-bold text-brand-terracotta flex items-center gap-1 hover:underline"
                          >
                            <Edit3 size={12} /> Chỉnh sửa thông tin
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Họ tên người nhận</label>
                            <input
                              value={editForm.customer_name}
                              onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-orange-50/20 text-sm focus:outline-none focus:border-brand-terracotta"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Số điện thoại</label>
                            <input
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-orange-50/20 text-sm focus:outline-none focus:border-brand-terracotta"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Địa chỉ chi tiết</label>
                            <textarea
                              value={editForm.address}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-orange-50/20 text-sm focus:outline-none focus:border-brand-terracotta resize-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-stone-50/50 p-4 rounded-2xl space-y-2 text-sm text-stone-600 border border-stone-100">
                          <p className="font-bold text-brand-brown">{selectedOrder.customer_name}</p>
                          <p className="flex items-center gap-2"><Phone size={14} /> {selectedOrder.phone}</p>
                          <p className="leading-relaxed border-t border-stone-200 pt-2 mt-2">{selectedOrder.address}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-brand-brown mb-3 flex items-center gap-2">
                        <CreditCard size={18} className="text-brand-terracotta" />
                        Thanh toán
                      </h3>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setEditForm({ ...editForm, payment_method: 'COD' })}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${editForm.payment_method === 'COD' ? 'bg-brand-terracotta text-white border-brand-terracotta' : 'bg-white text-stone-500 border-stone-200'}`}
                          >
                            COD (Tiền mặt)
                          </button>
                          <button
                            onClick={() => setEditForm({ ...editForm, payment_method: 'BANKING' })}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${editForm.payment_method === 'BANKING' ? 'bg-brand-terracotta text-white border-brand-terracotta' : 'bg-white text-stone-500 border-stone-200'}`}
                          >
                            Chuyển khoản
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-3 bg-stone-50/50 rounded-2xl text-sm font-medium text-stone-700 border border-stone-100">
                          {selectedOrder.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản / VietQR'}
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleUpdateOrder}
                          disabled={isSubmitting}
                          className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md active:scale-95"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Lưu thay đổi</>}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          disabled={isSubmitting}
                          className="px-6 bg-stone-100 text-stone-500 font-bold py-3 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : selectedOrder.status === 'pending' && (
                      <div className="pt-2">
                        <button
                          onClick={handleCancelOrder}
                          disabled={isSubmitting}
                          className="w-full bg-red-50 text-red-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-red-100 hover:bg-red-100 transition-all active:scale-95 px-4"
                        >
                          <Trash2 size={16} /> Hủy đơn hàng này
                        </button>
                        <p className="text-[10px] text-stone-400 text-center mt-2 italic px-4">
                          * Bạn chỉ có thể chỉnh sửa hoặc hủy đơn khi cửa hàng chưa bắt đầu giao hàng.
                        </p>
                      </div>
                    )}

                    {/* HIỂN THỊ DANH SÁCH SẢN PHẨM */}
                    <div className="pt-4 border-t border-stone-100 mt-6">
                      <h3 className="font-bold text-brand-brown mb-3 text-sm uppercase tracking-wider">Sản phẩm đã đặt:</h3>
                      {loadingItems ? (
                        <div className="animate-pulse space-y-2">
                          <div className="h-10 bg-stone-100 rounded-lg"></div>
                          <div className="h-10 bg-stone-100 rounded-lg"></div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex gap-4 items-start bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                              {/* Image Thumbnail */}
                              <div className="w-16 h-16 bg-white rounded-lg border border-stone-100 overflow-hidden shrink-0 relative flex items-center justify-center text-stone-300">
                                {item.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ShoppingBag size={20} />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <Link
                                  href={item.product_id ? `/shop/${item.product_id}` : '#'}
                                  className={`text-sm font-bold text-brand-brown leading-tight block mb-1 hover:text-brand-terracotta transition-colors ${!item.product_id ? 'pointer-events-none' : ''}`}
                                >
                                  {item.product_name}
                                </Link>
                                <p className="text-xs text-stone-400">SL: {item.quantity} x {new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>
                              </div>
                              <div className="text-right ml-2 shrink-0">
                                <p className="text-sm font-black text-brand-terracotta">
                                  {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Timeline */}
                  <div>
                    <h3 className="font-bold text-brand-brown mb-4">Trạng thái đơn hàng</h3>
                    {selectedOrder.status === 'cancelled' ? (
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                        <XCircle size={40} className="text-red-500 mx-auto mb-2" />
                        <p className="font-bold text-red-700">Đơn hàng đã bị hủy</p>
                        <p className="text-red-600 text-xs mt-1">Vui lòng liên hệ CSKH nếu có nhầm lẫn.</p>
                      </div>
                    ) : (
                      <div className="relative pl-2 pt-2">
                        {stepConfig.map((step, idx) => {
                          const currentStatus = (selectedOrder.status || 'pending').toLowerCase();
                          const currentIdx = getStatusIndex(currentStatus);

                          // Logic xác định trạng thái của từng bước
                          const isPast = idx < currentIdx;
                          const isCurrent = idx === currentIdx;
                          const isFuture = idx > currentIdx;
                          const isDone = currentStatus === 'completed';

                          // Màu sắc icon dựa trên trạng thái
                          const isActive = isPast || isCurrent || isDone;

                          return (
                            <div key={step.status} className="flex gap-6 mb-10 last:mb-0 relative z-10">
                              {/* Connecting Line */}
                              {idx !== stepConfig.length - 1 && (
                                <div className={`absolute left-[17px] top-10 bottom-[-40px] w-[3px] rounded-full ${isPast || isDone ? 'bg-orange-600' : 'bg-stone-100'}`} />
                              )}

                              {/* Icon Bubble */}
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-700 shadow-sm ${isActive
                                ? 'bg-orange-600 border-orange-600 text-white'
                                : 'bg-white border-stone-200 text-stone-300'
                                } ${isCurrent && !isDone ? 'ring-8 ring-orange-100 scale-110' : ''}`}>
                                <step.icon size={18} className={isCurrent && !isDone ? 'animate-pulse' : ''} />
                              </div>

                              {/* Content */}
                              <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-1 grayscale'}`}>
                                <p className={`font-bold text-base leading-none mb-1.5 ${isCurrent && !isDone ? 'text-orange-700' : 'text-brand-brown'}`}>
                                  {step.label}
                                </p>
                                <p className="text-xs text-stone-500 max-w-[220px] leading-relaxed">
                                  {step.desc}
                                </p>

                                {isCurrent && !isDone && (
                                  <span className="inline-block mt-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-md animate-bounce uppercase tracking-tighter shadow-sm border border-orange-200">
                                    Đang thực hiện
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {hasSearched && (!orders || orders.length === 0) && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-stone-400" size={32} />
              </div>
              <h3 className="font-bold text-stone-600 mb-1">Không tìm thấy đơn hàng</h3>
              <p className="text-stone-400 text-sm">Vui lòng kiểm tra lại mã đơn hoặc số điện thoại.</p>
            </div>
          )}

          {/* Loading State */}
          {loading && !orders && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-brand-terracotta" size={40} />
              <p className="text-sm font-medium text-stone-500">Đang tải dữ liệu...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-terracotta" size={40} />
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
