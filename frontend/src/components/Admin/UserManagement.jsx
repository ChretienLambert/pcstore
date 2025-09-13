import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../redux/slices/adminOrderSlice";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Check if adminSlice exports are available
let adminSliceExports = null;
try {
  adminSliceExports = await import("../../redux/slices/adminSlice");
} catch (error) {
  console.warn("Admin slice not available, using direct API calls");
}

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const adminState = useSelector((s) => s.admin || { users: [] });
  const { orders, loading: ordersLoading } = useSelector((s) => s.adminOrders || { orders: [] });

  // controlled form for create user
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "customer" });
  const [selectedUserId, setSelectedUserId] = useState(location?.state?.selectedUserId || null);
  const [localUsers, setLocalUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const users = (adminState && adminState.users && adminState.users.length > 0) ? adminState.users : localUsers;
  const usersLoading = adminState && adminState.loading ? adminState.loading : loadingUsers;

  useEffect(() => {
    // ensure orders are loaded so we can show user's orders
    dispatch(fetchAllOrders());
    
    // Check if fetchAdminUsers exists in the adminSlice before calling it
    if (adminSliceExports && adminSliceExports.fetchAdminUsers) {
      dispatch(adminSliceExports.fetchAdminUsers());
    }
  }, [dispatch]);

  // fetch admin users directly if redux doesn't have them
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem("userToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${BACKEND}/api/admin/users`, { headers });
        setLocalUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch admin users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (!adminState || !adminState.users || adminState.users.length === 0) {
      fetchUsers();
    }
  }, [adminState]);

  // create user via redux thunk or direct API call
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Use redux thunk if available
      if (adminSliceExports && adminSliceExports.createAdminUser) {
        await dispatch(adminSliceExports.createAdminUser(formData)).unwrap();
        // refresh user list
        if (adminSliceExports.fetchAdminUsers) {
          await dispatch(adminSliceExports.fetchAdminUsers()).unwrap();
        }
      } else {
        // fallback direct call
        const token = localStorage.getItem("userToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.post(`${BACKEND}/api/admin/users`, formData, { headers });
        // Refresh the user list
        const res = await axios.get(`${BACKEND}/api/admin/users`, { headers });
        setLocalUsers(res.data || []);
      }
      setFormData({ name: "", email: "", password: "", role: "customer" });
    } catch (err) {
      alert(err?.message || err?.response?.data?.message || "Create user failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete user?")) return;
    try {
      if (adminSliceExports && adminSliceExports.deleteAdminUser) {
        await dispatch(adminSliceExports.deleteAdminUser(id)).unwrap();
        if (adminSliceExports.fetchAdminUsers) {
          await dispatch(adminSliceExports.fetchAdminUsers()).unwrap();
        }
      } else {
        const token = localStorage.getItem("userToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.delete(`${BACKEND}/api/admin/users/${id}`, { headers });
        // Refresh the user list
        const res = await axios.get(`${BACKEND}/api/admin/users`, { headers });
        setLocalUsers(res.data || []);
      }
    } catch (err) {
      alert(err?.message || "Delete failed");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      if (adminSliceExports && adminSliceExports.updateAdminUser) {
        await dispatch(adminSliceExports.updateAdminUser({ id, update: { role: newRole } })).unwrap();
        if (adminSliceExports.fetchAdminUsers) {
          await dispatch(adminSliceExports.fetchAdminUsers()).unwrap();
        }
      } else {
        const token = localStorage.getItem("userToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.put(`${BACKEND}/api/admin/users/${id}`, { role: newRole }, { headers });
        // Refresh the user list
        const res = await axios.get(`${BACKEND}/api/admin/users`, { headers });
        setLocalUsers(res.data || []);
      }
    } catch (err) {
      alert("Update role failed");
    }
  };

  useEffect(() => {
    if (location?.state?.selectedUserId) {
      setSelectedUserId(location.state.selectedUserId);
    }
  }, [location]);

  const selectedUser = users?.find((u) => u._id === selectedUserId);

  const userOrders = (orders || []).filter((o) => {
    const uid = (o.user && (o.user._id || o.user)) || null;
    return uid && String(uid) === String(selectedUserId);
  });

  const openOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleSelectUser = (uid) => {
    setSelectedUserId(uid);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-6">User Management</h2>
        {usersLoading && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 items-center p-3">
                <div className="bg-gray-200 rounded w-12 h-6" />
                <div className="bg-gray-200 rounded w-40 h-6" />
                <div className="bg-gray-200 rounded w-24 h-6 ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Add new User Form */}
        <div className="p-6 rounded-lg mb-6 bg-white card">
          <h3 className="text-lg font-bold mb-4">Add New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="w-full p-2 border rounded"
              required
            />
            <input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              type="email"
              className="w-full p-2 border rounded"
              required
            />
            <input
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              type="password"
              className="w-full p-2 border rounded"
              required
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary px-4 py-2">
                Create User
              </button>
            </div>
          </form>
        </div>

        {/* User List Management */}
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <button className="text-left text-blue-700 hover:underline" onClick={() => handleSelectUser(u._id)}>
                      {u.name || "—"}
                    </button>
                  </td>
                  <td className="p-3">{u.email || "—"}</td>
                  <td className="p-3">{u.role || "customer"}</td>
                  <td className="p-3">
                    <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="p-2 border rounded mr-2">
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => handleDelete(u._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:col-span-1 space-y-4">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">User Details</h3>
          {selectedUser ? (
            <div>
              <p className="font-medium">{selectedUser.name}</p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
              <p className="mt-2">Role: <strong>{selectedUser.role}</strong></p>
              <div className="mt-3">
                <button
                  onClick={() => {
                    // optionally prefill form
                  }}
                  className="btn-primary w-full"
                >
                  Load into form
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select a user from the list or click a user from Orders.</p>
          )}
        </div>

        <div className="card p-4">
          <h4 className="font-semibold mb-3">Orders for this user</h4>
          {ordersLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-3 border rounded flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="bg-gray-200 h-4 w-24 rounded" />
                    <div className="bg-gray-200 h-4 w-36 rounded" />
                  </div>
                  <div className="bg-gray-200 h-6 w-20 rounded" />
                </div>
              ))}
            </div>
          ) : userOrders.length === 0 ? (
            <div className="text-gray-500">No orders for this user</div>
          ) : (
            <ul className="space-y-2">
              {userOrders.map((o) => (
                <li
                  key={o._id}
                  onClick={() => openOrder(o._id)}
                  className="p-3 border rounded hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="font-mono text-xs text-gray-500">#{String(o._id).slice(0,8)}</div>
                    <div>
                      <div className="font-medium">
                        {o.orderItems?.length || 0} item{o.orderItems?.length > 1 ? "s" : ""} • {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}
                      </div>
                      <div className="text-sm text-gray-500">Total: FCFA {Number(o.totalPrice || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        o.isDelivered ? "bg-green-100 text-green-700" : (o.isPaid ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700")
                      }`}
                    >
                      {o.isDelivered ? "Delivered" : (o.isPaid ? "Paid" : "Pending")}
                    </span>

                    <button
                      onClick={(e) => { e.stopPropagation(); openOrder(o._id); }}
                      className="btn-primary px-3 py-1 text-sm"
                    >
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;