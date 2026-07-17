import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bus, Plus, Pencil, Trash2, MapPin, User as UserIcon, Calendar, DollarSign, Search, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Transport() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [routes, setRoutes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [myRoute, setMyRoute] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState(isAdmin ? 'routes' : 'my-route');

  // Search
  const [routeSearch, setRouteSearch] = useState('');
  const [allocationSearch, setAllocationSearch] = useState('');

  // Modals state
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [routeForm, setRouteForm] = useState({ routeName: '', vehicleNumber: '', driverName: '', driverMobile: '', fee: 1500 });

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [allocationForm, setAllocationForm] = useState({ routeId: '', studentId: '', pickupPoint: '', allocationDate: new Date().toISOString().split('T')[0] });

  const [saving, setSaving] = useState(false);
  const [deleteRouteTarget, setDeleteRouteTarget] = useState(null);
  const [deleteAllocTarget, setDeleteAllocTarget] = useState(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [routesRes, allocationsRes, studentsRes] = await Promise.all([
          apiClient.get('/transport/routes'),
          apiClient.get('/transport/allocations'),
          apiClient.get('/students', { params: { page: 0, size: 1000 } })
        ]);
        setRoutes(routesRes.data.data || []);
        setAllocations(allocationsRes.data.data || []);
        setStudents(studentsRes.data.data?.content || []);
      } else {
        const res = await apiClient.get('/transport/my-route');
        setMyRoute(res.data.data);
      }
    } catch (err) {
      if (!isAdmin && err.response?.status === 404) {
        setMyRoute(null);
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch transport details');
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Route
  const handleSaveRoute = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRoute) {
        await apiClient.put(`/transport/routes/${editingRoute.id}`, routeForm);
        toast.success('Route updated successfully');
      } else {
        await apiClient.post('/transport/routes', routeForm);
        toast.success('Route created successfully');
      }
      setRouteModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save route');
    } finally {
      setSaving(false);
    }
  };

  // Delete Route
  const handleDeleteRoute = async () => {
    try {
      await apiClient.delete(`/transport/routes/${deleteRouteTarget.id}`);
      toast.success('Route deleted successfully');
      setDeleteRouteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete route');
    }
  };

  // Save Allocation
  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        routeId: Number(allocationForm.routeId),
        studentId: Number(allocationForm.studentId),
        pickupPoint: allocationForm.pickupPoint,
        allocationDate: allocationForm.allocationDate
      };
      await apiClient.post('/transport/allocations', payload);
      toast.success('Transport route allocated successfully');
      setAllocationModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate route');
    } finally {
      setSaving(false);
    }
  };

  // Delete Allocation
  const handleDeleteAllocation = async () => {
    try {
      await apiClient.delete(`/transport/allocations/${deleteAllocTarget.id}`);
      toast.success('Allocation canceled successfully');
      setDeleteAllocTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete allocation');
    }
  };

  // Filters
  const filteredRoutes = routes.filter(r => 
    r.routeName.toLowerCase().includes(routeSearch.toLowerCase()) || 
    r.vehicleNumber.toLowerCase().includes(routeSearch.toLowerCase())
  );

  const filteredAllocations = allocations.filter(a => 
    a.studentName?.toLowerCase().includes(allocationSearch.toLowerCase()) || 
    a.studentRoll?.toLowerCase().includes(allocationSearch.toLowerCase()) ||
    a.routeName?.toLowerCase().includes(allocationSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Bus className="text-indigo-600 dark:text-indigo-400" />
            Transport Management
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            Manage transit routes, vehicle details, passenger rosters, and logs.
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingRoute(null);
                setRouteForm({ routeName: '', vehicleNumber: '', driverName: '', driverMobile: '', fee: 1500 });
                setRouteModalOpen(true);
              }}
              className="btn btn-indigo flex items-center gap-2"
            >
              <Plus size={16} /> Add Route
            </button>
            <button
              onClick={() => {
                setAllocationForm({ routeId: routes[0]?.id || '', studentId: students[0]?.id || '', pickupPoint: '', allocationDate: new Date().toISOString().split('T')[0] });
                setAllocationModalOpen(true);
              }}
              className="btn btn-emerald flex items-center gap-2"
              disabled={routes.length === 0 || students.length === 0}
            >
              <MapPin size={16} /> Assign Student
            </button>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex border-b border-ink/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'routes'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper'
            }`}
          >
            Bus Routes
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'allocations'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper'
            }`}
          >
            Transit Allocations
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-ink/60 dark:text-paper/60">Fetching transport details...</p>
        </div>
      ) : activeTab === 'my-route' ? (
        <div className="max-w-xl mx-auto">
          {myRoute ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-badge p-6 border border-white/10 shadow-card space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center">
                  <Bus size={24} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">Transit Route Details</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/10 text-green-600">
                    Active Subscription
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">ROUTE NAME</span>
                  <p className="font-semibold text-lg">{myRoute.routeName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">VEHICLE NUMBER</span>
                  <p className="font-semibold text-lg">{myRoute.vehicleNumber || '—'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="h-[1px] bg-ink/10 dark:bg-white/10 my-1" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">DRIVER NAME</span>
                  <p className="font-semibold">{myRoute.driverName || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">DRIVER MOBILE</span>
                  <p className="font-semibold flex items-center gap-1">
                    <Phone size={13} className="text-indigo-500" />
                    {myRoute.driverMobile || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">PICKUP POINT</span>
                  <p className="font-semibold flex items-center gap-1">
                    <MapPin size={13} className="text-amber-500" />
                    {myRoute.pickupPoint || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">MONTHLY CHARGES</span>
                  <p className="font-semibold flex items-center gap-0.5">
                    <DollarSign size={14} className="text-green-500" />
                    {myRoute.fee || '—'}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-badge p-8 border border-white/5 text-center space-y-3">
              <Bus className="mx-auto text-ink/30 dark:text-paper/30" size={48} />
              <h3 className="font-display text-lg font-semibold">No Bus Allocation</h3>
              <p className="text-sm text-ink/60 dark:text-paper/60 max-w-sm mx-auto">
                You are currently not subscribed to any campus transport route. Reach out to the admin office to sign up.
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'routes' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink/40 dark:text-paper/40" />
              <input
                type="text"
                placeholder="Search routes by name or vehicle..."
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
                className="pl-9 input w-full"
              />
            </div>
          </div>

          <div className="glass rounded-badge overflow-hidden border border-ink/5 dark:border-white/5 shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink/5 dark:bg-white/5 text-ink/80 dark:text-paper/85 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Route Name</th>
                    <th className="px-6 py-4">Vehicle Number</th>
                    <th className="px-6 py-4">Driver Name</th>
                    <th className="px-6 py-4">Driver Mobile</th>
                    <th className="px-6 py-4">Monthly Fee</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 dark:divide-white/5 text-sm">
                  {filteredRoutes.length > 0 ? (
                    filteredRoutes.map((route) => (
                      <tr key={route.id} className="hover:bg-ink/[0.01] dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-semibold">{route.routeName}</td>
                        <td className="px-6 py-4">{route.vehicleNumber || '—'}</td>
                        <td className="px-6 py-4">{route.driverName || '—'}</td>
                        <td className="px-6 py-4">{route.driverMobile || '—'}</td>
                        <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                          ${route.fee}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingRoute(route);
                                setRouteForm({ routeName: route.routeName, vehicleNumber: route.vehicleNumber || '', driverName: route.driverName || '', driverMobile: route.driverMobile || '', fee: route.fee });
                                setRouteModalOpen(true);
                              }}
                              className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-indigo-500"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteRouteTarget(route)}
                              className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-ink/50 dark:text-paper/50">
                        No transit routes defined. Click "Add Route" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink/40 dark:text-paper/40" />
              <input
                type="text"
                placeholder="Search allocations by student or route..."
                value={allocationSearch}
                onChange={(e) => setAllocationSearch(e.target.value)}
                className="pl-9 input w-full"
              />
            </div>
          </div>

          <div className="glass rounded-badge overflow-hidden border border-ink/5 dark:border-white/5 shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink/5 dark:bg-white/5 text-ink/80 dark:text-paper/85 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Route Info</th>
                    <th className="px-6 py-4">Pickup Point</th>
                    <th className="px-6 py-4">Allocation Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 dark:divide-white/5 text-sm">
                  {filteredAllocations.length > 0 ? (
                    filteredAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-ink/[0.01] dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-semibold">{alloc.studentName}</td>
                        <td className="px-6 py-4">{alloc.studentRoll}</td>
                        <td className="px-6 py-4">{alloc.routeName} ({alloc.vehicleNumber})</td>
                        <td className="px-6 py-4">{alloc.pickupPoint || '—'}</td>
                        <td className="px-6 py-4">{alloc.allocationDate || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setDeleteAllocTarget(alloc)}
                            className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-red-500"
                            title="Cancel Allocation"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-ink/50 dark:text-paper/50">
                        No student transit allocations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Route Modal */}
      {routeModalOpen && (
        <div className="fixed inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-badge p-6 max-w-md w-full border border-white/10 shadow-card"
          >
            <h3 className="font-display text-lg font-bold mb-4">
              {editingRoute ? 'Edit Transit Route' : 'Add Transit Route'}
            </h3>
            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Route Name</label>
                <input
                  type="text"
                  required
                  value={routeForm.routeName}
                  onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Route 9 - North Campus"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  required
                  value={routeForm.vehicleNumber}
                  onChange={(e) => setRouteForm({ ...routeForm, vehicleNumber: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. DL-1AB-2345"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={routeForm.driverName}
                  onChange={(e) => setRouteForm({ ...routeForm, driverName: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Driver Mobile</label>
                <input
                  type="text"
                  value={routeForm.driverMobile}
                  onChange={(e) => setRouteForm({ ...routeForm, driverMobile: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Monthly Fee ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={routeForm.fee}
                  onChange={(e) => setRouteForm({ ...routeForm, fee: Number(e.target.value) })}
                  className="input w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-indigo"
                >
                  {saving ? 'Saving...' : 'Save Route'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Allocation Modal */}
      {allocationModalOpen && (
        <div className="fixed inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-badge p-6 max-w-md w-full border border-white/10 shadow-card"
          >
            <h3 className="font-display text-lg font-bold mb-4">Assign Student to Route</h3>
            <form onSubmit={handleSaveAllocation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Select Student</label>
                <select
                  required
                  value={allocationForm.studentId}
                  onChange={(e) => setAllocationForm({ ...allocationForm, studentId: e.target.value })}
                  className="select w-full"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Select Route</label>
                <select
                  required
                  value={allocationForm.routeId}
                  onChange={(e) => setAllocationForm({ ...allocationForm, routeId: e.target.value })}
                  className="select w-full"
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.routeName} ({rt.vehicleNumber}) - ${rt.fee}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Pickup Point</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5th Avenue Crossroad"
                  value={allocationForm.pickupPoint}
                  onChange={(e) => setAllocationForm({ ...allocationForm, pickupPoint: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Allocation Date</label>
                <input
                  type="date"
                  required
                  value={allocationForm.allocationDate}
                  onChange={(e) => setAllocationForm({ ...allocationForm, allocationDate: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocationModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-indigo"
                >
                  {saving ? 'Assigning...' : 'Assign Route'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Dialogs */}
      {deleteRouteTarget && (
        <ConfirmDialog
          title="Delete Transit Route?"
          message={`Are you sure you want to delete ${deleteRouteTarget.routeName}? All allocations under this route will be affected. This action cannot be undone.`}
          onConfirm={handleDeleteRoute}
          onCancel={() => setDeleteRouteTarget(null)}
        />
      )}

      {deleteAllocTarget && (
        <ConfirmDialog
          title="Cancel Student Allocation?"
          message={`Are you sure you want to cancel transport route allocation for ${deleteAllocTarget.studentName}?`}
          onConfirm={handleDeleteAllocation}
          onCancel={() => setDeleteAllocTarget(null)}
        />
      )}
    </div>
  );
}
