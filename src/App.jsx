import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, ChevronRight, CheckCircle2, ChefHat, LogIn, UserPlus, LogOut } from 'lucide-react'
import { CartProvider, useCart } from './components/CartContext'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function Layout({ children }) {
  const { items } = useCart()
  const count = items.reduce((a, i) => a + i.quantity, 0)
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const onSearch = (e) => {
    e.preventDefault()
    navigate(`/menu?q=${encodeURIComponent(keyword)}`)
  }
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 text-gray-800">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-semibold text-orange-600">
            <ChefHat className="w-6 h-6"/>
            Food Court
          </button>
          <form onSubmit={onSearch} className="ml-auto flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 w-full max-w-md">
            <Search className="w-4 h-4 text-gray-500"/>
            <input value={keyword} onChange={e=>setKeyword(e.target.value)} className="bg-transparent flex-1 outline-none" placeholder="Search for burgers, pizza, sushi..."/>
          </form>
          <Link to="/cart" className="relative ml-2 p-2 rounded-full hover:bg-gray-100">
            <ShoppingCart />
            {count>0 && <span className="absolute -top-1 -right-1 text-xs bg-orange-600 text-white w-5 h-5 grid place-items-center rounded-full">{count}</span>}
          </Link>
          {user ? (
            <button onClick={()=>{localStorage.removeItem('user'); navigate(0)}} className="ml-2 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"><LogOut className="w-4 h-4"/> Logout</button>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"><LogIn className="w-4 h-4"/> Login</Link>
              <Link to="/signup" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"><UserPlus className="w-4 h-4"/> Signup</Link>
            </div>
          )}
          <Link to="/admin" className="ml-2 text-sm text-orange-600 hover:text-orange-700">Admin</Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} Food Court. Bon appétit!</footer>
    </div>
  )
}

function Home() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  useEffect(()=>{(async()=>{
    const cats = await fetch(`${API}/categories`).then(r=>r.json())
    setCategories(cats)
    const featured = await fetch(`${API}/items?limit=8`).then(r=>r.json())
    setItems(featured)
  })()},[])

  return (
    <div className="space-y-10">
      <section className="text-center pt-4">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="text-4xl md:text-5xl font-bold tracking-tight">Order from the best local vendors</motion.h1>
        <p className="mt-3 text-gray-600">Fast, fresh, and delicious. Pick up your order when it’s ready.</p>
        <div className="mt-6">
          <Link to="/menu" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-orange-600 text-white shadow hover:bg-orange-700 transition">Browse Menu <ChevronRight className="w-4 h-4"/></Link>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(c=> (
            <Link key={c._id} to={`/menu?category=${c._id}`} className="group rounded-xl overflow-hidden bg-white border hover:shadow-lg transition">
              {c.image_url && <img src={c.image_url} alt={c.name} className="h-28 w-full object-cover"/>}
              <div className="p-3">
                <p className="font-medium group-hover:text-orange-600">{c.name}</p>
                {c.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Featured</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(i => <ItemCard key={i._id} item={i} />)}
        </div>
      </section>
    </div>
  )
}

function Menu() {
  const q = useQuery()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const category = q.get('category')
  const search = q.get('q')
  useEffect(()=>{(async()=>{
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('q', search)
    const data = await fetch(`${API}/items?${params}`).then(r=>r.json())
    setItems(data)
    setLoading(false)
  })()},[category, search])
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Menu</h1>
      {loading ? <p>Loading...</p> : (
        items.length === 0 ? <p className="text-gray-500">No items found.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(i => <ItemCard key={i._id} item={i} />)}
          </div>
        )
      )}
    </div>
  )
}

function ItemCard({ item }) {
  const { addItem } = useCart()
  return (
    <motion.div layout whileHover={{y:-3}} className="rounded-xl overflow-hidden bg-white border hover:shadow-lg transition">
      {item.image_url && <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover"/>}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="font-medium text-orange-600">${item.price.toFixed(2)}</p>
        </div>
        {item.description && <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>}
        <div className="flex items-center justify-between pt-2">
          <Link to={`/item/${item._id}`} className="text-sm text-gray-600 hover:text-gray-800">Details</Link>
          <button onClick={()=>addItem({ item_id: item._id, title: item.title, price: item.price, image_url: item.image_url }, 1)} className="text-sm px-3 py-1 rounded-full bg-orange-600 text-white hover:bg-orange-700">Add</button>
        </div>
      </div>
    </motion.div>
  )
}

function ItemDetails() {
  const { addItem } = useCart()
  const [item, setItem] = useState(null)
  const { pathname } = useLocation()
  const id = pathname.split('/').pop()
  useEffect(()=>{(async()=>{
    const data = await fetch(`${API}/items/${id}`).then(r=>r.json())
    setItem(data)
  })()},[id])
  if (!item) return <p>Loading...</p>
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {item.image_url && <img src={item.image_url} alt={item.title} className="w-full rounded-xl object-cover max-h-96"/>}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <p className="text-gray-600">{item.description}</p>
        <p className="text-2xl font-semibold text-orange-600">${item.price.toFixed(2)}</p>
        <button onClick={()=>addItem({ item_id: item._id, title: item.title, price: item.price, image_url: item.image_url }, 1)} className="px-5 py-3 rounded-full bg-orange-600 text-white hover:bg-orange-700">Add to Cart</button>
      </div>
    </div>
  )
}

function CartPage() {
  const { items, removeItem, updateQty, totals } = useCart()
  const navigate = useNavigate()
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      {items.length===0 ? (
        <div className="text-center text-gray-500">
          Cart is empty. <button onClick={()=>navigate('/menu')} className="text-orange-600">Browse menu</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map(i=> (
              <div key={i.item_id} className="flex gap-3 items-center bg-white border rounded-xl p-3">
                {i.image_url && <img src={i.image_url} alt={i.title} className="w-16 h-16 rounded object-cover"/>}
                <div className="flex-1">
                  <p className="font-medium">{i.title}</p>
                  <p className="text-sm text-gray-500">${i.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>updateQty(i.item_id, i.quantity-1)} className="px-2 rounded bg-gray-100">-</button>
                  <span>{i.quantity}</span>
                  <button onClick={()=>updateQty(i.item_id, i.quantity+1)} className="px-2 rounded bg-gray-100">+</button>
                </div>
                <button onClick={()=>removeItem(i.item_id)} className="text-sm text-gray-500 hover:text-gray-700">Remove</button>
              </div>
            ))}
          </div>
          <div className="bg-white border rounded-xl p-4 h-fit">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
            </div>
            <button onClick={()=>navigate('/checkout')} className="mt-4 w-full px-4 py-2 rounded-full bg-orange-600 text-white hover:bg-orange-700">Checkout</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Checkout() {
  const { items, totals } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ pickup_name:'', contact_email:'', contact_phone:'', notes:'' })
  const placeOrder = async () => {
    const res = await fetch(`${API}/orders`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ items, ...form, user_id: JSON.parse(localStorage.getItem('user')||'null')?.user_id || null }) })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('lastOrder', JSON.stringify(data))
      localStorage.removeItem('cart')
      navigate('/success')
    } else {
      alert(data.detail || 'Failed to place order')
    }
  }
  if (items.length===0) return <p>Your cart is empty.</p>
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-3">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="border rounded-lg p-2" placeholder="Pickup name" value={form.pickup_name} onChange={e=>setForm({...form, pickup_name:e.target.value})}/>
          <input className="border rounded-lg p-2" placeholder="Email (optional)" value={form.contact_email} onChange={e=>setForm({...form, contact_email:e.target.value})}/>
          <input className="border rounded-lg p-2" placeholder="Phone (optional)" value={form.contact_phone} onChange={e=>setForm({...form, contact_phone:e.target.value})}/>
          <input className="border rounded-lg p-2 sm:col-span-2" placeholder="Notes (e.g., no onions)" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}/>
        </div>
      </div>
      <div className="bg-white border rounded-xl p-4 h-fit">
        <h3 className="font-semibold mb-2">Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
        </div>
        <button onClick={placeOrder} className="mt-4 w-full px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700">Place Order</button>
      </div>
    </div>
  )
}

function Success() {
  const order = JSON.parse(localStorage.getItem('lastOrder')||'null')
  return (
    <div className="text-center py-20">
      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto"/>
      <h1 className="text-3xl font-bold mt-4">Order placed!</h1>
      {order && <p className="mt-2 text-gray-600">Order #{order.order_number} confirmed. Total ${order.total.toFixed(2)}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/track" className="px-4 py-2 rounded-full bg-orange-600 text-white">Track Order</Link>
        <Link to="/menu" className="px-4 py-2 rounded-full bg-gray-900 text-white">Order More</Link>
      </div>
    </div>
  )
}

function Track() {
  const [orders, setOrders] = useState([])
  const user = JSON.parse(localStorage.getItem('user')||'null')
  useEffect(()=>{(async()=>{
    const url = user ? `${API}/orders?user_id=${user.user_id}` : `${API}/orders`
    const data = await fetch(url).then(r=>r.json())
    setOrders(data)
  })()},[])
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o._id} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between"><span className="font-semibold">#{o.order_number}</span><span className="text-sm text-gray-600">{o.status}</span></div>
            <p className="text-sm text-gray-600">Total ${o.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const submit = async () => {
    const res = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const data = await res.json()
    if (res.ok) { localStorage.setItem('user', JSON.stringify(data)); navigate('/') } else { alert(data.detail || 'Login failed') }
  }
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <div className="space-y-3">
        <input className="border rounded-lg p-2 w-full" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input type="password" className="border rounded-lg p-2 w-full" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <button onClick={submit} className="w-full px-4 py-2 rounded-full bg-orange-600 text-white">Sign in</button>
      </div>
    </div>
  )
}

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const submit = async () => {
    const res = await fetch(`${API}/auth/signup`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const data = await res.json()
    if (res.ok) { localStorage.setItem('user', JSON.stringify(data)); navigate('/') } else { alert(data.detail || 'Signup failed') }
  }
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <div className="space-y-3">
        <input className="border rounded-lg p-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="border rounded-lg p-2 w-full" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input type="password" className="border rounded-lg p-2 w-full" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <button onClick={submit} className="w-full px-4 py-2 rounded-full bg-orange-600 text-white">Sign up</button>
      </div>
    </div>
  )
}

function Admin() {
  const [tab, setTab] = useState('items')
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>
      <div className="flex gap-2 mb-4">
        {['items','categories','orders'].map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full border ${tab===t?'bg-gray-900 text-white':'bg-white'}`}>{t}</button>
        ))}
      </div>
      {tab==='items' && <AdminItems/>}
      {tab==='categories' && <AdminCategories/>}
      {tab==='orders' && <AdminOrders/>}
    </div>
  )
}

function AdminItems() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title:'', description:'', price:'', category_id:'', image_url:'', tags:'' })
  const [categories, setCategories] = useState([])
  const load = async ()=>{
    const [its, cats] = await Promise.all([
      fetch(`${API}/items`).then(r=>r.json()),
      fetch(`${API}/categories`).then(r=>r.json()),
    ])
    setItems(its); setCategories(cats)
  }
  useEffect(()=>{load()},[])
  const save = async ()=>{
    const payload = { ...form, price: parseFloat(form.price||'0'), tags: form.tags?form.tags.split(',').map(s=>s.trim()):[] }
    const res = await fetch(`${API}/admin/items`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if (res.ok) { setForm({ title:'', description:'', price:'', category_id:'', image_url:'', tags:'' }); load() }
  }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-3">
        {items.map(i => (
          <div key={i._id} className="bg-white border rounded-xl p-3 flex items-center gap-3">
            {i.image_url && <img src={i.image_url} className="w-16 h-16 rounded object-cover"/>}
            <div className="flex-1">
              <div className="font-medium">{i.title} <span className="text-sm text-gray-500">${i.price.toFixed(2)}</span></div>
              <div className="text-xs text-gray-500">{i.tags?.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <h3 className="font-semibold">Add Item</h3>
        <input className="border rounded p-2 w-full" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <textarea className="border rounded p-2 w-full" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <input className="border rounded p-2 w-full" type="number" step="0.01" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/>
        <select className="border rounded p-2 w-full" value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value})}>
          <option value="">Category</option>
          {categories.map(c=> <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input className="border rounded p-2 w-full" placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})}/>
        <input className="border rounded p-2 w-full" placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})}/>
        <button onClick={save} className="w-full px-4 py-2 rounded-full bg-gray-900 text-white">Save</button>
      </div>
    </div>
  )
}

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name:'', description:'', image_url:'' })
  const load = async ()=>{ setCategories(await fetch(`${API}/categories`).then(r=>r.json())) }
  useEffect(()=>{load()},[])
  const save = async ()=>{
    const res = await fetch(`${API}/admin/categories`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (res.ok) { setForm({ name:'', description:'', image_url:'' }); load() }
  }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-3">
        {categories.map(c => (
          <div key={c._id} className="bg-white border rounded-xl p-3 flex items-center gap-3">
            {c.image_url && <img src={c.image_url} className="w-16 h-16 rounded object-cover"/>}
            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">{c.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <h3 className="font-semibold">Add Category</h3>
        <input className="border rounded p-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <textarea className="border rounded p-2 w-full" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <input className="border rounded p-2 w-full" placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})}/>
        <button onClick={save} className="w-full px-4 py-2 rounded-full bg-gray-900 text-white">Save</button>
      </div>
    </div>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const load = async ()=>{ setOrders(await fetch(`${API}/orders`).then(r=>r.json())) }
  useEffect(()=>{load()},[])
  const updateStatus = async (id, status) => {
    await fetch(`${API}/admin/orders/${id}/status`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
    load()
  }
  return (
    <div className="space-y-3">
      {orders.map(o => (
        <div key={o._id} className="bg-white border rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div>
              <div className="font-semibold">#{o.order_number}</div>
              <div className="text-sm text-gray-600">${o.total.toFixed(2)}</div>
            </div>
            <select value={o.status} onChange={e=>updateStatus(o._id, e.target.value)} className="border rounded p-2">
              {['pending','preparing','ready','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}

function AppShell() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/menu" element={<Menu/>} />
              <Route path="/item/:id" element={<ItemDetails/>} />
              <Route path="/cart" element={<CartPage/>} />
              <Route path="/checkout" element={<Checkout/>} />
              <Route path="/success" element={<Success/>} />
              <Route path="/track" element={<Track/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/signup" element={<Signup/>} />
              <Route path="/admin" element={<Admin/>} />
            </Routes>
          </AnimatePresence>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  )
}

export default AppShell
