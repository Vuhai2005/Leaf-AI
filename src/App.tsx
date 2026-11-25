import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, Bell, BookOpen,
  Camera, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, CloudUpload, Download, FileImage, Filter, Flower2,
  Gauge, Grid2X2, History, Leaf, LogOut, Menu, Microscope, Moon, MoreHorizontal,
  Search, Settings, ShieldCheck, Sparkles, Sun, Trash2, TrendingUp, Upload,
  UserRound, X, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

type Page = "Tổng quan" | "Phân tích ảnh" | "Lịch sử" | "Thư viện bệnh" | "Cài đặt";
type Analysis = {
  id: string; name: string; plant: string; disease: string; confidence: number;
  date: string; image: string; status: "Hoàn tất";
};
const KEY = "leafai_demo_history_v1";
const userKey = "leafai_demo_user_v1";
const chartData = [
  { day: "T2", total: 12 }, { day: "T3", total: 18 }, { day: "T4", total: 15 },
  { day: "T5", total: 27 }, { day: "T6", total: 22 }, { day: "T7", total: 34 }, { day: "CN", total: 29 }
];
const diseases = [
  { name: "Đốm lá", latin: "Leaf spot", type: "Nấm", color: "#e9a23b", desc: "Xuất hiện các đốm nâu hoặc đen trên bề mặt lá, có thể lan rộng khi độ ẩm cao.", advice: "Loại bỏ lá bị bệnh, tăng thông thoáng và hạn chế tưới lên tán lá." },
  { name: "Phấn trắng", latin: "Powdery mildew", type: "Nấm", color: "#9c9ba5", desc: "Lớp bột trắng phủ trên bề mặt lá, làm giảm khả năng quang hợp.", advice: "Tỉa cành, giảm ẩm độ và theo dõi các lá non." },
  { name: "Rỉ sắt", latin: "Rust", type: "Nấm", color: "#c87535", desc: "Các mụn màu vàng cam hoặc nâu đỏ thường xuất hiện ở mặt dưới lá.", advice: "Thu gom lá bệnh, tránh để cây quá dày và kiểm tra cây lân cận." },
  { name: "Khảm lá", latin: "Mosaic virus", type: "Virus", color: "#56a77a", desc: "Lá loang lổ xanh đậm - xanh nhạt, đôi khi biến dạng hoặc xoăn.", advice: "Cách ly cây nghi nhiễm, vệ sinh dụng cụ và kiểm soát côn trùng môi giới." }
];
const readHistory = (): Analysis[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
const saveHistory = (items: Analysis[]) => localStorage.setItem(KEY, JSON.stringify(items));
const fmt = (date: string) => new Date(date).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

function App() {
  const [page, setPage] = useState<Page>("Tổng quan");
  const [history, setHistory] = useState<Analysis[]>(readHistory);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(localStorage.getItem(userKey) || "Nguyễn Minh Anh");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [plant, setPlant] = useState("Cà chua");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tất cả");
  const [toast, setToast] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveHistory(history); }, [history]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => ({
    total: history.length,
    healthy: history.filter(x => x.disease === "Khỏe mạnh").length,
    disease: history.filter(x => x.disease !== "Khỏe mạnh").length,
    average: history.length ? Math.round(history.reduce((s, x) => s + x.confidence, 0) / history.length) : 0
  }), [history]);

  const chooseFile = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setToast("Vui lòng chọn tệp hình ảnh."); return; }
    if (f.size > 12 * 1024 * 1024) { setToast("Ảnh vượt quá 12 MB. Hãy chọn ảnh nhỏ hơn."); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null);
  };

  const analyze = async () => {
    if (!file || !preview) { setToast("Hãy tải ảnh lá cây lên trước."); return; }
    setBusy(true); setResult(null);
    await new Promise(resolve => setTimeout(resolve, 1700));
    const outcomes = [
      { disease: "Đốm lá", confidence: 92, healthy: false },
      { disease: "Khỏe mạnh", confidence: 96, healthy: true },
      { disease: "Phấn trắng", confidence: 88, healthy: false },
      { disease: "Rỉ sắt", confidence: 90, healthy: false }
    ];
    const seed = file.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const outcome = outcomes[seed % outcomes.length];
    const item: Analysis = {
      id: `LA-${Date.now().toString().slice(-7)}`, name: file.name, plant,
      disease: outcome.disease, confidence: outcome.confidence,
      date: new Date().toISOString(), image: preview, status: "Hoàn tất"
    };
    setHistory(prev => [item, ...prev]); setResult(item); setBusy(false);
    setToast("Đã tạo kết quả phân tích minh họa.");
  };

  const removeRecord = (id: string) => {
    setHistory(prev => prev.filter(x => x.id !== id));
    if (result?.id === id) setResult(null);
    setToast("Đã xóa bản ghi.");
  };

  const exportCsv = () => {
    const rows = [["Mã", "Tên ảnh", "Loại cây", "Kết quả demo", "Độ tin cậy minh họa", "Thời gian"],
      ...history.map(x => [x.id, x.name, x.plant, x.disease, `${x.confidence}%`, fmt(x.date)])];
    const csv = "\uFEFF" + rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "leafai-history.csv"; a.click(); URL.revokeObjectURL(a.href);
    setToast("Đã xuất lịch sử dạng CSV.");
  };

  const nav = [
    { label: "Tổng quan" as Page, icon: Grid2X2, group: "WORKSPACE" },
    { label: "Phân tích ảnh" as Page, icon: Microscope, group: "WORKSPACE" },
    { label: "Lịch sử" as Page, icon: History, group: "WORKSPACE" },
    { label: "Thư viện bệnh" as Page, icon: BookOpen, group: "KNOWLEDGE" },
    { label: "Cài đặt" as Page, icon: Settings, group: "SYSTEM" }
  ];

  const Sidebar = () => <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
    <div className="brand"><div className="brand-mark"><Leaf size={22}/></div><div><b>LeafAI</b><span>PLANT INTELLIGENCE</span></div><button className="mobile-close icon-btn" onClick={() => setMobileOpen(false)}><X/></button></div>
    <div className="workspace-switch"><div className="workspace-avatar">L</div><div><b>LeafAI Workspace</b><small>Không gian cá nhân</small></div><ChevronDown size={15}/></div>
    {["WORKSPACE", "KNOWLEDGE", "SYSTEM"].map(group => <div className="nav-group" key={group}><p>{group}</p>{nav.filter(n => n.group === group).map(n => <button key={n.label} className={`nav-item ${page === n.label ? "active" : ""}`} onClick={() => { setPage(n.label); setMobileOpen(false); }}><n.icon size={18}/><span>{n.label}</span>{n.label === "Lịch sử" && history.length > 0 && <em>{history.length}</em>}</button>)}</div>)}
    <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><b>Cần trợ giúp?</b><span>Khám phá hướng dẫn sử dụng LeafAI.</span><button onClick={() => setToast("LeafAI Demo: sử dụng mục Phân tích ảnh để thử quy trình.")}>Trung tâm trợ giúp <ArrowRight size={14}/></button></div><div className="sidebar-user"><div className="avatar">MA</div><div><b>{user}</b><small>Người dùng bản demo</small></div><button className="icon-btn" onClick={() => setShowProfile(v => !v)}><MoreHorizontal size={19}/></button></div></div>
  </aside>;

  return <div className={`app-shell ${dark ? "dark" : ""}`}>
    <Sidebar />
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)}><Menu/></button><span className="breadcrumb">Workspace</span><ChevronRight size={15}/><b>{page}</b></div><div className="topbar-actions"><div className="system-status"><span/> Hệ thống sẵn sàng</div><button className="icon-btn" title="Chuyển giao diện" onClick={() => setDark(v => !v)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="icon-btn notification" onClick={() => setToast("Bạn không có thông báo mới.")}><Bell size={18}/><i/></button><button className="top-avatar" onClick={() => setShowProfile(v => !v)}>MA</button></div></header>
      {showProfile && <div className="profile-pop"><b>{user}</b><small>Chế độ sử dụng: Demo cục bộ</small><button onClick={() => { localStorage.removeItem(userKey); setUser("Nguyễn Minh Anh"); setShowProfile(false); setToast("Đã đặt lại hồ sơ demo."); }}>Đặt lại hồ sơ</button></div>}
      <div className="page-content">
        {page === "Tổng quan" && <section className="page-enter">
          <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> PLANT HEALTH OVERVIEW</div><h1>Chào buổi sáng, {user.split(" ").slice(-2).join(" ")} <span className="wave">✦</span></h1><p>Theo dõi sức khỏe cây trồng và khám phá dữ liệu phân tích của bạn.</p></div><button className="primary-btn" onClick={() => setPage("Phân tích ảnh")}><Upload size={17}/> Phân tích ảnh mới</button></div>
          <div className="notice"><div className="notice-icon"><AlertCircle size={18}/></div><div><b>Phiên bản giao diện demo</b><span>Kết quả phân tích hiện được tạo minh họa tại trình duyệt, chưa sử dụng mô hình AI nhận dạng bệnh thực tế.</span></div><button onClick={() => setPage("Cài đặt")}><span>Tìm hiểu</span><ArrowRight size={15}/></button></div>
          <div className="stats-grid">
            <Stat icon={Activity} label="Tổng lượt phân tích" value={stats.total.toString()} trend="Dữ liệu trên thiết bị" tone="green"/>
            <Stat icon={ShieldCheck} label="Mẫu khỏe mạnh" value={stats.healthy.toString()} trend="Theo kết quả demo" tone="mint"/>
            <Stat icon={AlertCircle} label="Mẫu cần chú ý" value={stats.disease.toString()} trend="Theo kết quả demo" tone="amber"/>
            <Stat icon={Gauge} label="Tin cậy trung bình" value={`${stats.average}%`} trend="Chỉ số minh họa" tone="blue"/>
          </div>
          <div className="dashboard-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h3>Hoạt động phân tích</h3><p>Tổng quan hoạt động trong 7 ngày gần nhất</p></div><span className="period-pill">7 ngày qua <ChevronDown size={13}/></span></div><div className="chart-legend"><span><i/> Lượt phân tích mẫu</span><b>+18.6% <TrendingUp size={14}/></b></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:12,right:8,left:-22,bottom:0}}><defs><linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#48a66c" stopOpacity={0.22}/><stop offset="100%" stopColor="#48a66c" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"var(--muted)",fontSize:12}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:"var(--muted)",fontSize:11}}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid var(--line)",background:"var(--surface)",color:"var(--text)"}}/><Area type="monotone" dataKey="total" stroke="#3e9862" strokeWidth={2.5} fill="url(#greenFill)" activeDot={{r:5,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div></div>
          <div className="panel quick-panel"><div className="panel-heading"><div><h3>Thao tác nhanh</h3><p>Bắt đầu công việc của bạn</p></div><Zap size={19} className="green-icon"/></div><button className="quick-action" onClick={() => setPage("Phân tích ảnh")}><div className="quick-icon green"><Camera/></div><div><b>Phân tích hình ảnh</b><small>Tải ảnh lá cây lên hệ thống</small></div><ArrowRight/></button><button className="quick-action" onClick={() => setPage("Lịch sử")}><div className="quick-icon blue"><History/></div><div><b>Xem lịch sử</b><small>Quản lý các lần phân tích</small></div><ArrowRight/></button><button className="quick-action" onClick={() => setPage("Thư viện bệnh")}><div className="quick-icon orange"><BookOpen/></div><div><b>Tra cứu bệnh cây</b><small>Kiến thức và hướng dẫn chăm sóc</small></div><ArrowRight/></button></div></div>
          <div className="panel recent-panel"><div className="panel-heading"><div><h3>Phân tích gần đây</h3><p>Các mẫu hình ảnh được xử lý gần nhất</p></div><button className="text-btn" onClick={() => setPage("Lịch sử")}>Xem tất cả <ArrowRight size={15}/></button></div><HistoryTable items={history.slice(0,4)} onDelete={removeRecord} onOpen={x => {setResult(x);setPage("Phân tích ảnh");}} emptyText="Chưa có dữ liệu. Hãy bắt đầu bằng một ảnh lá cây." /></div>
        </section>}

        {page === "Phân tích ảnh" && <section className="page-enter">
          <PageTitle eyebrow="IMAGE INTELLIGENCE" title="Phân tích hình ảnh" subtitle="Tải lên hình ảnh lá cây để chạy quy trình phân tích minh họa."/>
          <div className="analysis-layout"><div className="panel upload-panel"><div className="panel-heading"><div><h3>Thông tin mẫu ảnh</h3><p>Chọn ảnh rõ nét, đủ sáng để quan sát bề mặt lá.</p></div><span className="step-label">BƯỚC 01</span></div><label className="field-label">Loại cây trồng</label><select className="select-input" value={plant} onChange={e => setPlant(e.target.value)}><option>Cà chua</option><option>Lúa</option><option>Ngô</option><option>Khoai tây</option><option>Dưa chuột</option><option>Ớt</option><option>Khác</option></select>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => chooseFile(e.target.files?.[0])}/>
            {!preview ? <button className="dropzone" onClick={() => inputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault();chooseFile(e.dataTransfer.files[0]);}}><div className="upload-symbol"><CloudUpload size={27}/></div><b>Kéo thả hình ảnh vào đây</b><span>hoặc <u>duyệt tệp từ thiết bị</u></span><small>JPG, PNG, WEBP · Tối đa 12 MB</small></button> : <div className="preview-box"><img src={preview} alt="Ảnh lá cây đã tải lên"/><div className="preview-overlay"><span><FileImage size={15}/>{file?.name}</span><button onClick={() => {setFile(null);setPreview("");setResult(null);}}><Trash2 size={15}/> Xóa ảnh</button></div></div>}
            <div className="privacy-note"><ShieldCheck size={16}/> Ảnh được lưu trong bộ nhớ phiên trình duyệt; không tải lên máy chủ.</div><button className="primary-btn analyze-btn" disabled={!file || busy} onClick={analyze}>{busy ? <><span className="spinner"/> Đang xử lý ảnh...</> : <><Sparkles size={17}/> Bắt đầu phân tích <ArrowRight size={16}/></>}</button>
          </div><div className="panel guide-panel"><div className="panel-heading"><div><h3>Hướng dẫn chụp ảnh</h3><p>Giúp hình ảnh đầu vào dễ quan sát hơn</p></div><Flower2 className="green-icon"/></div><div className="guide-list"><Guide n="01" title="Ánh sáng tự nhiên" desc="Tránh bóng đổ mạnh hoặc ánh sáng quá gắt."/><Guide n="02" title="Lấy nét rõ ràng" desc="Giữ camera ổn định, tập trung vào bề mặt lá."/><Guide n="03" title="Chụp toàn bộ vùng lá" desc="Không cắt mất phần mép hoặc vùng có dấu hiệu bất thường."/><Guide n="04" title="Nền ảnh đơn giản" desc="Hạn chế vật thể khác che khuất chiếc lá."/></div><div className="guide-tip"><Sparkles size={16}/><span><b>Mẹo nhỏ</b><br/>Chụp cả mặt trên và mặt dưới lá nếu có thể.</span></div></div></div>
          {busy && <div className="processing panel"><div className="processing-orbit"><Leaf size={28}/></div><div><b>Đang xử lý hình ảnh</b><p>Đang chuẩn bị dữ liệu và tạo kết quả demo...</p></div><div className="progress-track"><i/></div></div>}
          {result && <div className="panel result-panel"><div className="panel-heading"><div><div className="eyebrow"><CheckCircle2 size={14}/> ANALYSIS COMPLETE</div><h3>Kết quả phân tích minh họa</h3><p>Mã phiên: {result.id} · {fmt(result.date)}</p></div><span className="demo-chip">DEMO RESULT</span></div><div className="result-content"><img src={result.image} alt="Ảnh mẫu"/><div className="result-main"><span className={`result-tag ${result.disease === "Khỏe mạnh" ? "healthy" : "warning"}`}>{result.disease === "Khỏe mạnh" ? "Không phát hiện dấu hiệu trong demo" : "Có dấu hiệu cần kiểm tra"}</span><h2>{result.disease}</h2><p>Loại cây: <b>{result.plant}</b> · Tệp: {result.name}</p><div className="confidence"><div><span>Chỉ số minh họa</span><b>{result.confidence}%</b></div><div className="confidence-track"><i style={{width:`${result.confidence}%`}}/></div></div></div></div><div className="result-disclaimer"><AlertCircle size={16}/> Đây là kết quả được tạo theo logic demo ở frontend, không phải chẩn đoán AI và không dùng để quyết định xử lý cây trồng.</div><div className="result-actions"><button className="secondary-btn" onClick={() => {setFile(null);setPreview("");setResult(null);}}>Phân tích ảnh khác</button><button className="primary-btn" onClick={() => setPage("Lịch sử")}>Mở lịch sử <ArrowRight size={15}/></button></div></div>}
        </section>}

        {page === "Lịch sử" && <section className="page-enter"><PageTitle eyebrow="YOUR RECORDS" title="Lịch sử phân tích" subtitle="Theo dõi, tìm kiếm và quản lý các phiên phân tích được lưu trên thiết bị."/><div className="history-summary"><div><span>Tổng bản ghi</span><b>{history.length}</b></div><div><span>Khỏe mạnh</span><b>{stats.healthy}</b></div><div><span>Cần chú ý</span><b>{stats.disease}</b></div><button className="secondary-btn" onClick={exportCsv} disabled={!history.length}><Download size={16}/> Xuất CSV</button></div><div className="panel recent-panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Tìm theo tên ảnh, mã phiên..." value={query} onChange={e => setQuery(e.target.value)}/></div><div className="filter-select"><Filter size={16}/><select value={filter} onChange={e => setFilter(e.target.value)}><option>Tất cả</option><option>Khỏe mạnh</option><option>Có dấu hiệu</option></select></div></div><HistoryTable items={history.filter(x => `${x.name} ${x.id} ${x.plant}`.toLowerCase().includes(query.toLowerCase())).filter(x => filter === "Tất cả" || (filter === "Khỏe mạnh" ? x.disease === "Khỏe mạnh" : x.disease !== "Khỏe mạnh"))} onDelete={removeRecord} onOpen={x => {setResult(x);setPage("Phân tích ảnh");}} emptyText="Không tìm thấy bản ghi phù hợp." /></div></section>}

        {page === "Thư viện bệnh" && <section className="page-enter"><PageTitle eyebrow="PLANT KNOWLEDGE BASE" title="Thư viện bệnh cây" subtitle="Tra cứu một số dấu hiệu thường gặp và gợi ý chăm sóc cơ bản."/><div className="library-banner"><div className="library-art"><Leaf size={66}/><span/><i/></div><div><div className="eyebrow">LEARN · IDENTIFY · CARE</div><h2>Hiểu cây trồng tốt hơn mỗi ngày.</h2><p>Kiến thức tham khảo giúp bạn nhận biết dấu hiệu bất thường và chủ động theo dõi vườn cây.</p></div></div><div className="disease-grid">{diseases.map((d,i)=><article className="panel disease-card" key={d.name}><div className="disease-top"><div className="disease-icon" style={{"--disease":d.color} as React.CSSProperties}><Leaf size={22}/></div><span>{d.type}</span></div><h3>{d.name}</h3><small>{d.latin}</small><p>{d.desc}</p><div className="advice"><b>Gợi ý chăm sóc</b><span>{d.advice}</span></div><button className="text-btn" onClick={() => setToast(`Đã mở ghi chú tham khảo: ${d.name}.`)}>Xem ghi chú <ArrowRight size={14}/></button></article>)}</div><p className="library-disclaimer"><AlertCircle size={15}/> Thông tin chỉ mang tính tham khảo. Cần xác minh bằng quan sát thực tế hoặc chuyên gia nông nghiệp.</p></section>}

        {page === "Cài đặt" && <section className="page-enter"><PageTitle eyebrow="PREFERENCES" title="Cài đặt" subtitle="Tùy chỉnh trải nghiệm sử dụng LeafAI trên thiết bị hiện tại."/><div className="settings-layout"><div className="panel settings-panel"><div className="settings-heading"><div className="settings-icon"><UserRound/></div><div><h3>Hồ sơ cá nhân</h3><p>Thông tin hiển thị trong không gian làm việc</p></div></div><label className="field-label">Tên hiển thị</label><input className="text-input" value={user} onChange={e => setUser(e.target.value)} maxLength={40}/><button className="primary-btn small-btn" onClick={() => {localStorage.setItem(userKey,user.trim() || "Nguyễn Minh Anh");setUser(user.trim() || "Nguyễn Minh Anh");setToast("Đã lưu hồ sơ trên thiết bị.");}}>Lưu thay đổi</button></div><div className="panel settings-panel"><div className="settings-heading"><div className="settings-icon"><Moon/></div><div><h3>Giao diện</h3><p>Chọn chế độ hiển thị phù hợp</p></div></div><div className="setting-row"><div><b>Chế độ tối</b><small>Áp dụng cho toàn bộ giao diện</small></div><button className={`toggle ${dark ? "on" : ""}`} onClick={() => setDark(v => !v)} aria-label="Bật tắt chế độ tối"><i/></button></div></div><div className="panel settings-panel"><div className="settings-heading"><div className="settings-icon"><DatabaseIcon/></div><div><h3>Dữ liệu cục bộ</h3><p>Lịch sử phân tích được lưu trong localStorage</p></div></div><div className="setting-row"><div><b>Xóa toàn bộ lịch sử</b><small>Thao tác này không thể hoàn tác.</small></div><button className="danger-btn" onClick={() => {if(window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử?")) {setHistory([]);setResult(null);setToast("Đã xóa toàn bộ lịch sử.");}}}><Trash2 size={15}/> Xóa dữ liệu</button></div></div><div className="panel about-panel"><div className="about-logo"><Leaf size={25}/></div><div><b>LeafAI <span>v1.0.0 Demo</span></b><p>Plant Intelligence · Frontend-only experience</p></div><span className="about-status"><i/> Đang hoạt động</span></div></div></section>}
      </div>
      <footer className="footer"><span>© 2026 LeafAI · Plant Intelligence</span><span>Được thiết kế cho trải nghiệm học tập và trình diễn</span></footer>
    </main>
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={() => setToast("")}><X size={15}/></button></div>}
  </div>;
}

function DatabaseIcon() { return <Activity/>; }
function Stat({icon: Icon,label,value,trend,tone}:{icon:any;label:string;value:string;trend:string;tone:string}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><small>{trend}</small><div className="stat-decoration"><ArrowDownRight size={54}/></div></div>;
}
function PageTitle({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}) {
  return <div className="page-title"><div className="eyebrow"><Sparkles size={14}/>{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>;
}
function Guide({n,title,desc}:{n:string;title:string;desc:string}) {
  return <div className="guide-item"><span>{n}</span><div><b>{title}</b><p>{desc}</p></div><Check size={16}/></div>;
}
function HistoryTable({items,onDelete,onOpen,emptyText}:{items:Analysis[];onDelete:(id:string)=>void;onOpen:(x:Analysis)=>void;emptyText:string}) {
  if (!items.length) return <div className="empty-state"><div><Flower2 size={25}/></div><b>Chưa có dữ liệu</b><p>{emptyText}</p></div>;
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>MẪU HÌNH ẢNH</th><th>LOẠI CÂY</th><th>KẾT QUẢ DEMO</th><th>CHỈ SỐ</th><th>THỜI GIAN</th><th></th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><button className="file-cell" onClick={() => onOpen(x)}><img src={x.image} alt=""/><span><b>{x.name}</b><small>{x.id}</small></span></button></td><td>{x.plant}</td><td><span className={`status-pill ${x.disease === "Khỏe mạnh" ? "ok" : "warn"}`}><i/>{x.disease}</span></td><td><b>{x.confidence}%</b><small className="sub-cell">Minh họa</small></td><td>{new Date(x.date).toLocaleDateString("vi-VN")}</td><td><button className="icon-btn delete-btn" title="Xóa bản ghi" onClick={() => onDelete(x.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>;
}

export default App;
