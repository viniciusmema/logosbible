"use client";
import { useState, useEffect } from "react";

const BOOKS = ["Gênesis","Êxodo","Levítico","Números","Deuteronômio","Josué","Juízes","Rute","1 Samuel","2 Samuel","1 Reis","2 Reis","1 Crônicas","2 Crônicas","Esdras","Neemias","Ester","Jó","Salmos","Provérbios","Eclesiastes","Cantares","Isaías","Jeremias","Lamentações","Ezequiel","Daniel","Oseias","Joel","Amós","Obadias","Jonas","Miquéias","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias","Mateus","Marcos","Lucas","João","Atos","Romanos","1 Coríntios","2 Coríntios","Gálatas","Efésios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses","1 Timóteo","2 Timóteo","Tito","Filemom","Hebreus","Tiago","1 Pedro","2 Pedro","1 João","2 João","3 João","Judas","Apocalipse"];

const C = {
  bg: "#0a0a12",
  sidebar: "#0d0d18",
  surface: "#12121f",
  border: "#1e1e30",
  gold: "#c8a96e",
  goldDim: "#8a7248",
  cream: "#e4dcc8",
  muted: "#c0b8a8",
  dim: "#7a7490",
  faint: "#3a3658",
  error: "#e07070",
  errorBg: "#1a0e0e",
};

const S = {
  root: { display:"flex", height:"100vh", background:C.bg, color:C.cream, fontFamily:"'Crimson Text', Georgia, serif", overflow:"hidden" },
  sidebar: { background:C.sidebar, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0, transition:"width 0.25s ease" },
  sidebarHead: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 16px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 },
  logoText: { fontFamily:"'Playfair Display', Georgia, serif", fontSize:22, fontWeight:700, color:C.gold, letterSpacing:"0.06em" },
  toggleBtn: { background:"none", border:"none", color:C.faint, cursor:"pointer", fontSize:18, padding:"4px 6px", lineHeight:1, borderRadius:4 },
  newBtn: { margin:"14px 14px 10px", padding:"10px 0", background:"transparent", border:`1px solid ${C.gold}`, color:C.gold, borderRadius:6, cursor:"pointer", fontSize:14, fontFamily:"'Crimson Text', Georgia, serif", letterSpacing:"0.04em" },
  studyList: { flex:1, overflowY:"auto", padding:"4px 8px 20px" },
  studyItem: { padding:"11px 10px", cursor:"pointer", borderRadius:6, marginBottom:2, borderLeft:`2px solid transparent`, transition:"background 0.15s" },
  studyItemActive: { background:C.surface, borderLeft:`2px solid ${C.gold}` },
  studyBook: { fontSize:11, color:C.gold, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 },
  studyTitle: { fontSize:13, color:C.muted, lineHeight:1.4, marginBottom:3, fontFamily:"'Playfair Display', Georgia, serif" },
  studyDate: { fontSize:11, color:C.faint },
  sidebarFooter: { padding:"12px 14px", borderTop:`1px solid ${C.border}`, flexShrink:0 },
  userInfo: { fontSize:13, color:C.dim, marginBottom:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  logoutBtn: { width:"100%", padding:"8px 0", background:"transparent", border:`1px solid ${C.faint}`, color:C.dim, borderRadius:5, cursor:"pointer", fontSize:13, fontFamily:"'Crimson Text', Georgia, serif", letterSpacing:"0.03em" },
  emptyMsg: { padding:"24px 10px", fontSize:14, color:C.faint, lineHeight:1.7, textAlign:"center" },
  main: { flex:1, overflowY:"auto", display:"flex", flexDirection:"column" },
  center: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:14 },
  homeGlyph: { fontSize:36, color:C.gold, marginBottom:4 },
  homeTitle: { fontFamily:"'Playfair Display', Georgia, serif", fontSize:52, fontWeight:700, color:C.cream, letterSpacing:"0.04em" },
  homeSub: { fontSize:18, color:C.dim, letterSpacing:"0.04em" },
  homeBtn: { marginTop:20, padding:"13px 36px", background:C.gold, border:"none", color:C.bg, borderRadius:6, cursor:"pointer", fontSize:15, fontFamily:"'Crimson Text', Georgia, serif", fontWeight:600, letterSpacing:"0.05em" },
  formWrap: { maxWidth:540, margin:"0 auto", padding:"56px 40px", width:"100%" },
  formTitle: { fontFamily:"'Playfair Display', Georgia, serif", fontSize:30, fontWeight:700, color:C.cream, marginBottom:8 },
  formSub: { fontSize:16, color:C.dim, marginBottom:36, lineHeight:1.6 },
  form: { display:"flex", flexDirection:"column", gap:22 },
  formGrp: { display:"flex", flexDirection:"column", gap:7, position:"relative" },
  label: { fontSize:11, color:C.dim, textTransform:"uppercase", letterSpacing:"0.1em" },
  input: { background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"11px 14px", color:C.cream, fontSize:16, fontFamily:"'Crimson Text', Georgia, serif", width:"100%", transition:"border-color 0.2s" },
  suggestions: { position:"absolute", top:"100%", left:0, right:0, background:"#161625", border:`1px solid ${C.border}`, borderRadius:"0 0 6px 6px", zIndex:20, overflow:"hidden", maxHeight:180, overflowY:"auto" },
  suggItem: { padding:"9px 14px", cursor:"pointer", fontSize:15, color:C.muted },
  errBox: { color:C.error, fontSize:14, padding:"10px 14px", background:C.errorBg, borderRadius:6, borderLeft:`3px solid ${C.error}` },
  genBtn: { padding:"13px", background:C.gold, border:"none", color:C.bg, borderRadius:6, cursor:"pointer", fontSize:16, fontFamily:"'Crimson Text', Georgia, serif", fontWeight:600, letterSpacing:"0.04em" },
  spinner: { width:28, height:28, border:`2px solid ${C.faint}`, borderTop:`2px solid ${C.gold}`, borderRadius:"50%", animation:"spin 0.9s linear infinite" },
  loadText: { color:C.dim, fontSize:16, fontStyle:"italic" },
  viewWrap: { maxWidth:700, margin:"0 auto", padding:"48px 36px 80px", width:"100%" },
  viewHead: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, gap:16 },
  viewBookLabel: { fontSize:11, color:C.gold, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:8 },
  viewTitle: { fontFamily:"'Playfair Display', Georgia, serif", fontSize:26, fontWeight:700, color:C.cream, lineHeight:1.35, marginBottom:6, maxWidth:540 },
  viewDate: { fontSize:12, color:C.faint },
  delBtn: { background:"none", border:`1px solid ${C.border}`, color:C.faint, cursor:"pointer", width:30, height:30, borderRadius:4, fontSize:12, flexShrink:0 },
  tabBar: { display:"flex", borderBottom:`1px solid ${C.border}`, marginBottom:32 },
  tabBtn: { padding:"9px 22px", background:"none", border:"none", borderBottom:"2px solid transparent", color:C.dim, cursor:"pointer", fontSize:15, fontFamily:"'Crimson Text', Georgia, serif", letterSpacing:"0.04em", marginBottom:-1 },
  tabActive: { color:C.gold, borderBottom:`2px solid ${C.gold}` },
  content: { display:"flex", flexDirection:"column", gap:28 },
  sec: { display:"flex", flexDirection:"column", gap:10 },
  secTitle: { fontSize:11, color:C.dim, textTransform:"uppercase", letterSpacing:"0.12em" },
  secText: { fontSize:17, color:C.muted, lineHeight:1.85 },
  tags: { display:"flex", flexWrap:"wrap", gap:8 },
  tag: { padding:"4px 14px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:100, fontSize:13, color:C.dim },
  verseBox: { background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"24px 28px" },
  verseRef: { fontSize:11, color:C.gold, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 },
  verseText: { fontFamily:"'Playfair Display', Georgia, serif", fontSize:20, fontStyle:"italic", color:C.cream, lineHeight:1.75 },
  prayerBox: { background:C.surface, borderRadius:8, padding:"20px 24px", borderLeft:`3px solid ${C.gold}` },
  // Auth screen styles
  authRoot: { display:"flex", height:"100vh", background:C.bg, alignItems:"center", justifyContent:"center", fontFamily:"'Crimson Text', Georgia, serif" },
  authCard: { width:"100%", maxWidth:420, padding:"48px 44px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:12 },
  authGlyph: { fontSize:28, color:C.gold, marginBottom:16, display:"block", textAlign:"center" },
  authTitle: { fontFamily:"'Playfair Display', Georgia, serif", fontSize:28, fontWeight:700, color:C.cream, textAlign:"center", marginBottom:6 },
  authSub: { fontSize:15, color:C.dim, textAlign:"center", marginBottom:32, lineHeight:1.6 },
  authBtn: { width:"100%", padding:"13px", background:C.gold, border:"none", color:C.bg, borderRadius:6, cursor:"pointer", fontSize:16, fontFamily:"'Crimson Text', Georgia, serif", fontWeight:600, letterSpacing:"0.04em", marginTop:4 },
  authSwitch: { textAlign:"center", marginTop:20, fontSize:15, color:C.dim },
  authLink: { color:C.gold, background:"none", border:"none", cursor:"pointer", fontSize:15, fontFamily:"'Crimson Text', Georgia, serif", textDecoration:"underline" },
};

function Section({ title, content, gold }) {
  return (
    <div style={S.sec}>
      <h3 style={{ ...S.secTitle, color: gold ? C.gold : C.dim }}>{title}</h3>
      <p style={S.secText}>{content}</p>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const body = mode === "register" ? { name, email, password } : { email, password };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onAuth(data.user);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div style={S.authRoot}>
      <div style={S.authCard}>
        <span style={S.authGlyph}>✦</span>
        <h1 style={S.authTitle}>Lógos</h1>
        <p style={S.authSub}>
          {mode === "login" ? "Entre para acessar seus estudos" : "Crie sua conta para começar"}
        </p>
        <div style={S.form}>
          {mode === "register" && (
            <div style={S.formGrp}>
              <label style={S.label}>Nome</label>
              <input
                style={S.input}
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
              />
            </div>
          )}
          <div style={S.formGrp}>
            <label style={S.label}>Email</label>
            <input
              style={S.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKey}
              autoFocus={mode === "login"}
            />
          </div>
          <div style={S.formGrp}>
            <label style={S.label}>Senha</label>
            <input
              style={S.input}
              type="password"
              placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Sua senha"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
          {error && <div style={S.errBox}>{error}</div>}
          <button
            style={{ ...S.authBtn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>
        <div style={S.authSwitch}>
          {mode === "login" ? (
            <>Não tem conta?{" "}
              <button style={S.authLink} onClick={() => { setMode("register"); setError(null); }}>
                Cadastre-se
              </button>
            </>
          ) : (
            <>Já tem conta?{" "}
              <button style={S.authLink} onClick={() => { setMode("login"); setError(null); }}>
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LogosApp() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [studies, setStudies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("home");
  const [tab, setTab] = useState("academic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [book, setBook] = useState("");
  const [chapters, setChapters] = useState("");
  const [notes, setNotes] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: #2a2a40; border-radius: 2px; }
      input, textarea { outline: none; }
    `;
    document.head.appendChild(style);

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user) {
          setUser(user);
          loadStudies();
        }
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  const loadStudies = async () => {
    try {
      const res = await fetch("/api/studies");
      if (res.ok) {
        const { studies } = await res.json();
        setStudies(studies);
      }
    } catch {}
  };

  const handleAuth = (loggedUser) => {
    setUser(loggedUser);
    loadStudies();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStudies([]);
    setSelected(null);
    setMode("home");
  };

  const handleBook = (val) => {
    setBook(val);
    setSuggestions(
      val.length > 1
        ? BOOKS.filter((b) => b.toLowerCase().startsWith(val.toLowerCase())).slice(0, 5)
        : []
    );
  };

  const generate = async () => {
    if (!book || !chapters) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, chapters, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "API error");
      }

      const study = await res.json();
      setStudies((prev) => [study, ...prev]);
      setSelected(study);
      setMode("view");
      setTab("academic");
      setBook("");
      setChapters("");
      setNotes("");
    } catch (e) {
      setError(e.message || "Erro ao gerar o estudo. Verifique sua chave de API e tente novamente.");
    }
    setLoading(false);
  };

  const remove = async (id) => {
    try {
      await fetch(`/api/studies/${id}`, { method: "DELETE" });
    } catch {}
    setStudies((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) { setSelected(null); setMode("home"); }
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  if (!authChecked) return null;
  if (!user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div style={S.root}>
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 272 : 52 }}>
        <div style={S.sidebarHead}>
          {sidebarOpen && <span style={S.logoText}>Lógos</span>}
          <button style={S.toggleBtn} onClick={() => setSidebarOpen((o) => !o)}>
            {sidebarOpen ? "‹" : "›"}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <button style={S.newBtn} onClick={() => { setMode("create"); setSelected(null); }}>
              + Novo Estudo
            </button>
            <div style={S.studyList}>
              {studies.length === 0 ? (
                <div style={S.emptyMsg}>Nenhum estudo ainda.<br />Comece pela leitura de hoje.</div>
              ) : (
                studies.map((s) => (
                  <div
                    key={s.id}
                    style={{ ...S.studyItem, ...(selected?.id === s.id ? S.studyItemActive : {}) }}
                    onClick={() => { setSelected(s); setMode("view"); setTab("academic"); }}
                  >
                    <div style={S.studyBook}>{s.book} {s.chapters}</div>
                    <div style={S.studyTitle}>{s.title}</div>
                    <div style={S.studyDate}>{fmtDate(s.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
            <div style={S.sidebarFooter}>
              <div style={S.userInfo} title={user.email}>{user.name}</div>
              <button style={S.logoutBtn} onClick={handleLogout}>Sair</button>
            </div>
          </>
        )}
      </aside>

      <main style={S.main}>
        {mode === "home" && (
          <div style={S.center}>
            <div style={S.homeGlyph}>✦</div>
            <h1 style={S.homeTitle}>Lógos</h1>
            <p style={S.homeSub}>Seu diário de estudos bíblicos</p>
            <button style={S.homeBtn} onClick={() => setMode("create")}>
              Iniciar novo estudo
            </button>
          </div>
        )}

        {mode === "create" && !loading && (
          <div style={S.formWrap}>
            <h2 style={S.formTitle}>Novo Estudo</h2>
            <p style={S.formSub}>Informe o livro e os capítulos que você leu hoje</p>
            <div style={S.form}>
              <div style={S.formGrp}>
                <label style={S.label}>Livro</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={S.input}
                    placeholder="ex: Gênesis"
                    value={book}
                    onChange={(e) => handleBook(e.target.value)}
                    autoComplete="off"
                  />
                  {suggestions.length > 0 && (
                    <div style={S.suggestions}>
                      {suggestions.map((b) => (
                        <div
                          key={b}
                          style={S.suggItem}
                          onClick={() => { setBook(b); setSuggestions([]); }}
                        >
                          {b}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={S.formGrp}>
                <label style={S.label}>Capítulos</label>
                <input
                  style={S.input}
                  placeholder="ex: 1-4 ou 5, 6"
                  value={chapters}
                  onChange={(e) => setChapters(e.target.value)}
                />
              </div>

              <div style={S.formGrp}>
                <label style={S.label}>
                  Observações{" "}
                  <span style={{ color: C.faint, fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                  style={{ ...S.input, height: 88, resize: "none", fontFamily: "inherit" }}
                  placeholder="Alguma dúvida, insight ou ponto que chamou atenção..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && <div style={S.errBox}>{error}</div>}

              <button
                style={{ ...S.genBtn, opacity: !book || !chapters ? 0.45 : 1, cursor: !book || !chapters ? "not-allowed" : "pointer" }}
                onClick={generate}
                disabled={!book || !chapters}
              >
                Gerar Estudo
              </button>
            </div>
          </div>
        )}

        {mode === "create" && loading && (
          <div style={S.center}>
            <div style={S.spinner} />
            <p style={S.loadText}>Gerando estudo de {book} {chapters}...</p>
          </div>
        )}

        {mode === "view" && selected && (
          <div style={S.viewWrap}>
            <div style={S.viewHead}>
              <div>
                <div style={S.viewBookLabel}>{selected.book} · Cap. {selected.chapters}</div>
                <h1 style={S.viewTitle}>{selected.title}</h1>
                <div style={S.viewDate}>{fmtDate(selected.createdAt)}</div>
              </div>
              <button style={S.delBtn} onClick={() => remove(selected.id)} title="Excluir">✕</button>
            </div>

            <div style={S.tabBar}>
              {["academic", "devotional"].map((t) => (
                <button
                  key={t}
                  style={{ ...S.tabBtn, ...(tab === t ? S.tabActive : {}) }}
                  onClick={() => setTab(t)}
                >
                  {t === "academic" ? "Acadêmico" : "Devocional"}
                </button>
              ))}
            </div>

            {tab === "academic" && (
              <div style={S.content}>
                <Section title="Contexto Histórico" content={selected.data.academic.contexto_historico} />
                <Section title="Autoria e Datação" content={selected.data.academic.autoria_e_data} />
                <Section title="Estrutura Literária" content={selected.data.academic.estrutura_literaria} />
                <div style={S.sec}>
                  <h3 style={S.secTitle}>Temas Centrais</h3>
                  <div style={S.tags}>
                    {selected.data.academic.temas_centrais?.map((t, i) => (
                      <span key={i} style={S.tag}>{t}</span>
                    ))}
                  </div>
                </div>
                <Section title="Curiosidades Culturais e Arqueológicas" content={selected.data.academic.curiosidades_culturais} />
                {selected.data.academic.extras?.filter((e) => e.titulo && e.conteudo).map((e, i) => (
                  <Section key={i} title={`✦ ${e.titulo}`} content={e.conteudo} gold />
                ))}
              </div>
            )}

            {tab === "devotional" && (
              <div style={S.content}>
                <div style={S.verseBox}>
                  <div style={S.verseRef}>{selected.data.devotional.verso_chave?.referencia}</div>
                  <div style={S.verseText}>"{selected.data.devotional.verso_chave?.texto}"</div>
                </div>
                <Section title="Meditação" content={selected.data.devotional.meditacao} />
                <Section title="Aplicação" content={selected.data.devotional.aplicacao} />
                <div style={S.prayerBox}>
                  <h3 style={{ ...S.secTitle, marginBottom: 12, color: C.goldDim }}>Oração</h3>
                  <p style={{ ...S.secText, fontStyle: "italic", color: C.cream }}>
                    {selected.data.devotional.oracao}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
