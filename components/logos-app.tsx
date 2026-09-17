"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, BookCheck, BookMarked, BookOpen, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, ExternalLink, Feather, House, Library, ListChecks, LoaderCircle, Minus, NotebookPen, Plus, Settings, Sparkles, Trash2, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BOOKS } from "@/lib/bible";
import { BIBLE_CHAPTERS, EMPTY_PROGRESS, PROGRESS_STORAGE_KEY, TOTAL_BIBLE_CHAPTERS, progressSummary, registerStudy, type BibleProgress } from "@/lib/bible-progress";
import type { BibleStudyContent, BiblicalConnection, DailyStudy, DeepStudy, GenerationMode, Study, DailyLesson } from "@/lib/logos-types";
import { GOVERNO_PROPRIO } from "@/lib/study-programs/governo-proprio";

type Mode = "home" | "create" | "view" | "progress" | "caderno" | "bible" | "profile" | "studies" | "program";
const PROGRAM_PROGRESS_KEY = "ide_scriptum_program_progress_v1";

type BibleVersion = { id: number; abbreviation: string; title: string; preferred: boolean; copyright: string; info: string; publisherUrl: string | null; youVersionUrl: string | null };
type BiblePassage = { id: string; reference: string; content: string };

type ReaderPreferences = { preferredName: string; avatar: string | null; defaultMode: GenerationMode };
const PREFERENCES_STORAGE_KEY = "ide_scriptum_preferences_v1";
const BIBLE_READER_STORAGE_KEY = "ide_scriptum_bible_reader_v1";

function formatDate(value: string) {
  return new Date(value.endsWith("Z") ? value : `${value}Z`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function StudyHistory({ studies, selected, mode, collapsed = false, onOpen, onNew, onBible, onProgress, onStudies }: { studies: Study[]; selected: Study | null; mode: Mode; collapsed?: boolean; onOpen: (study: Study) => void; onNew: () => void; onBible: () => void; onProgress: () => void; onStudies: () => void }) {
  return (
    <div className="history-shell">
      <Button variant="outline" className="new-study-button" onClick={onNew} title={collapsed ? "Novo estudo" : undefined} aria-label={collapsed ? "Novo estudo" : undefined}><Plus /><span>Novo estudo</span></Button>
      <Button variant="ghost" className={`progress-nav ${mode === "bible" ? "active" : ""}`} onClick={onBible} title={collapsed ? "Bíblia" : undefined} aria-label={collapsed ? "Bíblia" : undefined}><BookMarked /><span>Bíblia</span></Button>
      <Button variant="ghost" className={`progress-nav ${mode === "progress" ? "active" : ""}`} onClick={onProgress} title={collapsed ? "Progresso" : undefined} aria-label={collapsed ? "Progresso" : undefined}><BarChart3 /><span>Progresso</span></Button>
      <Button variant="ghost" className={`progress-nav ${mode === "studies" || mode === "program" ? "active" : ""}`} onClick={onStudies} title={collapsed ? "Estudos" : undefined} aria-label={collapsed ? "Estudos" : undefined}><ListChecks /><span>Estudos</span></Button>
      <div className="history-heading" title={collapsed ? "Seu caderno" : undefined}><Library /> <span>Seu caderno</span><b>{studies.length}</b></div>
      <div className="history-list">
        {studies.length === 0 ? (
          <div className="history-empty"><BookOpen /><p>Seu primeiro estudo aparecerá aqui.</p></div>
        ) : studies.map((study) => (
          <button className={`history-item ${selected?.id === study.id ? "active" : ""}`} key={study.id} onClick={() => onOpen(study)} title={collapsed ? `${study.book} ${study.chapters} — ${study.title}` : undefined} aria-label={collapsed ? `Abrir estudo ${study.book} ${study.chapters}: ${study.title}` : undefined}>
            <i aria-hidden="true">{study.book.replace(/^\d\s*/, "").slice(0, 2).toUpperCase()}</i>
            <span>{study.book} · {study.chapters} · {study.generationMode === "daily" ? "Diário" : "Aprofundado"}</span>
            <strong>{study.title}</strong>
            <small>{formatDate(study.createdAt)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressScreen({ progress }: { progress: BibleProgress }) {
  const summary = useMemo(() => progressSummary(progress), [progress]);
  const startedBooks = BOOKS.filter((book) => (progress.completed[book]?.length ?? 0) > 0);
  const roundedPercentage = Math.round(summary.percentage * 10) / 10;

  return (
    <div className="progress-view">
      <header className="progress-header">
        <p className="eyebrow">Jornada de leitura</p>
        <h1>Progresso</h1>
        <p>Cada capítulo registrado nos seus estudos entra automaticamente nesta caminhada.</p>
      </header>

      <section className="bible-progress-card">
        <div className="progress-ring-copy"><span>{roundedPercentage.toLocaleString("pt-BR")}%</span><small>da Bíblia</small></div>
        <div className="progress-main">
          <div><span>Progresso geral</span><strong>{summary.chaptersRead} de {TOTAL_BIBLE_CHAPTERS} capítulos</strong></div>
          <Progress value={summary.percentage} aria-label={`${roundedPercentage}% da Bíblia concluída`} />
          <small>{TOTAL_BIBLE_CHAPTERS - summary.chaptersRead} capítulos pela frente</small>
        </div>
      </section>

      <div className="progress-stats">
        <section><BookOpen /><div><span>Leitura atual</span><strong>{summary.currentBook}</strong><small>Capítulo {summary.currentChapter}</small></div></section>
        <section><BookCheck /><div><span>Livros concluídos</span><strong>{summary.completedBooks.length}</strong><small>de {BOOKS.length} livros</small></div></section>
      </div>

      <section className="books-progress-section">
        <div className="books-progress-heading"><div><p className="eyebrow">Por livro</p><h2>Sua biblioteca bíblica</h2></div><span>{startedBooks.length} iniciados</span></div>
        {startedBooks.length === 0 ? (
          <div className="progress-empty"><BookOpen /><h3>Sua jornada começa no primeiro capítulo.</h3><p>Ao gerar um estudo, os capítulos informados aparecerão automaticamente aqui.</p></div>
        ) : (
          <div className="book-progress-list">
            {BOOKS.map((book) => {
              const completed = progress.completed[book]?.length ?? 0;
              if (!completed) return null;
              const total = BIBLE_CHAPTERS[book];
              const done = completed === total;
              return <div className={`book-progress-row ${done ? "complete" : ""}`} key={book}><div className="book-progress-name">{done ? <BookCheck /> : <BookOpen />}<div><strong>{book}</strong><small>{done ? "Livro concluído" : `${completed} de ${total} capítulos`}</small></div></div><div className="book-progress-meter"><Progress value={(completed / total) * 100} /><span>{Math.round((completed / total) * 100)}%</span></div></div>;
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function NotebookScreen({ studies, selected, onOpen, onNew }: { studies: Study[]; selected: Study | null; onOpen: (study: Study) => void; onNew: () => void }) {
  return <div className="notebook-view"><header className="notebook-header"><div><p className="eyebrow">Biblioteca pessoal</p><h1>Caderno</h1></div><span>{studies.length} {studies.length === 1 ? "estudo" : "estudos"}</span></header>{studies.length === 0 ? <div className="notebook-empty"><BookOpen /><h2>Seu caderno está vazio.</h2><p>O primeiro estudo que você gerar ficará guardado aqui.</p><Button onClick={onNew}><Plus /> Novo estudo</Button></div> : <div className="notebook-grid">{studies.map((study) => <button className={`notebook-card ${selected?.id === study.id ? "active" : ""}`} key={study.id} onClick={() => onOpen(study)}><span>{study.book} · {study.chapters}</span><strong>{study.title}</strong><small>{study.generationMode === "daily" ? "Modo Diário" : "Modo Aprofundado"} · {formatDate(study.createdAt)}</small></button>)}</div>}</div>;
}

function ProgramsScreen({ onOpen }: { onOpen: () => void }) { return <div className="notebook-view"><header className="notebook-header"><div><p className="eyebrow">Formação guiada</p><h1>Estudos</h1></div><span>1 programa</span></header><div className="notebook-grid"><button className="notebook-card" onClick={onOpen}><span>{GOVERNO_PROPRIO.duration}</span><strong>{GOVERNO_PROPRIO.title}</strong><small>{GOVERNO_PROPRIO.subtitle} · Livro atual: {GOVERNO_PROPRIO.currentBook}</small></button></div></div>; }

function ProgramScreen({ progress, onChange, devotional, devotionalLoading, onGenerate }: { progress: Record<string, boolean>; onChange: (next: Record<string, boolean>) => void; devotional: DevotionalStudy | null; devotionalLoading: boolean; onGenerate: () => void }) { const lesson = GOVERNO_PROPRIO.lessons[0]; const checked = progress[lesson.id] ?? false; const done = checked ? 4 : 0; return <div className="study-view program-view"><header className="study-header"><div><p className="eyebrow">Estudos · {GOVERNO_PROPRIO.title}</p><h1>{GOVERNO_PROPRIO.title}</h1><small>{GOVERNO_PROPRIO.subtitle}</small></div></header><section className="program-overview"><p className="eyebrow">Livro atual</p><h2>{GOVERNO_PROPRIO.currentBook}</h2><p>{GOVERNO_PROPRIO.currentAuthor} · Leitura obrigatória</p><Progress value={checked ? 100 : 0} /><small>{done}/4 itens concluídos · Dia 1 de 30</small></section><div className="program-days"><button className="selected">Dia 1<strong>Hoje</strong></button><button disabled>Dia 2<strong>Próximo</strong></button><button disabled>Dia 3<strong>Próximo</strong></button></div><Section label="Tema"><p>{lesson.theme}</p></Section><Section label="Objetivo"><p>{lesson.objective}</p></Section><Section label="Leitura obrigatória"><p>{lesson.requiredBook}</p><strong>{lesson.requiredBookSection}</strong></Section><Section label="Leitura bíblica principal"><p>{lesson.bible}</p><small>Complementares: {lesson.complementary.join(" · ")}</small></Section><Section label="Devocional do dia">{devotional ? <><div className="key-verse"><span>{devotional.verso_chave.referencia}</span><blockquote>“{devotional.verso_chave.texto}”</blockquote></div><p>{devotional.meditacao}</p><div className="prayer"><span>Oração</span><p>{devotional.oracao}</p></div></> : <div className="devotional-empty"><p>O devocional será gerado especificamente a partir do tema, da Bíblia e da leitura de {GOVERNO_PROPRIO.currentBook}.</p><Button onClick={onGenerate} disabled={devotionalLoading}>{devotionalLoading ? <><LoaderCircle className="spin" /> Gerando...</> : <><Sparkles /> Gerar devocional de hoje</>}</Button></div>}</Section><Section label="Perguntas de reflexão"><div className="interpretation-list">{lesson.questions.map((q) => <p key={q}>{q}</p>)}</div></Section><Section label="Checklist do dia"><div className="journey-checklist"><label><input type="checkbox" checked={checked} onChange={(e) => onChange({ ...progress, [lesson.id]: e.target.checked })} /><span>Concluir as leituras e o estudo do dia</span></label><label><input type="checkbox" checked={checked} readOnly /><span>Responder às perguntas e registrar a aplicação</span></label><label><input type="checkbox" checked={checked} readOnly /><span>Fazer a oração</span></label><label><input type="checkbox" checked={checked} readOnly /><span>Concluir o estudo do dia</span></label></div></Section><div className="prayer"><span>Fluxo da jornada</span><p>LER → COMPREENDER → REFLETIR → ORAR → OBEDECER → PRATICAR</p></div></div>; }


function ProfileScreen({ preferences, onChange, progress, studies, avatarInputRef, onAvatar }: { preferences: ReaderPreferences; onChange: (next: ReaderPreferences) => void; progress: BibleProgress; studies: Study[]; avatarInputRef: React.RefObject<HTMLInputElement | null>; onAvatar: (file: File) => void }) {
  const summary = progressSummary(progress);
  const initials = (preferences.preferredName || "Leitor").split(" ").slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return <div className="profile-view"><header><p className="eyebrow">Preferências</p><h1>Meu perfil</h1></header><section className="profile-card profile-identity"><button className="avatar-editor" onClick={() => avatarInputRef.current?.click()} aria-label="Trocar foto de perfil">{preferences.avatar ? <img src={preferences.avatar} alt="Foto de perfil" /> : <span>{initials}</span>}<i><Camera /></i></button><input ref={avatarInputRef} hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) onAvatar(file); event.target.value = ""; }} /><div className="profile-name"><label htmlFor="preferred-name">Nome de exibição</label><Input id="preferred-name" value={preferences.preferredName} onChange={(event) => onChange({ ...preferences, preferredName: event.target.value })} placeholder="Como podemos chamar você?" />{preferences.avatar && <button onClick={() => onChange({ ...preferences, avatar: null })}>Remover foto</button>}</div></section><section className="profile-card"><div className="profile-section-title"><Settings /><div><h2>Preferência de leitura</h2><p>O modo selecionado abrirá automaticamente em novos estudos.</p></div></div><RadioGroup className="profile-mode-options" value={preferences.defaultMode} onValueChange={(value) => onChange({ ...preferences, defaultMode: value as GenerationMode })}><label><RadioGroupItem value="daily" /><span><strong>Diário</strong><small>3–5 minutos</small></span></label><label><RadioGroupItem value="deep" /><span><strong>Aprofundado</strong><small>Investigação completa</small></span></label></RadioGroup></section><section className="profile-card"><div className="profile-section-title"><BookOpen /><div><h2>Sua jornada</h2><p>Um retrato do seu caderno até aqui.</p></div></div><div className="profile-stats"><div><strong>{studies.length}</strong><span>Estudos</span></div><div><strong>{summary.chaptersRead}</strong><span>Capítulos</span></div><div><strong>{summary.completedBooks.length}</strong><span>Livros</span></div></div><div className="profile-progress"><span>Progresso na Bíblia</span><strong>{(Math.round(summary.percentage * 10) / 10).toLocaleString("pt-BR")}%</strong><Progress value={summary.percentage} /></div></section></div>;
}

function BookPicker({ value, onChange }: { value: string; onChange: (book: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="book-picker">
          <span>{value || "Selecione um livro"}</span><ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="book-popover">
        <Command>
          <CommandInput placeholder="Buscar livro..." />
          <CommandList>
            <CommandEmpty>Nenhum livro encontrado.</CommandEmpty>
            <CommandGroup>
              {BOOKS.map((book) => (
                <CommandItem key={book} value={book} onSelect={() => { onChange(book); setOpen(false); }}>
                  <Check className={value === book ? "visible" : "invisible"} />{book}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function BibleReaderScreen({
  versions, versionId, book, chapter, passage, loading, versionsLoading, versionsRequested, error, progress, fontSize,
  onVersion, onBook, onChapter, onPrevious, onNext, onFontSize, onComplete, onGenerate, onRetry,
}: {
  versions: BibleVersion[];
  versionId: string;
  book: string;
  chapter: number;
  passage: BiblePassage | null;
  loading: boolean;
  versionsLoading: boolean;
  versionsRequested: boolean;
  error: string;
  progress: BibleProgress;
  fontSize: number;
  onVersion: (value: string) => void;
  onBook: (value: string) => void;
  onChapter: (value: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFontSize: (value: number) => void;
  onComplete: () => void;
  onGenerate: () => void;
  onRetry: () => void;
}) {
  const totalChapters = BIBLE_CHAPTERS[book];
  const currentVersion = versions.find((version) => String(version.id) === versionId) ?? null;
  const completed = progress.completed[book]?.includes(chapter) ?? false;
  const atBeginning = book === BOOKS[0] && chapter === 1;
  const atEnd = book === BOOKS[BOOKS.length - 1] && chapter === BIBLE_CHAPTERS[book];

  return (
    <div className="bible-reader-view">
      <header className="reader-header">
        <div><p className="eyebrow">Leitura bíblica</p><h1>Bíblia</h1><p>Leia com calma. Quando concluir, registre o capítulo na sua jornada.</p></div>
        <div className="reader-type-controls" aria-label="Tamanho do texto"><button onClick={() => onFontSize(Math.max(17, fontSize - 1))} aria-label="Diminuir texto"><Minus /></button><span>Aa</span><button onClick={() => onFontSize(Math.min(25, fontSize + 1))} aria-label="Aumentar texto"><Plus /></button></div>
      </header>

      <section className="reader-toolbar" aria-label="Escolha da leitura">
        <label><span>Tradução</span><Select value={versionId || undefined} onValueChange={onVersion} disabled={versionsLoading || versions.length === 0}><SelectTrigger className="reader-select reader-version-select"><SelectValue placeholder={versionsLoading ? "Carregando..." : "Escolha a tradução"} /></SelectTrigger><SelectContent className="reader-version-menu">{versions.map((version) => <SelectItem className="reader-version-option" key={version.id} value={String(version.id)}><span className="reader-version-copy"><strong>{version.abbreviation}</strong><small>{version.title}</small></span></SelectItem>)}</SelectContent></Select></label>
        <label><span>Livro</span><BookPicker value={book} onChange={onBook} /></label>
        <label><span>Capítulo</span><Select value={String(chapter)} onValueChange={(value) => onChapter(Number(value))}><SelectTrigger className="reader-select chapter-select"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: totalChapters }, (_, index) => index + 1).map((number) => <SelectItem key={number} value={String(number)}>{number}</SelectItem>)}</SelectContent></Select></label>
      </section>
      {versions.length > 0 && <p className="reader-license-note">As traduções exibidas são as versões liberadas pela YouVersion para esta App Key.</p>}

      {versionsRequested && !versionsLoading && versions.length === 0 ? (
        <section className="reader-empty"><BookMarked /><h2>{error ? "Não foi possível acessar as traduções." : "Nenhuma tradução em português está liberada."}</h2><p>{error || "Entre no painel da YouVersion e aceite uma licença de texto bíblico. Depois, tente carregar novamente."}</p><div><Button variant="outline" onClick={onRetry}>Tentar novamente</Button><Button asChild><a href="https://platform.youversion.com/" target="_blank" rel="noreferrer">Abrir YouVersion <ExternalLink /></a></Button></div></section>
      ) : (
        <section className="reader-paper">
          <header><div><span>{currentVersion?.abbreviation || "Tradução"}</span><h2>{passage?.reference || `${book} ${chapter}`}</h2></div>{completed && <div className="reader-complete-mark"><Check /> Concluído</div>}</header>
          {loading || versionsLoading ? <div className="reader-scripture-loading"><Skeleton /><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div> : error ? <div className="reader-inline-error"><p>{error}</p><Button variant="outline" onClick={onRetry}>Tentar novamente</Button></div> : passage ? <div className="scripture-text" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: passage.content }} /> : null}
          {currentVersion && <footer><p>{currentVersion.copyright}</p>{currentVersion.info && currentVersion.info !== currentVersion.copyright && <p>{currentVersion.info}</p>}<a href={currentVersion.youVersionUrl || currentVersion.publisherUrl || "https://www.bible.com/"} target="_blank" rel="noreferrer">Texto fornecido pela YouVersion <ExternalLink /></a></footer>}
        </section>
      )}

      {versions.length > 0 && <div className="reader-actions"><div className="reader-chapter-nav"><Button variant="ghost" onClick={onPrevious} disabled={atBeginning}><ChevronLeft /> Anterior</Button><Button variant="ghost" onClick={onNext} disabled={atEnd}>Próximo <ChevronRight /></Button></div><div className="reader-primary-actions"><Button variant="outline" onClick={onComplete} disabled={completed || !passage}>{completed ? <><Check /> Capítulo concluído</> : <><BookCheck /> Concluir leitura</>}</Button><Button onClick={onGenerate} disabled={!passage}><Sparkles /> Estudar este capítulo</Button></div></div>}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return <section className="study-section"><h3>{label}</h3><div>{children}</div></section>;
}

function BiblicalConnections({ connections }: { connections: string | BiblicalConnection[] }) {
  if (typeof connections === "string") return <Section label="Conexões Bíblicas"><p>{connections}</p></Section>;
  return (
    <Section label="Conexões Bíblicas">
      <div className="connection-list">
        {connections.map((connection, index) => <div className="connection-item" key={`${connection.referencia}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{connection.referencia}</strong><p>{connection.explicacao}</p></div></div>)}
      </div>
    </Section>
  );
}

function DailyContent({ content }: { content: DailyStudy }) {
  return (
    <div className="daily-content">
      <div className="reading-time"><Clock3 /><span>Leitura estimada</span><strong>3–5 minutos</strong></div>
      <Section label="Contexto"><p>{content.contexto}</p></Section>
      {content.conexoes_biblicas && content.conexoes_biblicas.length > 0 && <BiblicalConnections connections={content.conexoes_biblicas} />}
      <Section label="Aplicação"><p>{content.aplicacao}</p></Section>
      <div className="prayer"><span>Oração</span><p>{content.oracao}</p></div>
    </div>
  );
}

function DeepContent({ content }: { content: DeepStudy }) {
  return (
    <div className="study-body deep-content">
      <Section label="Contexto histórico"><p>{content.contexto_historico}</p></Section>
      <Section label="Estrutura literária"><p>{content.estrutura_literaria}</p></Section>
      {content.palavras_chave && content.palavras_chave.length > 0 && <Section label="Palavras-chave"><div className="keyword-list">{content.palavras_chave.map((item) => <div key={item.termo}><strong>{item.termo}</strong><p>{item.explicacao}</p></div>)}</div></Section>}
      {content.temas_centrais && content.temas_centrais.length > 0 && <Section label="Temas centrais"><div className="themes">{content.temas_centrais.map((theme) => <span key={theme}>{theme}</span>)}</div></Section>}
      {content.autoria_e_data && <Section label="Autoria e datação"><p>{content.autoria_e_data}</p></Section>}
      {content.curiosidades_culturais && <Section label="Cultura e arqueologia"><p>{content.curiosidades_culturais}</p></Section>}
      <BiblicalConnections connections={content.conexoes_biblicas} />
      {content.questoes_interpretativas && content.questoes_interpretativas.length > 0 && <Section label="Questões interpretativas"><div className="interpretation-list">{content.questoes_interpretativas.map((item) => <div key={item.questao}><strong>{item.questao}</strong><p>{item.sintese}</p></div>)}</div></Section>}
      {content.aplicacao_pastoral && <Section label="Aplicação pastoral"><p>{content.aplicacao_pastoral}</p></Section>}
      {content.extras?.map((extra) => <Section key={extra.titulo} label={extra.titulo}><p>{extra.conteudo}</p></Section>)}
    </div>
  );
}

function StructuredStudyContent({ content, mode, readerPrompt }: { content: BibleStudyContent; mode: GenerationMode; readerPrompt: string }) {
  return (
    <div className="study-body structured-study">
      {mode === "daily" && <div className="reading-time"><Clock3 /><span>Leitura estimada</span><strong>3–5 minutos</strong></div>}
      <Section label="Resumo da leitura"><p>{content.resumo_leitura}</p></Section>
      <Section label="Contexto histórico"><p>{content.contexto_historico}</p></Section>
      <Section label="Contexto imediato"><p>{content.contexto_imediato}</p></Section>
      <Section label="Estrutura do texto"><div className="outline-list">{content.estrutura_texto.map((item) => <div key={item.titulo}><strong>{item.titulo}</strong><p>{item.descricao}</p></div>)}</div></Section>
      <Section label="Acontecimentos principais"><div className="exposition-list">{content.acontecimentos_principais.map((item) => <div key={item.titulo}><strong>{item.titulo}</strong><p>{item.explicacao}</p></div>)}</div></Section>
      <Section label="Temas centrais"><div className="theme-list">{content.temas_centrais.map((item) => <div key={item.tema}><strong>{item.tema}</strong><p>{item.explicacao}</p></div>)}</div></Section>
      {content.palavras_importantes.length > 0 && <Section label="Palavras e expressões importantes"><div className="keyword-list">{content.palavras_importantes.map((item) => <div key={item.termo}><strong>{item.termo}</strong><p>{item.explicacao}</p></div>)}</div></Section>}
      {content.conexoes_biblicas.length > 0 && <BiblicalConnections connections={content.conexoes_biblicas} />}
      {content.questoes_interpretativas.length > 0 && <Section label="Questões interpretativas"><div className="interpretation-list">{content.questoes_interpretativas.map((item) => <div key={item.questao}><strong>{item.questao}</strong><p>{item.sintese}</p></div>)}</div></Section>}
      {content.curiosidades.length > 0 && <Section label="História, cultura e arqueologia"><div className="exposition-list">{content.curiosidades.map((item) => <div key={item.titulo}><strong>{item.titulo}</strong><p>{item.conteudo}</p></div>)}</div></Section>}
      {readerPrompt && content.sobre_sua_duvida && <section className="reader-answer"><span>Sobre sua dúvida</span><blockquote>{readerPrompt}</blockquote><p>{content.sobre_sua_duvida}</p></section>}
      <Section label="Aplicação pastoral"><p>{content.aplicacao_pastoral}</p></Section>
    </div>
  );
}

function StudyContent({ study }: { study: Study }) {
  if ("resumo_leitura" in study.content) return <StructuredStudyContent content={study.content} mode={study.generationMode} readerPrompt={study.readerPrompt} />;
  return study.generationMode === "daily"
    ? <DailyContent content={study.content as DailyStudy} />
    : <DeepContent content={study.content as DeepStudy} />;
}

function JourneyContent({ study, onSave }: { study: Study; onSave: (journey: NonNullable<Study["journey"]>) => void }) {
  if (!study.journey) return null;
  const lesson = study.journey.lessons[0];
  const done = lesson.checklist.filter((item) => item.done).length;
  const percent = Math.round((done / lesson.checklist.length) * 100);
  const update = (next: DailyLesson) => onSave({ ...study.journey!, lessons: [next, ...study.journey!.lessons.slice(1)], progress: { ...study.journey!.progress, lastActivity: new Date().toISOString(), lastLessonId: next.id } });
  return <div className="study-body journey-body"><div className="journey-summary"><div><p className="eyebrow">Rotina diária</p><h2>{lesson.title}</h2><p>{lesson.theme}</p></div><Progress value={percent} /><strong>{percent}% · {done}/{lesson.checklist.length} itens</strong></div><Section label="Objetivo"><p>{lesson.objective}</p></Section><Section label="Leitura obrigatória"><p>{lesson.requiredBookReading}</p><strong>{lesson.suggestedBookSection}</strong></Section><Section label="Leitura bíblica principal"><p>{lesson.primaryBibleReading}</p>{lesson.complementaryBibleReadings.length > 0 && <small>Complementares: {lesson.complementaryBibleReadings.join(" · ")}</small>}</Section><Section label="Checklist"><div className="journey-checklist">{lesson.checklist.map((item) => <label key={item.id}><input type="checkbox" checked={item.done} onChange={(event) => { const next = { ...lesson, checklist: lesson.checklist.map((current) => current.id === item.id ? { ...current, done: event.target.checked } : current), status: event.target.checked && done + 1 === lesson.checklist.length ? "completed" : "in_progress" as const }; update(next); }} /><span>{item.label}</span></label>)}</div></Section><Section label="Perguntas de reflexão"><div className="interpretation-list">{lesson.reflectionQuestions.map((question) => <p key={question}>{question}</p>)}</div></Section><Section label="O que Deus me mostrou?"><Textarea value={lesson.answers.showedMe} onChange={(e) => update({ ...lesson, answers: { ...lesson.answers, showedMe: e.target.value } })} /></Section><Section label="Onde isso confronta meu comportamento?"><Textarea value={lesson.answers.confrontsBehavior} onChange={(e) => update({ ...lesson, answers: { ...lesson.answers, confrontsBehavior: e.target.value } })} /></Section><Section label="O que preciso obedecer hoje?"><Textarea value={lesson.answers.obeyToday} onChange={(e) => update({ ...lesson, answers: { ...lesson.answers, obeyToday: e.target.value } })} /></Section><Section label="Qual ação prática vou cumprir?"><Textarea value={lesson.answers.practicalAction} onChange={(e) => update({ ...lesson, answers: { ...lesson.answers, practicalAction: e.target.value } })} /></Section><Section label="Oração pessoal"><Textarea value={lesson.answers.personalPrayer} onChange={(e) => update({ ...lesson, answers: { ...lesson.answers, personalPrayer: e.target.value } })} /></Section><Section label="Observações"><Textarea value={lesson.answers.observations} onChange={(e) => update({ ...lesson, answers: { ...lesson.answers, observations: e.target.value } })} /></Section></div>;
}

export default function LogosApp({ displayName }: { displayName: string }) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selected, setSelected] = useState<Study | null>(null);
  const [mode, setMode] = useState<Mode>("home");
  const [book, setBook] = useState("");
  const [chapters, setChapters] = useState("");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("daily");
  const [readerPrompt, setReaderPrompt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [devotionalLoading, setDevotionalLoading] = useState(false);
  const [error, setError] = useState("");
  const [studyTab, setStudyTab] = useState("study");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [readingProgress, setReadingProgress] = useState<BibleProgress>(EMPTY_PROGRESS);
  const [progressReady, setProgressReady] = useState(false);
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [readerVersionId, setReaderVersionId] = useState("");
  const [readerBook, setReaderBook] = useState<string>(BOOKS[0]);
  const [readerChapter, setReaderChapter] = useState(1);
  const [readerFontSize, setReaderFontSize] = useState(20);
  const [readerReady, setReaderReady] = useState(false);
  const [versionsRequested, setVersionsRequested] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsReloadKey, setVersionsReloadKey] = useState(0);
  const [passageLoading, setPassageLoading] = useState(false);
  const [readerPassage, setReaderPassage] = useState<BiblePassage | null>(null);
  const [readerError, setReaderError] = useState("");
  const [readerReloadKey, setReaderReloadKey] = useState(0);
  const [historySynced, setHistorySynced] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [noteOpen, setNoteOpen] = useState(false);
  const [preferences, setPreferences] = useState<ReaderPreferences>({ preferredName: "", avatar: null, defaultMode: "daily" });
  const [profileReady, setProfileReady] = useState(false);
  const [programProgress, setProgramProgress] = useState<Record<string, boolean>>({});
  const [programDevotional, setProgramDevotional] = useState<DevotionalStudy | null>(null);
  const [programDevotionalLoading, setProgramDevotionalLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const accountName = useMemo(() => displayName.includes("@") ? "Leitor" : displayName, [displayName]);
  const firstName = useMemo(() => (preferences.preferredName.trim() || accountName).split(" ")[0], [accountName, preferences.preferredName]);

  useEffect(() => {
    try { const saved = window.localStorage.getItem(PROGRAM_PROGRESS_KEY); if (saved) setProgramProgress(JSON.parse(saved)); } catch { /* mantém vazio */ }
    try { const saved = window.localStorage.getItem("ide_scriptum_program_devotional_day1"); if (saved) setProgramDevotional(JSON.parse(saved)); } catch { /* mantém vazio */ }
  }, []);
  useEffect(() => { try { window.localStorage.setItem(PROGRAM_PROGRESS_KEY, JSON.stringify(programProgress)); } catch { /* mantém durante a sessão */ } }, [programProgress]);
  useEffect(() => {
    let disposed = false;
    const defaults: ReaderPreferences = { preferredName: "", avatar: null, defaultMode: "daily" };
    let local = defaults;
    try {
      const saved = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved) local = { ...defaults, ...JSON.parse(saved) };
    } catch { /* usa os padrões */ }
    setPreferences(local);
    fetch("/api/profile")
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => {
        if (disposed) return;
        if (data.exists) setPreferences({ ...defaults, ...data.profile });
      })
      .catch(() => undefined)
      .finally(() => { if (!disposed) setProfileReady(true); });
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    if (!profileReady) return;
    try { window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences)); } catch { /* mantém durante a sessão */ }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(preferences),
        signal: controller.signal,
      }).catch(() => undefined);
    }, 600);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [preferences, profileReady]);

  useEffect(() => {
    try { setSidebarCollapsed(window.localStorage.getItem("logos_sidebar_collapsed_v1") === "true"); } catch { /* mantém a sidebar aberta */ }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) setReadingProgress(JSON.parse(saved) as BibleProgress);
    } catch { /* mantém o progresso vazio quando o armazenamento estiver indisponível */ }
    setProgressReady(true);
  }, []);

  useEffect(() => {
    if (!progressReady) return;
    try { window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(readingProgress)); } catch { /* progresso continua disponível durante a sessão */ }
  }, [readingProgress, progressReady]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(BIBLE_READER_STORAGE_KEY);
      if (saved) {
        const value = JSON.parse(saved) as { versionId?: string; book?: string; chapter?: number; fontSize?: number };
        if (value.versionId) setReaderVersionId(String(value.versionId));
        if (value.book && BOOKS.includes(value.book as (typeof BOOKS)[number])) {
          setReaderBook(value.book);
          setReaderChapter(Math.max(1, Math.min(Number(value.chapter) || 1, BIBLE_CHAPTERS[value.book])));
        }
        if (Number.isFinite(value.fontSize)) setReaderFontSize(Math.max(17, Math.min(25, Number(value.fontSize))));
      } else {
        const savedProgress = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
        const summary = progressSummary(savedProgress ? JSON.parse(savedProgress) as BibleProgress : EMPTY_PROGRESS);
        setReaderBook(summary.currentBook);
        setReaderChapter(summary.currentChapter);
      }
    } catch { /* o leitor começa em Gênesis 1 */ }
    setReaderReady(true);
  }, []);

  useEffect(() => {
    if (!readerReady) return;
    try { window.localStorage.setItem(BIBLE_READER_STORAGE_KEY, JSON.stringify({ versionId: readerVersionId, book: readerBook, chapter: readerChapter, fontSize: readerFontSize })); } catch { /* preferências continuam na sessão */ }
  }, [readerBook, readerChapter, readerFontSize, readerReady, readerVersionId]);

  useEffect(() => {
    if (mode !== "bible") return;
    const controller = new AbortController();
    let disposed = false;
    setVersionsRequested(true);
    setVersionsLoading(true);
    setReaderError("");
    fetch("/api/bible/versions", { signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then((data) => {
        if (disposed) return;
        const versions = (data.versions ?? []) as BibleVersion[];
        setBibleVersions(versions);
        setReaderVersionId((current) => {
          const savedVersion = versions.find((version) => String(version.id) === current);
          if (savedVersion?.preferred) return current;
          const preferredVersion = versions.find((version) => version.preferred);
          return preferredVersion ? String(preferredVersion.id) : versions[0] ? String(versions[0].id) : "";
        });
      })
      .catch((reason) => {
        if (!disposed && !(reason instanceof DOMException && reason.name === "AbortError")) {
          setReaderError(reason instanceof Error ? reason.message : "Não foi possível carregar as traduções.");
        }
      })
      .finally(() => { if (!disposed) setVersionsLoading(false); });
    return () => { disposed = true; controller.abort(); };
  }, [mode, versionsReloadKey]);

  useEffect(() => {
    if (mode !== "bible" || !readerReady || !readerVersionId) return;
    const controller = new AbortController();
    let disposed = false;
    setPassageLoading(true);
    setReaderError("");
    setReaderPassage(null);
    const query = new URLSearchParams({ version: readerVersionId, book: readerBook, chapter: String(readerChapter) });
    fetch(`/api/bible/passage?${query.toString()}`, { signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then((data) => { if (!disposed) setReaderPassage(data.passage as BiblePassage); })
      .catch((reason) => { if (!disposed && !(reason instanceof DOMException && reason.name === "AbortError")) setReaderError(reason instanceof Error ? reason.message : "Não foi possível carregar o capítulo."); })
      .finally(() => { if (!disposed) setPassageLoading(false); });
    return () => { disposed = true; controller.abort(); };
  }, [mode, readerBook, readerChapter, readerReady, readerReloadKey, readerVersionId]);

  useEffect(() => {
    fetch("/api/studies")
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => setStudies(data.studies ?? []))
      .catch(() => setError("Não foi possível carregar seu caderno agora."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!progressReady || loading || historySynced) return;
    setReadingProgress((current) => studies.slice().reverse().reduce((merged, study) => registerStudy(merged, study.book, study.chapters), current));
    setHistorySynced(true);
  }, [historySynced, loading, progressReady, studies]);

  useEffect(() => {
    setNoteDraft(selected?.notes ?? "");
    setNoteDirty(false);
    setNoteStatus("idle");
    setStudyTab("study");
    setNoteOpen(false);
  }, [selected?.id]);

  useEffect(() => {
    if (!selected || !noteDirty) return;
    const studyId = selected.id;
    const value = noteDraft;
    const controller = new AbortController();
    let disposed = false;
    setNoteStatus("saving");
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/studies/${studyId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ notes: value }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        if (disposed) return;
        setStudies((current) => current.map((study) => study.id === studyId ? { ...study, notes: value } : study));
        setSelected((current) => current?.id === studyId ? { ...current, notes: value } : current);
        setNoteDirty(false);
        setNoteStatus("saved");
      } catch (reason) {
        if (!disposed && !(reason instanceof DOMException && reason.name === "AbortError")) setNoteStatus("error");
      }
    }, 700);
    return () => { disposed = true; window.clearTimeout(timeout); controller.abort(); };
  }, [noteDirty, noteDraft, selected?.id]);

  function openStudy(study: Study) { setSelected(study); setMode("view"); setMobileOpen(false); setError(""); }
  function saveJourney(journey: NonNullable<Study["journey"]>) { if (!selected) return; setSelected({ ...selected, journey }); setStudies((current) => current.map((study) => study.id === selected.id ? { ...study, journey } : study)); void fetch(`/api/studies/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ journey }) }); }
  function newStudy() { setSelected(null); setMode("create"); setGenerationMode(preferences.defaultMode); setMobileOpen(false); setError(""); }
  function showBible() {
    setSelected(null);
    setMode("bible");
    setMobileOpen(false);
    setError("");
  }
  function showProgress() { setSelected(null); setMode("progress"); setMobileOpen(false); setError(""); }
  function showNotebook() { setMode("caderno"); setMobileOpen(false); setError(""); }
  function showProfile() { setMode("profile"); setMobileOpen(false); setError(""); }
  function showPrograms() { setSelected(null); setMode("studies"); setMobileOpen(false); setError(""); }
  function openProgram() { setSelected(null); setMode("program"); setMobileOpen(false); setError(""); }
  async function generateProgramDevotionalNow() { setProgramDevotionalLoading(true); setError(""); try { const response = await fetch("/api/programs/devotional", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonId: "day-1" }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setProgramDevotional(data.devotional); localStorage.setItem("ide_scriptum_program_devotional_day1", JSON.stringify(data.devotional)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível gerar o devocional de hoje."); } finally { setProgramDevotionalLoading(false); } }

  function changeReaderBook(nextBook: string) {
    setReaderBook(nextBook);
    setReaderChapter((current) => Math.min(current, BIBLE_CHAPTERS[nextBook]));
  }

  function navigateReader(direction: -1 | 1) {
    const currentIndex = BOOKS.indexOf(readerBook as (typeof BOOKS)[number]);
    if (direction < 0) {
      if (readerChapter > 1) setReaderChapter(readerChapter - 1);
      else if (currentIndex > 0) { const previousBook = BOOKS[currentIndex - 1]; setReaderBook(previousBook); setReaderChapter(BIBLE_CHAPTERS[previousBook]); }
    } else if (readerChapter < BIBLE_CHAPTERS[readerBook]) setReaderChapter(readerChapter + 1);
    else if (currentIndex < BOOKS.length - 1) { setReaderBook(BOOKS[currentIndex + 1]); setReaderChapter(1); }
    document.querySelector(".main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completeReaderChapter() {
    setReadingProgress((current) => registerStudy(current, readerBook, String(readerChapter)));
  }

  function studyReaderChapter() {
    setSelected(null);
    setBook(readerBook);
    setChapters(String(readerChapter));
    setReaderPrompt("");
    setNotes("");
    setGenerationMode(preferences.defaultMode);
    setMode("create");
  }

  function retryReader() {
    setReaderError("");
    if (bibleVersions.length === 0) setVersionsReloadKey((current) => current + 1);
    else setReaderReloadKey((current) => current + 1);
  }

  function handleAvatar(file: File) {
    const reader = new FileReader();
    reader.onload = () => { const image = new Image(); image.onload = () => { const canvas = document.createElement("canvas"); canvas.width = 200; canvas.height = 200; const context = canvas.getContext("2d"); if (!context) return; const side = Math.min(image.width, image.height); context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 200, 200); setPreferences((current) => ({ ...current, avatar: canvas.toDataURL("image/jpeg", .82) })); }; image.src = String(reader.result); };
    reader.readAsDataURL(file);
  }

  async function createStudy() {
    if (!book || !chapters.trim()) return;
    setGenerating(true); setError("");
    try {
      const response = await fetch("/api/studies", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ book, chapters, readerPrompt, notes, generationMode }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStudies((current) => [data.study, ...current]);
      setReadingProgress((current) => registerStudy(current, data.study.book, data.study.chapters));
      setSelected(data.study); setMode("view"); setBook(""); setChapters(""); setReaderPrompt(""); setNotes(""); setGenerationMode(preferences.defaultMode);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível gerar o estudo."); }
    finally { setGenerating(false); }
  }

  async function createDevotional() {
    if (!selected || selected.devotional) return;
    setDevotionalLoading(true); setError("");
    try {
      const response = await fetch(`/api/studies/${selected.id}/devotional`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSelected(data.study); setStudies((current) => current.map((study) => study.id === data.study.id ? data.study : study));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível gerar o devocional."); }
    finally { setDevotionalLoading(false); }
  }

  function flushNote() {
    if (!selected || !noteDirty) return;
    void fetch(`/api/studies/${selected.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ notes: noteDraft }),
    }).catch(() => undefined);
  }

  async function removeStudy() {
    if (!selected) return;
    const response = await fetch(`/api/studies/${selected.id}`, { method: "DELETE" });
    if (!response.ok) { setError("Não foi possível excluir este estudo."); return; }
    setStudies((current) => current.filter((study) => study.id !== selected.id)); setSelected(null); setMode("home");
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      try { window.localStorage.setItem("logos_sidebar_collapsed_v1", String(next)); } catch { /* preferência vale durante a sessão */ }
      return next;
    });
  }

  const history = <StudyHistory studies={studies} selected={selected} mode={mode} onOpen={openStudy} onNew={newStudy} onBible={showBible} onProgress={showProgress} onStudies={showPrograms} />;
  const desktopHistory = <StudyHistory studies={studies} selected={selected} mode={mode} collapsed={sidebarCollapsed} onOpen={openStudy} onNew={newStudy} onBible={showBible} onProgress={showProgress} onStudies={showPrograms} />;

  return (
    <div className={`logos-app ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="desktop-sidebar">
        <div className="sidebar-brand-row"><button className="brand" onClick={() => setMode("home")} aria-label="IDE Scriptum — ir para o início"><img className="brand-logo" src="/scriptum-logo-v2.png" alt="IDE Scriptum" /><img className="brand-mark" src="/scriptum-mark-v2.png" alt="" aria-hidden="true" /></button><button className="sidebar-toggle" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expandir caderno" : "Recolher caderno"} aria-expanded={!sidebarCollapsed} title={sidebarCollapsed ? "Expandir caderno" : "Recolher caderno"}>{sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}</button></div>
        {loading ? <div className="history-loading"><Skeleton /><Skeleton /><Skeleton /></div> : desktopHistory}
        <button className={`profile ${mode === "profile" ? "active" : ""}`} onClick={showProfile}>{preferences.avatar ? <img src={preferences.avatar} alt="" /> : <span>{firstName.slice(0, 1).toUpperCase()}</span>}<div><strong>{firstName}</strong><small>Caderno pessoal</small></div><Settings /></button>
      </aside>

      <header className="mobile-header">
        <button className={`mobile-studies-button ${mode === "bible" ? "active" : ""}`} onClick={showBible} aria-label="Abrir Bíblia" aria-current={mode === "bible" ? "page" : undefined}><BookMarked /></button>
        <button className="brand" onClick={() => setMode("home")} aria-label="IDE Scriptum — ir para o início"><img className="brand-logo" src="/scriptum-logo-v2.png" alt="IDE Scriptum" /></button>
        <button className={`mobile-profile-button ${mode === "profile" ? "active" : ""}`} onClick={showProfile} aria-label="Abrir meu perfil" aria-current={mode === "profile" ? "page" : undefined}>
          {preferences.avatar ? <img src={preferences.avatar} alt="" /> : <User />}
        </button>
      </header>

      <main className="main-content">
        {error && <div className="error-banner">{error}<button onClick={() => setError("")} aria-label="Fechar"><X /></button></div>}

        {mode === "home" && <div className="home-view"><img className="home-logo" src="/scriptum-logo-v2.png" alt="IDE Scriptum" /><p className="eyebrow">Seu caderno de leitura</p><h1>A Palavra, lida<br/><em>com profundidade.</em></h1><p>Contexto para compreender. Devoção para viver.</p><Button size="lg" onClick={newStudy}><Plus /> Iniciar novo estudo</Button>{studies.length > 0 && <button className="continue-link" onClick={() => openStudy(studies[0])}>Continuar de onde parei <span>→</span></button>}</div>}

        {mode === "progress" && <ProgressScreen progress={readingProgress} />}
        {mode === "bible" && <BibleReaderScreen versions={bibleVersions} versionId={readerVersionId} book={readerBook} chapter={readerChapter} passage={readerPassage} loading={passageLoading} versionsLoading={versionsLoading} versionsRequested={versionsRequested} error={readerError} progress={readingProgress} fontSize={readerFontSize} onVersion={setReaderVersionId} onBook={changeReaderBook} onChapter={setReaderChapter} onPrevious={() => navigateReader(-1)} onNext={() => navigateReader(1)} onFontSize={setReaderFontSize} onComplete={completeReaderChapter} onGenerate={studyReaderChapter} onRetry={retryReader} />}
        {mode === "caderno" && <NotebookScreen studies={studies} selected={selected} onOpen={openStudy} onNew={newStudy} />}
        {mode === "studies" && <ProgramsScreen onOpen={openProgram} />}
        {mode === "program" && <ProgramScreen progress={programProgress} onChange={setProgramProgress} devotional={programDevotional} devotionalLoading={programDevotionalLoading} onGenerate={generateProgramDevotionalNow} />}
        {mode === "profile" && <ProfileScreen preferences={{ ...preferences, preferredName: preferences.preferredName || accountName }} onChange={setPreferences} progress={readingProgress} studies={studies} avatarInputRef={avatarInputRef} onAvatar={handleAvatar} />}

        {mode === "create" && <div className="form-view">
          <p className="eyebrow">Nova leitura</p>
          <h1>Como vamos estudar hoje?</h1>
          <p className="form-intro">Escolha o ritmo, informe a passagem e guarde o que já está ecoando em você.</p>
          <fieldset className="mode-fieldset">
            <legend>Modo de estudo</legend>
            <RadioGroup className="mode-options" value={generationMode} onValueChange={(value) => setGenerationMode(value as GenerationMode)}>
              <label className={`mode-option ${generationMode === "daily" ? "selected" : ""}`}>
                <RadioGroupItem value="daily" />
                <div><span><Clock3 /> Modo Diário</span><strong>3–5 minutos</strong><p>Contexto essencial, aplicação para hoje e uma oração baseada no texto.</p></div>
              </label>
              <label className={`mode-option ${generationMode === "deep" ? "selected" : ""}`}>
                <RadioGroupItem value="deep" />
                <div><span><BookOpen /> Modo Aprofundado</span><strong>Investigação completa</strong><p>História, estrutura, palavras-chave, conexões, questões e aplicação pastoral.</p></div>
              </label>
            </RadioGroup>
          </fieldset>
          <div className="form-grid"><label><span>Livro</span><BookPicker value={book} onChange={setBook} /></label><label><span>Capítulos</span><Input value={chapters} onChange={(event) => setChapters(event.target.value)} placeholder="Ex.: 1–4 ou 5, 6" /></label></div>
          <label className="notes-field generation-prompt"><span>Observação ou dúvida para o estudo <small>opcional</small></span><Textarea value={readerPrompt} onChange={(event) => setReaderPrompt(event.target.value)} placeholder="Ex.: Não entendi por que Deus endureceu o coração de Faraó." maxLength={4000} /><small className="notes-privacy">Este texto será enviado à IA somente para orientar este estudo. A resposta aparecerá em “Sobre sua dúvida”.</small></label>
          <label className="notes-field"><span>Minhas anotações <small>opcional</small></span><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Uma dúvida, um insight ou algo que chamou sua atenção..." maxLength={10000} /><small className="notes-privacy">Este texto será salvo no seu caderno e não será enviado à IA.</small></label>
          <div className="form-actions"><Button variant="ghost" onClick={() => setMode("home")}>Cancelar</Button><Button onClick={createStudy} disabled={!book || !chapters.trim() || generating}>{generating ? <><LoaderCircle className="spin" /> Preparando estudo...</> : <><Sparkles /> Gerar {generationMode === "daily" ? "estudo diário" : "estudo aprofundado"}</>}</Button></div>
        </div>}

        {mode === "view" && selected && <article className="study-view"><header className="study-header"><div><div className="study-meta"><p className="eyebrow">{selected.book} · capítulos {selected.chapters}</p><span>{selected.generationMode === "daily" ? "Modo Diário" : "Modo Aprofundado"}</span></div><h1>{selected.title}</h1><small>{formatDate(selected.createdAt)}</small></div><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Excluir estudo"><Trash2 /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir este estudo?</AlertDialogTitle><AlertDialogDescription>O conteúdo gerado e suas anotações serão apagados definitivamente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={removeStudy}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></header>
          <Tabs value={studyTab} onValueChange={(value) => { setStudyTab(value); if (value === "devotional" && !selected.devotional) void createDevotional(); }} className="study-tabs"><TabsList variant="line"><TabsTrigger value="journey">Jornada</TabsTrigger><TabsTrigger value="study">Estudo</TabsTrigger><TabsTrigger value="devotional">Devocional</TabsTrigger></TabsList><TabsContent value="journey"><JourneyContent study={selected} onSave={saveJourney} /></TabsContent><TabsContent value="study"><StudyContent study={selected} /></TabsContent>
            <TabsContent value="devotional" className="study-body devotional-body">{!selected.devotional ? <div className="devotional-empty"><div><Feather /></div><h2>{devotionalLoading ? "Preparando seu devocional..." : "Não foi possível preparar o devocional."}</h2><p>{devotionalLoading ? "Ele será criado uma única vez e guardado junto ao estudo." : "Você pode tentar novamente sem gerar o estudo outra vez."}</p>{devotionalLoading ? <LoaderCircle className="spin devotional-spinner" /> : <Button onClick={createDevotional}><Sparkles /> Tentar novamente</Button>}</div> : <><div className="key-verse"><span>{selected.devotional.verso_chave.referencia}</span><blockquote>“{selected.devotional.verso_chave.texto}”</blockquote></div><Section label="Meditação"><p>{selected.devotional.meditacao}</p></Section>{selected.devotional.revela_sobre_deus && <Section label="O que este texto revela sobre Deus"><p>{selected.devotional.revela_sobre_deus}</p></Section>}{selected.devotional.confronta_em_nos && <Section label="O que este texto confronta ou transforma em nós"><p>{selected.devotional.confronta_em_nos}</p></Section>}<Section label="Aplicação prática"><p>{selected.devotional.aplicacao_pratica ?? selected.devotional.aplicacao}</p></Section>{selected.devotional.pergunta_reflexao && <section className="reflection-question"><span>Pergunta para reflexão</span><p>{selected.devotional.pergunta_reflexao}</p></section>}<div className="prayer"><span>Oração</span><p>{selected.devotional.oracao}</p></div></>}</TabsContent></Tabs></article>}
      </main>
      {mode === "view" && selected && <><button className={`notes-fab ${noteDraft ? "has-note" : ""}`} onClick={() => setNoteOpen(true)} aria-label="Abrir minhas anotações"><NotebookPen />{noteDraft && <i />}</button>{noteOpen && <div className="notes-overlay" onClick={() => setNoteOpen(false)} />}<aside className={`notes-drawer ${noteOpen ? "open" : ""}`} aria-hidden={!noteOpen}><header><div><NotebookPen /><span>Minhas anotações</span></div><span className={`note-status ${noteStatus}`}>{noteStatus === "saving" && <LoaderCircle className="spin" />}{noteStatus === "saved" && "✓ Salvo"}{noteStatus === "error" && "Falha ao salvar"}</span><button onClick={() => setNoteOpen(false)} aria-label="Fechar anotações"><X /></button></header><Textarea autoFocus={noteOpen} value={noteDraft} onChange={(event) => { setNoteDraft(event.target.value); setNoteDirty(true); }} onBlur={flushNote} placeholder="Reflexões, perguntas, conexões pessoais..." maxLength={10000} /><small>{noteDraft.length.toLocaleString("pt-BR")} caracteres</small></aside></>}
      <nav className="mobile-quick-nav" aria-label="Atalhos principais">
        <button className={mode === "home" ? "active" : ""} onClick={() => { setMode("home"); setSelected(null); }} aria-current={mode === "home" ? "page" : undefined}><House /><span>Início</span></button>
        <button className={mode === "studies" || mode === "program" ? "active" : ""} onClick={showPrograms} aria-current={mode === "studies" || mode === "program" ? "page" : undefined}><ListChecks /><span>Estudos</span></button>
        <button className={`quick-new ${mode === "create" ? "active" : ""}`} onClick={newStudy} aria-current={mode === "create" ? "page" : undefined}><i className="quick-new-icon"><Plus /></i><span>Novo</span></button>
        <button className={mode === "caderno" || mode === "view" ? "active" : ""} onClick={showNotebook} aria-current={mode === "caderno" ? "page" : undefined}><Library /><span>Caderno</span></button>
        <button className={mode === "progress" ? "active" : ""} onClick={showProgress} aria-current={mode === "progress" ? "page" : undefined}><BarChart3 /><span>Progresso</span></button>
      </nav>
    </div>
  );
}
