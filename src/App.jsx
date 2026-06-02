import { useState, useEffect, useRef } from "react";

// ── Storage helpers ──────────────────────────────────────────────────────────
const store = {
  async get(k) {
    try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(k, v) {
    try { await window.storage.set(k, JSON.stringify(v)); }
    catch (e) { console.warn("Storage error:", e); }
  }
};

// ── Constants ────────────────────────────────────────────────────────────────
const CATS = [
  "Agriculture", "Business & Trade", "Education", "Healthcare",
  "IT & Technology", "Manufacturing", "Transport & Logistics",
  "Government / Public Service", "Arts & Culture", "Others"
];

const DEF_STORY = {
  title: "Dalapathi Samuthiram",
  subtitle: "Keelur · Nanguneri Taluk · Tirunelveli District · Tamil Nadu",
  content: "Dalapathi Samuthiram is a proud village in Nanguneri taluk, Tirunelveli district, Tamil Nadu. Our people have built their futures through determination, hard work, and passion — in agriculture, business, education, healthcare, and technology. This platform is a tribute to every individual from our village who is making a difference and making us all proud.",
  tagline: "Making Dalapathi Samuthiram Proud"
};

const DEF_USERS = [{ username: "admin", password: "admin123", role: "ADMIN", active: true }];

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  saffron: "#D4680A", saffronD: "#A84E06", saffronL: "#F08020",
  saffronBg: "#FFF3E8", saffronBorder: "#F5C48A",
  green: "#1A6035", greenBg: "#E8F5EE", greenBorder: "#86C99E",
  gold: "#B8860B",
  cream: "#FFFBF5", creamDark: "#FFF0DC",
  dark: "#1A0F00", mid: "#5C3A1E", midL: "#8B6543",
  gray: "#6B7280", grayL: "#9CA3AF", grayBg: "#F9FAFB",
  border: "#E8D5C0", borderD: "#D4B896",
  white: "#FFFFFF",
  red: "#C0392B", redBg: "#FEE2E2", redBorder: "#FECACA"
};

const inp = {
  width: "100%", padding: "10px 14px", borderRadius: "8px",
  border: `1.5px solid ${C.border}`, fontFamily: "inherit",
  fontSize: "14px", background: C.white, color: C.dark,
  outline: "none", boxSizing: "border-box", transition: "border-color 0.15s"
};

const card = {
  background: C.white, borderRadius: "16px", padding: "20px",
  border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(168,78,6,0.07)"
};

const btn = (v = "primary", sz = "md") => ({
  padding: sz === "sm" ? "6px 14px" : "10px 22px",
  borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
  fontSize: sz === "sm" ? "12px" : "14px", fontWeight: 600,
  transition: "all 0.15s", border: "none", letterSpacing: "0.2px",
  background:
    v === "primary" ? C.saffron :
    v === "green" ? C.green :
    v === "danger" ? C.red :
    v === "ghost" ? "transparent" : "transparent",
  color:
    v === "outline" ? C.saffron :
    v === "ghost" ? C.gray : "#fff",
  border:
    v === "outline" ? `2px solid ${C.saffron}` :
    v === "ghost" ? `1.5px solid ${C.border}` : "none"
});

function catEmoji(cat) {
  return { "Agriculture": "🌾", "Business & Trade": "🏢", "Education": "🎓",
    "Healthcare": "🏥", "IT & Technology": "💻", "Manufacturing": "🏭",
    "Transport & Logistics": "🚛", "Government / Public Service": "🏛️",
    "Arts & Culture": "🎨", "Others": "✨", "Business": "🏢" }[cat] || "✨";
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [story, setStory] = useState(DEF_STORY);
  const [photos, setPhotos] = useState([]);
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState(DEF_USERS);
  const [admin, setAdmin] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [s, p, su, u] = await Promise.all([
        store.get("ds_story"), store.get("ds_photos"),
        store.get("ds_subs"), store.get("ds_users")
      ]);
      if (s) setStory(s); if (p) setPhotos(p);
      if (su) setSubs(su); if (u) setUsers(u);
      setLoaded(true);
    })();
  }, []);

  const saveStory  = async (v) => { setStory(v); await store.set("ds_story", v); };
  const savePhotos = async (v) => { setPhotos(v); await store.set("ds_photos", v); };
  const saveSubs   = async (v) => { setSubs(v);   await store.set("ds_subs", v); };
  const saveUsers  = async (v) => { setUsers(v);  await store.set("ds_users", v); };

  if (!loaded) return (
    <div style={{ minHeight: "420px", display: "flex", alignItems: "center",
      justifyContent: "center", background: C.cream, flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "40px" }}>🏘️</div>
      <div style={{ fontFamily: "serif", color: C.saffron, fontSize: "18px" }}>
        Loading village data...
      </div>
    </div>
  );

  const approved = subs.filter(s => s.status === "approved");
  const pending  = subs.filter(s => s.status === "pending").length;

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream,
      minHeight: "100vh", color: C.dark }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: ${C.saffron} !important; }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>
      <Navbar page={page} setPage={(p) => { setPage(p); window.scrollTo(0,0); }}
        admin={admin} onLogout={() => setAdmin(null)} pendingCount={pending} />
      {page === "home"  && <HomePage story={story} photos={photos} approved={approved} setPage={(p) => { setPage(p); window.scrollTo(0,0); }} />}
      {page === "proud" && <ProudPage submissions={approved} />}
      {page === "join"  && <JoinPage subs={subs} saveSubs={saveSubs} />}
      {page === "admin" && (
        admin
          ? <AdminDash admin={admin} story={story} photos={photos} subs={subs} users={users}
              saveStory={saveStory} savePhotos={savePhotos} saveSubs={saveSubs} saveUsers={saveUsers} />
          : <AdminLogin users={users} onLogin={setAdmin} />
      )}
      <footer style={{ background: C.dark, color: "rgba(255,255,255,0.5)", padding: "24px",
        textAlign: "center", fontSize: "13px", marginTop: "0" }}>
        <div style={{ color: "#F08020", fontWeight: 600, marginBottom: "4px" }}>
          Dalapathi Samuthiram — கீழூர்
        </div>
        Nanguneri Taluk · Tirunelveli District · Tamil Nadu · India
      </footer>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, admin, onLogout, pendingCount }) {
  const navLinks = [
    { id: "home",  label: "Home" },
    { id: "proud", label: "Our Pride" },
    { id: "join",  label: "Join Us" },
    { id: "admin", label: admin ? "⚙ Admin" : "Admin" }
  ];
  return (
    <nav style={{ background: C.dark, position: "sticky", top: 0, zIndex: 200,
      boxShadow: "0 2px 16px rgba(0,0,0,0.35)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: "62px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={() => setPage("home")}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%",
            background: `linear-gradient(135deg,${C.saffron},${C.gold})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
            🏘️
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#fff", lineHeight: 1.1 }}>
              Dalapathi Samuthiram
            </div>
            <div style={{ fontSize: "10px", color: C.saffronL, letterSpacing: "0.6px", fontWeight: 500 }}>
              கீழூர் · TIRUNELVELI
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
          {navLinks.map(l => (
            <button key={l.id} onClick={() => setPage(l.id)}
              style={{ ...btn(page === l.id ? "primary" : "ghost"),
                position: "relative", padding: "8px 16px", fontSize: "13px",
                color: page === l.id ? "#fff" : "rgba(255,255,255,0.75)",
                background: page === l.id ? C.saffron : "transparent",
                border: "none" }}>
              {l.label}
              {l.id === "admin" && pendingCount > 0 && (
                <span style={{ position: "absolute", top: "4px", right: "4px",
                  background: "#E74C3C", color: "#fff", borderRadius: "50%",
                  width: "16px", height: "16px", fontSize: "10px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
          {admin && (
            <button onClick={onLogout}
              style={{ marginLeft: "6px", padding: "6px 12px", background: "transparent",
                border: `1px solid rgba(240,128,32,0.5)`, borderRadius: "8px",
                color: C.saffronL, cursor: "pointer", fontFamily: "inherit",
                fontSize: "12px", fontWeight: 600 }}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ story, photos, approved, setPage }) {
  const catCounts = {};
  approved.forEach(s => { catCounts[s.category] = (catCounts[s.category] || 0) + 1; });

  return (
    <div>
      {/* Hero */}
      <div style={{ background: C.dark, padding: "80px 20px 60px", textAlign: "center",
        position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,104,10,0.12) 0%, transparent 60%),
            radial-gradient(circle at 80% 50%, rgba(26,96,53,0.12) 0%, transparent 60%)`,
          pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", letterSpacing: "4px", color: C.saffronL,
            fontWeight: 700, marginBottom: "16px", textTransform: "uppercase" }}>
            {story.tagline}
          </div>
          <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 800, color: "#fff",
            margin: "0 0 10px", lineHeight: 1.05, letterSpacing: "-1px" }}>
            {story.title}
          </h1>
          <div style={{ fontSize: "15px", color: C.saffronL, marginBottom: "24px", fontWeight: 500 }}>
            {story.subtitle}
          </div>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.85,
            maxWidth: "620px", margin: "0 auto 36px" }}>
            {story.content}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("proud")}
              style={{ ...btn("primary"), fontSize: "15px", padding: "13px 32px",
                background: C.saffron, boxShadow: `0 4px 16px rgba(212,104,10,0.4)` }}>
              View Our Pride →
            </button>
            <button onClick={() => setPage("join")}
              style={{ ...btn("outline"), fontSize: "15px", padding: "13px 32px" }}>
              Add Your Story
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: C.saffron, padding: "18px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex",
          gap: "40px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { n: approved.length, label: "Proud Members" },
            { n: Object.keys(catCounts).length || 0, label: "Sectors" },
            { n: photos.length, label: "Village Photos" },
            { n: "Tirunelveli", label: "District" }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px" }}>{s.n}</div>
              <div style={{ fontSize: "11px", opacity: 0.85, fontWeight: 600, letterSpacing: "0.5px" }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo gallery */}
      <div style={{ maxWidth: "1200px", margin: "48px auto 0", padding: "0 20px" }}>
        <SectionHead>Village Gallery</SectionHead>
        {photos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: C.grayL,
            background: C.white, borderRadius: "16px", border: `2px dashed ${C.border}` }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>📷</div>
            <div>No photos yet — admin can upload up to 5 village photos.</div>
          </div>
        ) : (
          <div style={{ display: "grid",
            gridTemplateColumns: photos.length === 1 ? "1fr" :
              photos.length === 2 ? "1fr 1fr" :
              photos.length === 3 ? "1fr 1fr 1fr" : "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "14px" }}>
            {photos.map((p, i) => (
              <div key={p.id} style={{ borderRadius: "14px", overflow: "hidden",
                boxShadow: "0 4px 16px rgba(168,78,6,0.12)",
                aspectRatio: i === 0 && photos.length > 2 ? "16/9" : "4/3",
                gridColumn: i === 0 && photos.length > 2 ? "1 / -1" : "auto" }}>
                <img src={p.url} alt={p.caption || `Photo ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover",
                    display: "block", transition: "transform 0.3s" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.target.style.transform = ""} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sector breakdown */}
      {Object.keys(catCounts).length > 0 && (
        <div style={{ maxWidth: "1200px", margin: "48px auto 0", padding: "0 20px" }}>
          <SectionHead>Fields We Excel In</SectionHead>
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "12px" }}>
            {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} onClick={() => setPage("proud")}
                style={{ ...card, textAlign: "center", padding: "20px 14px", cursor: "pointer",
                  transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = C.saffronBorder; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = C.border; }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{catEmoji(cat)}</div>
                <div style={{ fontWeight: 600, fontSize: "13px", color: C.mid, marginBottom: "6px", lineHeight: 1.3 }}>{cat}</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: C.saffron }}>{count}</div>
                <div style={{ fontSize: "11px", color: C.grayL }}>members</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map section */}
      <div style={{ background: C.dark, marginTop: "56px", padding: "48px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: C.saffronL,
              fontWeight: 700, marginBottom: "8px" }}>LOCATION</div>
            <h2 style={{ color: "#fff", fontSize: "26px", fontWeight: 700, margin: "0 0 8px" }}>
              Find Us on the Map
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", margin: 0 }}>
              Dalapathi Samuthiram · Nanguneri Taluk · Tirunelveli District · 8.4259°N, 77.6343°E
            </p>
          </div>
          <div style={{ borderRadius: "16px", overflow: "hidden",
            border: `2px solid rgba(240,128,32,0.25)`, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <iframe title="Village Location" width="100%" height="320" style={{ display: "block", border: "none" }}
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.614%2C8.406%2C77.654%2C8.446&layer=mapnik&marker=8.4259%2C77.6343" />
          </div>
          <div style={{ textAlign: "center", marginTop: "14px" }}>
            <a href="https://maps.google.com/maps?q=Dalapathi+Samudram,Nanguneri,Tirunelveli,Tamil+Nadu"
              target="_blank" rel="noreferrer"
              style={{ color: C.saffronL, fontSize: "13px", fontWeight: 600 }}>
              Open in Google Maps →
            </a>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "60px 20px", textAlign: "center", background: C.creamDark }}>
        <h2 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 10px" }}>
          Are you from Dalapathi Samuthiram?
        </h2>
        <p style={{ color: C.midL, marginBottom: "24px", fontSize: "16px" }}>
          Add your name and story — inspire the next generation!
        </p>
        <button onClick={() => setPage("join")}
          style={{ ...btn("primary"), fontSize: "16px", padding: "14px 36px",
            boxShadow: `0 4px 20px rgba(212,104,10,0.35)` }}>
          Add My Story →
        </button>
      </div>
    </div>
  );
}

// ── Proud Page ─────────────────────────────────────────────────────────────────
function ProudPage({ submissions }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = submissions.filter(s => {
    const q = search.toLowerCase();
    const ok = !q || [s.name, s.businessName, s.designation, s.description]
      .some(f => (f || "").toLowerCase().includes(q));
    return ok && (cat === "All" || s.category === cat);
  });

  const activeCats = ["All", ...new Set(submissions.map(s => s.category).filter(Boolean))];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: C.saffron,
          fontWeight: 700, marginBottom: "10px" }}>PROUD PEOPLE OF DALAPATHI SAMUTHIRAM</div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px" }}>Our Village Pride</h1>
        <p style={{ color: C.midL }}>
          {submissions.length} people making Dalapathi Samuthiram proud
        </p>
      </div>

      {/* Search + filters */}
      <div style={{ marginBottom: "28px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search by name, business, designation..."
          style={{ ...inp, maxWidth: "480px", display: "block", marginBottom: "14px",
            fontSize: "15px", padding: "12px 16px" }} />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {activeCats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: "7px 16px", borderRadius: "24px", cursor: "pointer",
                fontFamily: "inherit", fontSize: "13px", fontWeight: 600, transition: "all 0.15s",
                border: `1.5px solid ${cat === c ? C.saffron : C.border}`,
                background: cat === c ? C.saffron : C.white,
                color: cat === c ? "#fff" : C.gray }}>
              {c !== "All" ? catEmoji(c) + " " : ""}{c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px", color: C.grayL }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
          {submissions.length === 0
            ? "No approved members yet. Be the first to join!"
            : "No results found. Try a different search."}
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "20px" }}>
          {filtered.map(s => <PersonCard key={s.id} person={s} />)}
        </div>
      )}
    </div>
  );
}

function PersonCard({ person: s }) {
  const initials = s.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const hue = [...s.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const [hover, setHover] = useState(false);

  return (
    <div style={{ ...card, transition: "all 0.2s",
      transform: hover ? "translateY(-5px)" : "",
      boxShadow: hover ? "0 12px 32px rgba(168,78,6,0.15)" : "0 2px 8px rgba(168,78,6,0.07)" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ display: "flex", alignItems: "center", gap: "13px", marginBottom: "14px" }}>
        {s.photoUrl ? (
          <img src={s.photoUrl} alt={s.name} style={{ width: "56px", height: "56px",
            borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.border}`, flexShrink: 0 }} />
        ) : (
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0,
            background: `hsl(${hue},55%,88%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "20px", color: `hsl(${hue},55%,28%)` }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: C.dark,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {s.name}
          </div>
          {s.designation && (
            <div style={{ fontSize: "12px", color: C.midL, marginTop: "1px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s.designation}
            </div>
          )}
        </div>
      </div>
      {s.businessName && (
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.saffron,
          marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>🏢</span> {s.businessName}
        </div>
      )}
      {s.description && (
        <div style={{ fontSize: "13px", color: C.gray, lineHeight: 1.65, marginBottom: "12px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {s.description}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
        <span style={{ background: C.saffronBg, color: C.saffron, border: `1px solid ${C.saffronBorder}`,
          fontSize: "11px", fontWeight: 600, padding: "3px 11px", borderRadius: "24px" }}>
          {catEmoji(s.category)} {s.category}
        </span>
        {s.phone && (
          <a href={`tel:${s.phone}`} style={{ fontSize: "12px", color: C.green,
            textDecoration: "none", fontWeight: 600 }}>
            📞 {s.phone}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Join / Submit Form ────────────────────────────────────────────────────────
function JoinPage({ subs, saveSubs }) {
  const [form, setForm] = useState({
    name: "", designation: "", businessName: "",
    category: CATS[0], phone: "", email: "", description: ""
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, "")))
      e.phone = "Enter a valid 10-digit phone number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert("Photo must be under 2MB"); return; }
    const rd = new FileReader();
    rd.onload = ev => setPhoto(ev.target.result);
    rd.readAsDataURL(f);
  };

  const submit = async () => {
    if (!validate()) return;
    const entry = { id: Date.now().toString(), ...form, photoUrl: photo,
      status: "pending", submittedAt: new Date().toISOString() };
    await saveSubs([...subs, entry]);
    setDone(true);
  };

  const reset = () => {
    setForm({ name:"", designation:"", businessName:"", category:CATS[0], phone:"", email:"", description:"" });
    setPhoto(null); setErrors({}); setDone(false);
  };

  if (done) return (
    <div style={{ maxWidth: "560px", margin: "64px auto", padding: "0 20px", textAlign: "center" }}>
      <div style={{ ...card, padding: "52px 32px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ color: C.green, fontWeight: 800, margin: "0 0 10px" }}>Submitted!</h2>
        <p style={{ color: C.midL, lineHeight: 1.75, margin: "0 0 24px" }}>
          Thank you! Your story has been submitted and is waiting for admin review. 
          Once approved, it will appear in the "Our Pride" section.
        </p>
        <button onClick={reset} style={{ ...btn("primary"), padding: "12px 28px" }}>
          Submit Another Story
        </button>
      </div>
    </div>
  );

  const Field = ({ k, label, required, type = "text", placeholder = "" }) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px",
        fontWeight: 600, color: C.mid }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {type === "textarea" ? (
        <textarea value={form[k]} onChange={e => set(k, e.target.value)}
          placeholder={placeholder} rows={3}
          style={{ ...inp, resize: "vertical", minHeight: "80px" }} />
      ) : (
        <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
          placeholder={placeholder} style={inp} />
      )}
      {errors[k] && (
        <div style={{ color: C.red, fontSize: "12px", marginTop: "4px" }}>⚠ {errors[k]}</div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: C.saffron,
          fontWeight: 700, marginBottom: "10px" }}>JOIN OUR VILLAGE PRIDE</div>
        <h1 style={{ fontSize: "30px", fontWeight: 800, margin: "0 0 8px" }}>
          Add Your Story
        </h1>
        <p style={{ color: C.midL }}>
          From Dalapathi Samuthiram? Share your work and inspire others!
        </p>
      </div>

      <div style={card}>
        {/* Photo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div onClick={() => fileRef.current?.click()}
            style={{ width: "88px", height: "88px", borderRadius: "50%",
              margin: "0 auto 8px", border: `2px dashed ${C.saffronBorder}`,
              cursor: "pointer", overflow: "hidden", background: C.saffronBg,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
            {photo
              ? <img src={photo} alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "30px" }}>📷</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: "none" }} onChange={handlePhoto} />
          <div style={{ fontSize: "12px", color: C.grayL }}>
            {photo ? "Click to change photo" : "Click to add your photo (optional, max 2MB)"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <Field k="name" label="Full Name" required placeholder="e.g. Murugesan Ramasamy" />
          </div>
          <Field k="designation" label="Designation / Job Title"
            placeholder="e.g. Engineer, Farmer, Teacher, Business Owner" />
          <Field k="businessName" label="Business / Organization"
            placeholder="e.g. Murugesan Textiles, ABC Hospital" />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px",
            fontWeight: 600, color: C.mid }}>
            Category <span style={{ color: C.red }}>*</span>
          </label>
          <select value={form.category} onChange={e => set("category", e.target.value)}
            style={{ ...inp }}>
            {CATS.map(c => <option key={c} value={c}>{catEmoji(c)} {c}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field k="phone" label="Phone Number" type="tel" placeholder="10-digit mobile" />
          <Field k="email" label="Email Address" type="email" placeholder="name@gmail.com" />
        </div>

        <Field k="description" label="About You / Your Work" type="textarea"
          placeholder="Tell us about yourself, what you do, your achievements, how you contribute to society..." />

        <button onClick={submit}
          style={{ ...btn("primary"), width: "100%", padding: "14px", fontSize: "16px",
            boxShadow: `0 4px 16px rgba(212,104,10,0.3)`, marginTop: "4px" }}>
          Submit My Story →
        </button>
        <p style={{ textAlign: "center", fontSize: "12px", color: C.grayL,
          margin: "12px 0 0" }}>
          Your submission will be reviewed by admin before appearing publicly.
        </p>
      </div>
    </div>
  );
}

// ── Admin Login ───────────────────────────────────────────────────────────────
function AdminLogin({ users, onLogin }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  const login = () => {
    const found = users.find(x =>
      x.username.toLowerCase() === u.toLowerCase() && x.password === p && x.active !== false);
    if (found) { onLogin(found); setErr(""); }
    else setErr("Invalid username or password");
  };
  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔐</div>
        <h2 style={{ fontWeight: 800, margin: "0 0 4px" }}>Admin Login</h2>
        <p style={{ color: C.midL, fontSize: "14px" }}>Manage village content and members</p>
      </div>
      <div style={card}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px",
            fontWeight: 600, color: C.mid }}>Username</label>
          <input value={u} onChange={e => setU(e.target.value)} placeholder="admin"
            style={inp} onKeyDown={e => e.key === "Enter" && login()} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px",
            fontWeight: 600, color: C.mid }}>Password</label>
          <input type="password" value={p} onChange={e => setP(e.target.value)}
            placeholder="••••••••" style={inp} onKeyDown={e => e.key === "Enter" && login()} />
        </div>
        {err && <div style={{ background: C.redBg, color: C.red, padding: "10px 14px",
          borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>⚠ {err}</div>}
        <button onClick={login} style={{ ...btn("primary"), width: "100%", padding: "13px",
          fontSize: "15px", boxShadow: `0 4px 14px rgba(212,104,10,0.3)` }}>
          Login to Admin Panel
        </button>
      </div>
    </div>
  );
}

// ── Admin Dashboard ────────────────────────────────────────────────────────────
function AdminDash({ admin, story, photos, subs, users, saveStory, savePhotos, saveSubs, saveUsers }) {
  const [tab, setTab] = useState("submissions");
  const pending = subs.filter(s => s.status === "pending").length;

  const tabs = [
    { id: "submissions", label: "Submissions", badge: pending || null },
    { id: "photos",      label: "Gallery Photos" },
    { id: "story",       label: "About / Story" },
    { id: "users",       label: "User Management" }
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontWeight: 800, margin: "0 0 4px", fontSize: "24px" }}>Admin Dashboard</h1>
          <div style={{ color: C.midL, fontSize: "14px" }}>
            Logged in as <strong>{admin.username}</strong> · {admin.role}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { n: subs.filter(s=>s.status==="pending").length,  l: "Pending",  c: C.gold },
            { n: subs.filter(s=>s.status==="approved").length, l: "Approved", c: C.green },
            { n: subs.length,                                   l: "Total",    c: C.saffron }
          ].map(({ n, l, c }) => (
            <div key={l} style={{ ...card, padding: "10px 18px", textAlign: "center", minWidth: "80px" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: c }}>{n}</div>
              <div style={{ fontSize: "11px", color: C.grayL, fontWeight: 600 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: C.white,
        padding: "6px", borderRadius: "12px", border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...btn(tab===t.id?"primary":"ghost"),
              padding: "9px 18px", fontSize: "13px", position: "relative",
              background: tab===t.id ? C.saffron : "transparent",
              color: tab===t.id ? "#fff" : C.gray, border: "none" }}>
            {t.label}
            {t.badge ? (
              <span style={{ marginLeft: "7px", background: tab===t.id ? "rgba(255,255,255,0.25)" : C.red,
                color: "#fff", borderRadius: "20px", padding: "1px 8px", fontSize: "11px" }}>
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "submissions" && <SubmissionsTab subs={subs} saveSubs={saveSubs} />}
      {tab === "photos"      && <PhotosTab photos={photos} savePhotos={savePhotos} />}
      {tab === "story"       && <StoryTab story={story} saveStory={saveStory} />}
      {tab === "users"       && <UsersTab users={users} saveUsers={saveUsers} admin={admin} />}
    </div>
  );
}

// ── Submissions Tab ────────────────────────────────────────────────────────────
function SubmissionsTab({ subs, saveSubs }) {
  const [filter, setFilter] = useState("pending");
  const [exp, setExp] = useState(null);

  const filtered = filter === "all" ? subs : subs.filter(s => s.status === filter);

  const updateStatus = async (id, status) => {
    await saveSubs(subs.map(s => s.id === id ? { ...s, status } : s));
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this submission permanently?")) return;
    await saveSubs(subs.filter(s => s.id !== id));
    if (exp === id) setExp(null);
  };

  const statusStyle = {
    pending:  { bg: "#FFFBEB", text: C.gold,  border: "#FCD34D" },
    approved: { bg: C.greenBg, text: C.green, border: C.greenBorder },
    rejected: { bg: C.redBg,  text: C.red,   border: C.redBorder }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["pending", "approved", "rejected", "all"].map(f => {
          const n = f === "all" ? subs.length : subs.filter(s => s.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "7px 18px", borderRadius: "24px", cursor: "pointer",
                fontFamily: "inherit", fontSize: "13px", fontWeight: 600, transition: "all 0.15s",
                border: `1.5px solid ${filter===f ? C.saffron : C.border}`,
                background: filter===f ? C.saffron : C.white,
                color: filter===f ? "#fff" : C.gray,
                textTransform: "capitalize" }}>
              {f} ({n})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: C.grayL,
          background: C.white, borderRadius: "12px", border: `1.5px dashed ${C.border}` }}>
          No {filter} submissions
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(s => {
            const sc = statusStyle[s.status] || statusStyle.pending;
            const isExp = exp === s.id;
            return (
              <div key={s.id} style={{ ...card, padding: 0, overflow: "hidden" }}>
                <div onClick={() => setExp(isExp ? null : s.id)}
                  style={{ padding: "15px 20px", display: "flex", alignItems: "center",
                    gap: "12px", cursor: "pointer", background: isExp ? C.creamDark : C.white }}>
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name}
                      style={{ width: "44px", height: "44px", borderRadius: "50%",
                        objectFit: "cover", border: `2px solid ${C.border}`, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                      background: C.saffronBg, display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700, color: C.saffron, fontSize: "16px" }}>
                      {s.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: C.dark }}>{s.name}</div>
                    <div style={{ fontSize: "12px", color: C.gray }}>
                      {[s.designation, s.businessName, s.category].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                      borderRadius: "24px", padding: "3px 12px", fontSize: "12px", fontWeight: 700 }}>
                      {s.status}
                    </span>
                    <span style={{ color: C.gray, fontSize: "14px" }}>{isExp ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isExp && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: "20px",
                    background: "#FAFAF8" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                      gap: "10px 24px", marginBottom: "16px" }}>
                      {[["Phone", s.phone], ["Email", s.email], ["Category", s.category],
                        ["Submitted", new Date(s.submittedAt).toLocaleDateString("en-IN", {
                          day:"2-digit", month:"short", year:"numeric" })]
                      ].filter(([, v]) => v).map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: "11px", color: C.grayL, fontWeight: 700,
                            marginBottom: "2px" }}>{l.toUpperCase()}</div>
                          <div style={{ fontSize: "14px", color: C.dark }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {s.description && (
                      <div style={{ marginBottom: "16px", padding: "12px", background: C.white,
                        borderRadius: "8px", border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: "11px", color: C.grayL, fontWeight: 700,
                          marginBottom: "6px" }}>ABOUT</div>
                        <div style={{ fontSize: "14px", color: C.dark, lineHeight: 1.7 }}>
                          {s.description}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      {s.status !== "approved" && (
                        <button onClick={() => updateStatus(s.id, "approved")}
                          style={{ ...btn("green", "sm"), padding: "8px 18px", fontSize: "13px" }}>
                          ✓ Approve
                        </button>
                      )}
                      {s.status !== "rejected" && (
                        <button onClick={() => updateStatus(s.id, "rejected")}
                          style={{ ...btn("danger", "sm"), padding: "8px 18px", fontSize: "13px" }}>
                          ✗ Reject
                        </button>
                      )}
                      {s.status !== "pending" && (
                        <button onClick={() => updateStatus(s.id, "pending")}
                          style={{ ...btn("ghost", "sm"), padding: "8px 16px", fontSize: "13px",
                            color: C.gray, border: `1.5px solid ${C.border}` }}>
                          Reset to Pending
                        </button>
                      )}
                      <button onClick={() => remove(s.id)}
                        style={{ marginLeft: "auto", padding: "8px 16px", fontSize: "13px",
                          fontWeight: 600, background: "transparent", color: C.red,
                          border: `1.5px solid ${C.redBorder}`, borderRadius: "8px",
                          cursor: "pointer", fontFamily: "inherit" }}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Photos Tab ─────────────────────────────────────────────────────────────────
function PhotosTab({ photos, savePhotos }) {
  const [cap, setCap] = useState("");
  const fileRef = useRef();
  const MAX = 5;

  const addPhoto = (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    if (photos.length >= MAX) { alert(`Max ${MAX} photos allowed. Delete one first.`); return; }
    if (f.size > 3 * 1024 * 1024) { alert("Photo must be under 3MB"); return; }
    const rd = new FileReader();
    rd.onload = async ev => {
      await savePhotos([...photos, { id: Date.now(), url: ev.target.result, caption: cap || f.name }]);
      setCap("");
    };
    rd.readAsDataURL(f);
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this photo?")) return;
    await savePhotos(photos.filter(p => p.id !== id));
  };

  const updateCap = async (id, c) =>
    await savePhotos(photos.map(p => p.id === id ? { ...p, caption: c } : p));

  return (
    <div>
      <div style={{ ...card, marginBottom: "24px" }}>
        <h3 style={{ fontWeight: 700, margin: "0 0 16px", fontSize: "16px" }}>
          Upload Photo ({photos.length} / {MAX})
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px",
              fontWeight: 600, color: C.mid }}>Caption (optional)</label>
            <input value={cap} onChange={e => setCap(e.target.value)}
              placeholder="e.g. Village temple, Festival 2024..." style={inp} />
          </div>
          <button onClick={() => fileRef.current?.click()}
            disabled={photos.length >= MAX}
            style={{ ...btn("primary"), opacity: photos.length >= MAX ? 0.45 : 1,
              whiteSpace: "nowrap" }}>
            📷 Upload Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: "none" }} onChange={addPhoto} />
        </div>
        {photos.length >= MAX && (
          <div style={{ marginTop: "10px", fontSize: "13px", color: C.red }}>
            Maximum {MAX} photos reached. Remove one to upload another.
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: C.grayL,
          background: C.white, borderRadius: "12px", border: `2px dashed ${C.border}` }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🖼️</div>
          No photos uploaded yet
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {photos.map(p => (
            <div key={p.id} style={card}>
              <div style={{ borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3", marginBottom: "10px" }}>
                <img src={p.url} alt={p.caption}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <input value={p.caption || ""} onChange={e => updateCap(p.id, e.target.value)}
                style={{ ...inp, fontSize: "12px", marginBottom: "8px" }} placeholder="Caption..." />
              <button onClick={() => remove(p.id)}
                style={{ width: "100%", padding: "7px", fontSize: "12px", fontWeight: 600,
                  background: "transparent", color: C.red, border: `1px solid ${C.redBorder}`,
                  borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Story Tab ──────────────────────────────────────────────────────────────────
function StoryTab({ story, saveStory }) {
  const [form, setForm] = useState({ ...story });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    await saveStory(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ ...card, maxWidth: "680px" }}>
      <h3 style={{ fontWeight: 700, margin: "0 0 20px" }}>Edit Village Story & About</h3>
      {[
        ["title",   "Village Name",      "text",  "Dalapathi Samuthiram"],
        ["subtitle","Subtitle / Location","text",  "Keelur · Nanguneri · Tirunelveli"],
        ["tagline", "Hero Tagline",       "text",  "Making Dalapathi Samuthiram Proud"]
      ].map(([k, l, t, ph]) => (
        <div key={k} style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px",
            fontWeight: 600, color: C.mid }}>{l}</label>
          <input type={t} value={form[k] || ""} onChange={e => set(k, e.target.value)}
            placeholder={ph} style={inp} />
        </div>
      ))}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px",
          fontWeight: 600, color: C.mid }}>Village Story / Description</label>
        <textarea value={form.content || ""} onChange={e => set("content", e.target.value)}
          rows={6} style={{ ...inp, resize: "vertical", minHeight: "130px" }}
          placeholder="Write about your village — its history, values, proud people..." />
      </div>
      {saved && (
        <div style={{ background: C.greenBg, color: C.green, padding: "10px 14px",
          borderRadius: "8px", marginBottom: "14px", fontSize: "14px", fontWeight: 600 }}>
          ✓ Saved successfully!
        </div>
      )}
      <button onClick={save}
        style={{ ...btn("primary"), padding: "12px 28px", fontSize: "15px" }}>
        Save Changes
      </button>
    </div>
  );
}

// ── Users Tab ──────────────────────────────────────────────────────────────────
function UsersTab({ users, saveUsers, admin }) {
  const [form, setForm] = useState({ username:"", password:"", role:"ADMIN", active:true });
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2800);
  };

  const saveUser = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      showMsg("Username and password are required", false); return;
    }
    const idx = users.findIndex(u => u.username.toLowerCase() === form.username.toLowerCase());
    let updated;
    if (editMode && idx >= 0) {
      updated = users.map((u, i) => i === idx ? { ...form } : u);
    } else if (idx >= 0) {
      showMsg("Username already exists", false); return;
    } else {
      updated = [...users, { ...form }];
    }
    await saveUsers(updated);
    setForm({ username:"", password:"", role:"ADMIN", active:true });
    setEditMode(false);
    showMsg(editMode ? "User updated!" : "New user created!");
  };

  const deleteUser = async (uname) => {
    if (uname === admin.username) { showMsg("You cannot delete your own account", false); return; }
    if (!window.confirm(`Delete user "${uname}"?`)) return;
    await saveUsers(users.filter(u => u.username !== uname));
    showMsg("User deleted");
  };

  const startEdit = (u) => { setForm({ ...u }); setEditMode(true); };
  const cancelEdit = () => { setForm({ username:"", password:"", role:"ADMIN", active:true }); setEditMode(false); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px", alignItems: "start" }}>
      {/* Form */}
      <div style={card}>
        <h3 style={{ fontWeight: 700, margin: "0 0 16px" }}>
          {editMode ? "Edit User" : "Add New User"}
        </h3>
        {[["username","Username","text"],["password","Password","password"]].map(([k,l,t]) => (
          <div key={k} style={{ marginBottom: "14px" }}>
            <label style={{ display:"block", marginBottom:"6px", fontSize:"13px",
              fontWeight:600, color:C.mid }}>{l}</label>
            <input type={t} value={form[k]||""} onChange={e => set(k,e.target.value)}
              disabled={editMode && k==="username"}
              style={{ ...inp, opacity: editMode&&k==="username" ? 0.55 : 1 }} />
          </div>
        ))}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display:"block", marginBottom:"6px", fontSize:"13px",
            fontWeight:600, color:C.mid }}>Role</label>
          <select value={form.role} onChange={e => set("role",e.target.value)} style={inp}>
            <option value="ADMIN">ADMIN (full access)</option>
            <option value="VIEWER">VIEWER (read-only)</option>
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"18px" }}>
          <input type="checkbox" id="uactive" checked={form.active !== false}
            onChange={e => set("active", e.target.checked)}
            style={{ width:"16px", height:"16px", accentColor: C.saffron }} />
          <label htmlFor="uactive" style={{ fontSize:"14px", color:C.mid, fontWeight:500 }}>
            Active (can login)
          </label>
        </div>
        {msg && (
          <div style={{ background: msg.ok ? C.greenBg : C.redBg,
            color: msg.ok ? C.green : C.red, padding:"9px 13px",
            borderRadius:"8px", marginBottom:"12px", fontSize:"13px", fontWeight:600 }}>
            {msg.ok ? "✓" : "⚠"} {msg.text}
          </div>
        )}
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={saveUser} style={{ ...btn("primary"), flex:1 }}>
            {editMode ? "Update" : "Add User"}
          </button>
          {editMode && (
            <button onClick={cancelEdit}
              style={{ ...btn("ghost"), color:C.gray, border:`1.5px solid ${C.border}` }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Users list */}
      <div>
        <h3 style={{ fontWeight:700, margin:"0 0 14px" }}>All Users ({users.length})</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {users.map(u => (
            <div key={u.username}
              style={{ ...card, padding:"14px 18px", display:"flex",
                alignItems:"center", gap:"12px" }}>
              <div style={{ width:"40px", height:"40px", borderRadius:"50%", flexShrink:0,
                background: u.role==="ADMIN" ? C.saffronBg : C.greenBg,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:800, fontSize:"16px",
                color: u.role==="ADMIN" ? C.saffron : C.green }}>
                {u.username[0].toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:"14px" }}>
                  {u.username}
                  {u.username===admin.username && (
                    <span style={{ marginLeft:"8px", fontSize:"11px", color:C.grayL,
                      background:C.grayBg, padding:"2px 8px", borderRadius:"10px" }}>
                      you
                    </span>
                  )}
                </div>
                <div style={{ fontSize:"12px", color:C.grayL }}>
                  {u.role} · {u.active===false ? "Inactive" : "Active"}
                </div>
              </div>
              <div style={{ display:"flex", gap:"6px" }}>
                <button onClick={() => startEdit(u)}
                  style={{ padding:"6px 14px", borderRadius:"8px", cursor:"pointer",
                    fontFamily:"inherit", fontSize:"12px", fontWeight:600,
                    background:"transparent", color:C.saffron,
                    border:`1.5px solid ${C.saffronBorder}` }}>
                  Edit
                </button>
                <button onClick={() => deleteUser(u.username)}
                  disabled={u.username===admin.username}
                  style={{ padding:"6px 14px", borderRadius:"8px", cursor:"pointer",
                    fontFamily:"inherit", fontSize:"12px", fontWeight:600,
                    background:"transparent", color:C.red,
                    border:`1.5px solid ${C.redBorder}`,
                    opacity: u.username===admin.username ? 0.35 : 1 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function SectionHead({ children }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px", color: C.dark }}>
        {children}
      </h2>
      <div style={{ width: "36px", height: "3px", background: C.saffron, borderRadius: "2px" }} />
    </div>
  );
}