import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Plus, Pencil, Trash2, Home, Key, Calendar, Search, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Hostel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Tables state
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [myAllocation, setMyAllocation] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState(isAdmin ? 'rooms' : 'my-room');

  // Search/Filters
  const [roomSearch, setRoomSearch] = useState('');
  const [allocationSearch, setAllocationSearch] = useState('');

  // Modals state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ blockName: '', roomNumber: '', roomType: 'Double Shared', capacity: 2 });

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [allocationForm, setAllocationForm] = useState({ roomId: '', studentId: '', allocationDate: new Date().toISOString().split('T')[0] });

  const [saving, setSaving] = useState(false);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState(null);
  const [deleteAllocTarget, setDeleteAllocTarget] = useState(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [roomsRes, allocationsRes, studentsRes] = await Promise.all([
          apiClient.get('/hostel/rooms'),
          apiClient.get('/hostel/allocations'),
          apiClient.get('/students', { params: { page: 0, size: 1000 } })
        ]);
        setRooms(roomsRes.data.data || []);
        setAllocations(allocationsRes.data.data || []);
        setStudents(studentsRes.data.data?.content || []);
      } else {
        const res = await apiClient.get('/hostel/my-allocation');
        setMyAllocation(res.data.data);
      }
    } catch (err) {
      if (!isAdmin && err.response?.status === 404) {
        setMyAllocation(null);
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch hostel details');
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Room
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRoom) {
        await apiClient.put(`/hostel/rooms/${editingRoom.id}`, roomForm);
        toast.success('Room updated successfully');
      } else {
        await apiClient.post('/hostel/rooms', roomForm);
        toast.success('Room created successfully');
      }
      setRoomModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async () => {
    try {
      await apiClient.delete(`/hostel/rooms/${deleteRoomTarget.id}`);
      toast.success('Room deleted successfully');
      setDeleteRoomTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    }
  };

  // Save Allocation
  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        roomId: Number(allocationForm.roomId),
        studentId: Number(allocationForm.studentId),
        allocationDate: allocationForm.allocationDate
      };
      await apiClient.post('/hostel/allocations', payload);
      toast.success('Room allocated successfully');
      setAllocationModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate room');
    } finally {
      setSaving(false);
    }
  };

  // Vacate Allocation
  const handleVacateRoom = async (id) => {
    try {
      const alloc = allocations.find(a => a.id === id);
      if (!alloc) return;
      const payload = {
        ...alloc,
        status: 'VACATED'
      };
      await apiClient.put(`/hostel/allocations/${id}`, payload);
      toast.success('Room vacated successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to vacate room');
    }
  };

  // Delete Allocation
  const handleDeleteAllocation = async () => {
    try {
      await apiClient.delete(`/hostel/allocations/${deleteAllocTarget.id}`);
      toast.success('Allocation record deleted');
      setDeleteAllocTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete allocation');
    }
  };

  // Filters
  const filteredRooms = rooms.filter(r => 
    r.blockName.toLowerCase().includes(roomSearch.toLowerCase()) || 
    r.roomNumber.includes(roomSearch)
  );

  const filteredAllocations = allocations.filter(a => 
    a.studentName?.toLowerCase().includes(allocationSearch.toLowerCase()) || 
    a.studentRoll?.toLowerCase().includes(allocationSearch.toLowerCase()) ||
    a.blockName?.toLowerCase().includes(allocationSearch.toLowerCase()) ||
    a.roomNumber?.includes(allocationSearch)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <BedDouble className="text-indigo-600 dark:text-indigo-400" />
            Hostel Management
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            Manage hostel block rooms, capacity allocation, and student occupancy logs.
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingRoom(null);
                setRoomForm({ blockName: '', roomNumber: '', roomType: 'Double Shared', capacity: 2 });
                setRoomModalOpen(true);
              }}
              className="btn btn-indigo flex items-center gap-2"
            >
              <Plus size={16} /> Add Room
            </button>
            <button
              onClick={() => {
                setAllocationForm({ roomId: rooms[0]?.id || '', studentId: students[0]?.id || '', allocationDate: new Date().toISOString().split('T')[0] });
                setAllocationModalOpen(true);
              }}
              className="btn btn-emerald flex items-center gap-2"
              disabled={rooms.length === 0 || students.length === 0}
            >
              <Key size={16} /> Allocate Room
            </button>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex border-b border-ink/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'rooms'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper'
            }`}
          >
            Rooms Inventory
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'allocations'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper'
            }`}
          >
            Room Allocations
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-ink/60 dark:text-paper/60">Fetching hostel details...</p>
        </div>
      ) : activeTab === 'my-room' ? (
        <div className="max-w-xl mx-auto">
          {myAllocation ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-badge p-6 border border-white/10 shadow-card space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center">
                  <Home size={24} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">Allocated Hostel Room</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${myAllocation.status === 'ALLOCATED' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                    {myAllocation.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">BLOCK NAME</span>
                  <p className="font-semibold text-lg">{myAllocation.blockName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">ROOM NUMBER</span>
                  <p className="font-semibold text-lg">{myAllocation.roomNumber}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">ROOM TYPE</span>
                  <p className="font-semibold">{myAllocation.roomType || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink/50 dark:text-paper/50 font-medium">ALLOCATION DATE</span>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar size={14} className="text-ink/40" />
                    {myAllocation.allocationDate}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-badge p-8 border border-white/5 text-center space-y-3">
              <BedDouble className="mx-auto text-ink/30 dark:text-paper/30" size={48} />
              <h3 className="font-display text-lg font-semibold">No Hostel Allocation</h3>
              <p className="text-sm text-ink/60 dark:text-paper/60 max-w-sm mx-auto">
                You currently do not have a hostel room allocated. Please contact the administrator to request room allocation.
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'rooms' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink/40 dark:text-paper/40" />
              <input
                type="text"
                placeholder="Search rooms by block or number..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="pl-9 input w-full"
              />
            </div>
          </div>

          <div className="glass rounded-badge overflow-hidden border border-ink/5 dark:border-white/5 shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink/5 dark:bg-white/5 text-ink/80 dark:text-paper/85 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Block</th>
                    <th className="px-6 py-4">Room Number</th>
                    <th className="px-6 py-4">Room Type</th>
                    <th className="px-6 py-4">Occupancy</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 dark:divide-white/5 text-sm">
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                      <tr key={room.id} className="hover:bg-ink/[0.01] dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-semibold">{room.blockName}</td>
                        <td className="px-6 py-4">{room.roomNumber}</td>
                        <td className="px-6 py-4">{room.roomType || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            (room.occupiedCount ?? 0) >= room.capacity 
                              ? 'bg-red-500/10 text-red-500' 
                              : 'bg-green-500/10 text-green-500'
                          }`}>
                            {room.occupiedCount ?? 0} / {room.capacity} beds filled
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingRoom(room);
                                setRoomForm({ blockName: room.blockName, roomNumber: room.roomNumber, roomType: room.roomType || '', capacity: room.capacity });
                                setRoomModalOpen(true);
                              }}
                              className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-indigo-500"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteRoomTarget(room)}
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
                      <td colSpan="5" className="px-6 py-8 text-center text-ink/50 dark:text-paper/50">
                        No hostel rooms defined. Click "Add Room" to create one.
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
                placeholder="Search allocations by student or room..."
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
                    <th className="px-6 py-4">Hostel Room</th>
                    <th className="px-6 py-4">Allocation Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 dark:divide-white/5 text-sm">
                  {filteredAllocations.length > 0 ? (
                    filteredAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-ink/[0.01] dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-semibold">{alloc.studentName}</td>
                        <td className="px-6 py-4">{alloc.studentRoll}</td>
                        <td className="px-6 py-4">
                          Block {alloc.blockName}, Room {alloc.roomNumber} ({alloc.roomType})
                        </td>
                        <td className="px-6 py-4">{alloc.allocationDate}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            alloc.status === 'ALLOCATED' 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                              : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {alloc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {alloc.status === 'ALLOCATED' && (
                              <button
                                onClick={() => handleVacateRoom(alloc.id)}
                                className="px-2 py-1 text-xs font-semibold border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded flex items-center gap-1"
                              >
                                <LogOut size={12} /> Vacate
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteAllocTarget(alloc)}
                              className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-red-500"
                              title="Delete Log Record"
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
                        No room allocation logs matching search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-badge p-6 max-w-md w-full border border-white/10 shadow-card"
          >
            <h3 className="font-display text-lg font-bold mb-4">
              {editingRoom ? 'Edit Hostel Room' : 'Add Hostel Room'}
            </h3>
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Block Name</label>
                <input
                  type="text"
                  required
                  value={roomForm.blockName}
                  onChange={(e) => setRoomForm({ ...roomForm, blockName: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Block A"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. 101"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Room Type</label>
                <input
                  type="text"
                  value={roomForm.roomType}
                  onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Single, Double Shared, Triple"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Capacity (Beds)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                  className="input w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-indigo"
                >
                  {saving ? 'Saving...' : 'Save Room'}
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
            <h3 className="font-display text-lg font-bold mb-4">Allocate Room</h3>
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
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Select Room</label>
                <select
                  required
                  value={allocationForm.roomId}
                  onChange={(e) => setAllocationForm({ ...allocationForm, roomId: e.target.value })}
                  className="select w-full"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms
                    .filter(r => (r.occupiedCount ?? 0) < r.capacity)
                    .map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.blockName} - Room {rm.roomNumber} ({rm.occupiedCount}/{rm.capacity} filled)
                      </option>
                    ))}
                </select>
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
                  {saving ? 'Allocating...' : 'Allocate'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Dialogs */}
      {deleteRoomTarget && (
        <ConfirmDialog
          title="Delete Hostel Room?"
          message={`Are you sure you want to delete Room ${deleteRoomTarget.roomNumber} in ${deleteRoomTarget.blockName}? This action cannot be undone.`}
          onConfirm={handleDeleteRoom}
          onCancel={() => setDeleteRoomTarget(null)}
        />
      )}

      {deleteAllocTarget && (
        <ConfirmDialog
          title="Delete Allocation Log?"
          message={`Are you sure you want to delete this allocation history record?`}
          onConfirm={handleDeleteAllocation}
          onCancel={() => setDeleteAllocTarget(null)}
        />
      )}
    </div>
  );
}
