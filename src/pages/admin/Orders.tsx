import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  ChevronRight,
  MoreVertical,
  Eye,
  FileText
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Order } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await dataService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const success = await dataService.updateOrderStatus(orderId, newStatus);
      if (success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Orders</h1>
          <p className="text-zinc-500 mt-1.5">Manage and track your customer orders.</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search order number or customer name..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Order</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                   <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 tracking-tight">#{order.orderNumber}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {order.createdAt ? (
                          typeof order.createdAt === 'string' 
                            ? new Date(order.createdAt).toLocaleDateString()
                            : new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString()
                        ) : new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-800 leading-none">{order.shippingAddress.fullName}</span>
                      <span className="text-xs text-zinc-500 mt-1">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase font-black tracking-widest ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    ₹{order.grandTotal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Eye className="w-4 h-4 text-zinc-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Filter className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-zinc-500 font-medium">No orders found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Side Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[70] overflow-y-auto"
            >
              <div className="p-8 space-y-10">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter">Order Detail</h2>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">ID: {selectedOrder.orderNumber}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-xl">
                    <MoreVertical className="w-5 h-5 text-zinc-400" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedOrder.id, status as Order['status'])}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                              selectedOrder.status === status
                              ? getStatusColor(status as any)
                              : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Customer</h3>
                      <div className="p-4 bg-zinc-50 rounded-2xl space-y-1">
                        <p className="font-bold text-zinc-900 leading-tight">{selectedOrder.shippingAddress.fullName}</p>
                        <p className="text-xs text-zinc-500">{selectedOrder.shippingAddress.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Payment</h3>
                      <div className="p-4 bg-zinc-50 rounded-2xl">
                        <p className="text-xs font-bold uppercase text-zinc-500 mb-1">{selectedOrder.paymentMethod}</p>
                        <Badge className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-tighter ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Shipping</h3>
                      <div className="p-4 bg-zinc-50 rounded-2xl text-[10px] text-zinc-500 space-y-1">
                        <p>{selectedOrder.shippingAddress.addressLine1}</p>
                        <p>{selectedOrder.shippingAddress.addressLine2}</p>
                        <p className="font-bold text-zinc-900 uppercase">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Line Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt="" className="h-12 w-12 object-cover rounded-xl border border-zinc-100 shadow-sm" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-tight text-zinc-900 leading-tight line-clamp-2">{item.name}</p>
                            <p className="text-xs text-zinc-400 font-medium">Qty: {item.quantity} × ₹{item.price}</p>
                          </div>
                        </div>
                        <p className="font-black text-zinc-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-3xl p-8 text-white space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-zinc-400 font-medium">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400 font-medium">
                      <span>GST ({(selectedOrder.gstAmount / selectedOrder.total * 100).toFixed(0)}%)</span>
                      <span>₹{selectedOrder.gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400 font-medium">
                      <span>Shipping</span>
                      <span>₹{selectedOrder.shippingCharge.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Total Amount Paid</p>
                      <p className="text-4xl font-black tracking-tighter">₹{selectedOrder.grandTotal.toLocaleString()}</p>
                    </div>
                    <Button variant="accent" size="sm" className="rounded-xl h-10 px-6">
                      <FileText className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
