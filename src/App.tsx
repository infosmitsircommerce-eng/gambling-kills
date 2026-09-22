import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  HeartHandshake,
  LockKeyhole,
  RotateCcw,
  Shield,
} from 'lucide-react'

type Screen = 'home' | 'urge' | 'chase' | 'quit' | 'recovery' | 'relapse' | 'protect' | 'mirror'

type Profile = {
  quitDate: string
  protectedMoney: number
  urgesSurvived: number
  calmMessage: string
  trustedPerson: string
  essentials: { name: string; amount: number }[]
  lastBetPromises: string[]
}

const STORAGE_KEY = 'gk-recovery-v1'

const defaultProfile: Profile = {
  quitDate: new Date().toISOString(),
  protectedMoney: 0,
  urgesSurvived: 0,
  calmMessage: '',
  trustedPerson: '',
  essentials: [],
  lastBetPromises: [],
}

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile
  } catch {
    return defaultProfile
  }
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [profile, setProfile] = useState<Profile>(() => loadProfile())
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const days = useMemo(() => {
    const start = new Date(profile.quitDate).getTime()
    return Math.max(0, Math.floor((Date.now() - start) / 86400000))
  }, [profile.quitDate, screen])

  const navigate = (next: Screen) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setScreen(next)
  }

  return (
    <div className="app-shell">
      {toast && <div className="toast">{toast}</div>}
      {screen !== 'home' && <TopBar onBack={() => navigate('home')} />}
      {screen === 'home' && <Home navigate={navigate} profile={profile} days={days} />}
      {screen === 'urge' && <UrgeMode profile={profile} setProfile={setProfile} navigate={navigate} setToast={setToast} />}
      {screen === 'chase' && <ChaseMode profile={profile} setProfile={setProfile} navigate={navigate} />}
      {screen === 'quit' && <QuitSetup profile={profile} setProfile={setProfile} navigate={navigate} />}
      {screen === 'recovery' && <Recovery profile={profile} setProfile={setProfile} days={days} navigate={navigate} />}
      {screen === 'relapse' && <Relapse navigate={navigate} />}
      {screen === 'protect' && <Protect profile={profile} />}
      {screen === 'mirror' && <Mirror profile={profile} setProfile={setProfile} navigate={navigate} />}
      <Footer />
    </div>
  )
}

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onBack} aria-label="Back home"><ArrowLeft size={20} /></button>
      <div className="brand-mini"><span className="brand-mark">GK</span><span>Gambling Kills</span></div>
      <span className="privacy-pill"><Shield size={13}/> Local-first</span>
    </header>
  )
}

function Home({ navigate, profile, days }: { navigate: (s: Screen)=>void; profile: Profile; days: number }) {
  return (
    <main>
      <section className="hero section-wrap">
        <nav className="nav">
          <div className="brand"><span className="brand-mark">GK</span><span>Gambling Kills</span></div>
          <span className="privacy-pill"><Shield size={13}/> Private by default</span>
        </nav>
        <div className="hero-grid">
          <div>
            <span className="eyebrow">A firewall between an urge and a bet</span>
            <h1>Protect the <span>next decision.</span></h1>
            <p className="hero-copy">No lectures. No shame. When gambling feels urgent, this gives you friction, perspective and a way out of the chase.</p>
            <div className="hero-actions">
              <button className="btn btn-danger btn-xl" onClick={() => navigate('urge')}>I'M ABOUT TO GAMBLE <ChevronRight size={18}/></button>
              <button className="btn btn-ghost" onClick={() => navigate('relapse')}>I already gambled</button>
            </div>
            <p className="microcopy">Your recovery data stays in this browser in this prototype.</p>
          </div>
          <div className="status-card">
            <div className="status-glow" />
            <div className="status-title">YOUR RECOVERY</div>
            <div className="big-number">{days}</div>
            <div className="big-label">days protected</div>
            <div className="status-grid">
              <div><strong>{formatMoney(profile.protectedMoney)}</strong><span>money protected</span></div>
              <div><strong>{profile.urgesSurvived}</strong><span>urges survived</span></div>
            </div>
            <button className="btn btn-soft full" onClick={() => navigate('recovery')}>Open recovery dashboard</button>
          </div>
        </div>
      </section>

      <section className="section-wrap decision-section">
        <span className="eyebrow">Tell the site what is happening — right now</span>
        <h2>Why are you here?</h2>
        <div className="decision-grid">
          <DecisionCard icon={<Clock3/>} title="I'm about to gamble" copy="Delay the action. Put friction between you and the next bet." action="START URGE MODE" onClick={() => navigate('urge')} danger />
          <DecisionCard icon={<RotateCcw/>} title="I lost money and want to chase" copy="Separate the last loss from the next decision before the chase grows." action="BREAK THE CHASE" onClick={() => navigate('chase')} />
          <DecisionCard icon={<LockKeyhole/>} title="I want to quit" copy="Set up your clear-headed message, protections and personal reasons." action="BUILD MY BARRIERS" onClick={() => navigate('quit')} />
          <DecisionCard icon={<HeartHandshake/>} title="I'm already recovering" copy="See your progress without casino-style rewards or streak pressure." action="MY RECOVERY" onClick={() => navigate('recovery')} />
        </div>
      </section>

      <section className="section-wrap manifesto">
        <div className="manifesto-line">You don't need to win it back.</div>
        <div className="manifesto-line muted">You need to stop giving the loss another chance to grow.</div>
      </section>
    </main>
  )
}

function DecisionCard({icon,title,copy,action,onClick,danger=false}:{icon:React.ReactNode;title:string;copy:string;action:string;onClick:()=>void;danger?:boolean}) {
  return <button className={`decision-card ${danger?'danger':''}`} onClick={onClick}>
    <span className="decision-icon">{icon}</span>
    <h3>{title}</h3><p>{copy}</p><span className="card-action">{action}<ChevronRight size={16}/></span>
  </button>
}

function UrgeMode({ profile, setProfile, navigate, setToast }: { profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>; navigate:(s:Screen)=>void; setToast:(s:string)=>void }) {
  const [seconds, setSeconds] = useState(10 * 60)
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [available, setAvailable] = useState('')

  useEffect(() => {
    if (!started || seconds <= 0) return
    const t = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [started, seconds])

  const mm = String(Math.floor(seconds / 60)).padStart(2,'0')
  const ss = String(seconds % 60).padStart(2,'0')

  const survive = () => {
    setProfile(p => ({ ...p, urgesSurvived: p.urgesSurvived + 1, protectedMoney: p.protectedMoney + (Number(available)||0) }))
    navigate('recovery')
  }

  return <main className="focus-wrap">
    <span className="eyebrow danger-text">URGE MODE</span>
    <h1 className="focus-title">Don't decide forever.<br/><span>Protect the next 10 minutes.</span></h1>
    <p className="focus-copy">The goal is not to prove anything. The goal is to make gambling harder to act on until the urge has time to change.</p>

    <div className="timer-card">
      <div className="timer">{mm}:{ss}</div>
      {!started ? <button className="btn btn-danger full" onClick={() => setStarted(true)}>START THE 10-MINUTE LOCK</button> : <div className="running"><span className="pulse-dot"/> Timer running — do the steps below.</div>}
    </div>

    <div className="steps">
      <StepCard n="01" title="Create friction" open={step===0} done={step>0} onOpen={()=>setStep(0)}>
        <p>Close the betting app or tab. Move away from the place where you normally gamble. If you use blocking or self-exclusion tools, activate them now.</p>
        <button className="btn btn-soft" onClick={()=>setStep(1)}>Done — next step</button>
      </StepCard>
      <StepCard n="02" title="Name the money" open={step===1} done={step>1} onOpen={()=>setStep(1)}>
        <p>How much money feels “available” to gamble right now?</p>
        <div className="money-input"><span>₹</span><input inputMode="numeric" value={available} onChange={e=>setAvailable(e.target.value.replace(/[^0-9]/g,''))} placeholder="0" /></div>
        <p className="callout">That number is not a target. It is money you can still protect.</p>
        <button className="btn btn-soft" onClick={()=>setStep(2)}>Protect it — next</button>
      </StepCard>
      <StepCard n="03" title="Hear from clear-headed you" open={step===2} done={step>2} onOpen={()=>setStep(2)}>
        {profile.calmMessage ? <blockquote>“{profile.calmMessage}”<small>— written by you when you were calmer</small></blockquote> : <p>You haven't written a clear-headed message yet. After this urge passes, write one for the next time.</p>}
        <button className="btn btn-soft" onClick={()=>setStep(3)}>Keep going</button>
      </StepCard>
      <StepCard n="04" title="Don't fight it privately" open={step===3} done={false} onOpen={()=>setStep(3)}>
        <p>{profile.trustedPerson ? `Message ${profile.trustedPerson}. They do not need to fix this — they only need to know.` : 'Message someone you trust. They do not need to fix this — they only need to know.'}</p>
        <button className="btn btn-outline full" onClick={async()=>{try{await navigator.clipboard?.writeText("I'm having a strong urge to gamble right now. You don't need to fix anything — can you stay with me for a few minutes?"); setToast('Message copied')}catch{setToast('Copy unavailable — select the message manually')}}}><Copy size={16}/> Copy check-in message</button>
      </StepCard>
    </div>

    <button className="btn btn-success btn-xl full finish-btn" onClick={survive}><Check size={19}/> I DIDN'T GAMBLE — PROTECT THIS MOMENT</button>
    <button className="text-btn" onClick={()=>navigate('relapse')}>I already gambled instead</button>
  </main>
}

function StepCard({n,title,open,done,onOpen,children}:{n:string;title:string;open:boolean;done:boolean;onOpen:()=>void;children:React.ReactNode}) {
  return <div className={`step ${open?'open':''} ${done?'done':''}`}>
    <button className="step-head" onClick={onOpen}><span>{done?<Check size={16}/>:n}</span><strong>{title}</strong><ChevronRight size={18}/></button>
    {open && <div className="step-body">{children}</div>}
  </div>
}

function ChaseMode({ profile, setProfile, navigate }: { profile: Profile; setProfile:React.Dispatch<React.SetStateAction<Profile>>; navigate:(s:Screen)=>void }) {
  const [loss, setLoss] = useState('')
  const [reason, setReason] = useState('')
  const reasons = ['Today’s loss','Debt','I need money urgently','Anger','Boredom','I want the feeling']
  return <main className="focus-wrap">
    <span className="eyebrow danger-text">BREAK THE CHASE</span>
    <h1 className="focus-title">The last bet is finished.<br/><span>The next bet is a new risk.</span></h1>
    <p className="focus-copy">Trying to make a previous loss disappear can turn one loss into a chain of new decisions.</p>
    <div className="panel">
      <label>How much are you trying to win back?</label>
      <div className="money-input"><span>₹</span><input inputMode="numeric" value={loss} onChange={e=>setLoss(e.target.value.replace(/[^0-9]/g,''))} placeholder="0" /></div>
      <label>What are you trying to fix with the next bet?</label>
      <div className="chip-grid">{reasons.map(r=><button key={r} className={`chip ${reason===r?'active':''}`} onClick={()=>setReason(r)}>{r}</button>)}</div>
      {reason && <div className="truth-box"><strong>The next bet cannot rewrite the previous one.</strong><span>{loss ? `${formatMoney(Number(loss))} is already part of the past decision. ` : ''}You can still decide what happens to the money that remains.</span></div>}
      <button className="btn btn-danger btn-xl full" onClick={()=>navigate('urge')}>END THE CHASE — START URGE MODE</button>
    </div>
    <button className="btn btn-ghost full" onClick={()=>{setProfile(p=>({...p,lastBetPromises:[...p.lastBetPromises,new Date().toISOString()]})); navigate('mirror')}}>I keep telling myself “one last bet”</button>
  </main>
}

function QuitSetup({ profile, setProfile, navigate }: { profile: Profile; setProfile:React.Dispatch<React.SetStateAction<Profile>>; navigate:(s:Screen)=>void }) {
  const [message, setMessage] = useState(profile.calmMessage)
  const [person, setPerson] = useState(profile.trustedPerson)
  return <main className="focus-wrap">
    <span className="eyebrow">CLEAR-HEADED SETUP</span>
    <h1 className="focus-title">Build barriers <span>before</span> the next urge.</h1>
    <div className="panel form-stack">
      <label>Your message to future you</label>
      <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="When the urge hits again, what do you want yourself to remember?" maxLength={280}/>
      <small>{message.length}/280</small>
      <label>Trusted person</label>
      <input value={person} onChange={e=>setPerson(e.target.value)} placeholder="Name or relationship" />
      <button className="btn btn-success btn-xl full" onClick={()=>{setProfile(p=>({...p, calmMessage:message.trim(), trustedPerson:person.trim(), quitDate:p.quitDate || new Date().toISOString()})); navigate('protect')}}>SAVE & BUILD MY PROTECTION PLAN</button>
    </div>
  </main>
}

function Protect({ profile }: { profile:Profile }) {
  const [checks,setChecks]=useState<Record<string,boolean>>({ blocker:false,self:false,payment:false,marketing:false,human:!!profile.trustedPerson })
  const items=[
    ['blocker','Website / app blocking'],['self','Self-exclusion'],['payment','Payment restriction'],['marketing','Betting marketing removed'],['human','Trusted person ready']
  ]
  const count=Object.values(checks).filter(Boolean).length
  return <main className="focus-wrap">
    <span className="eyebrow">PROTECTION CENTRE</span>
    <h1 className="focus-title">Willpower has bad days.<br/><span>Barriers don't need motivation.</span></h1>
    <div className="protection-score"><div className="ring"><strong>{count}/5</strong><span>layers active</span></div><p>Use multiple layers. One barrier can fail; several barriers create time to reconsider.</p></div>
    <div className="check-list">{items.map(([id,label])=><label className="check-row" key={id}><input type="checkbox" checked={!!checks[id]} onChange={e=>setChecks({...checks,[id]:e.target.checked})}/><span className="fake-check"><Check size={15}/></span><span>{label}</span></label>)}</div>
    <div className="info-box">This prototype tracks your plan only. It does not yet block apps, bank payments or betting websites itself. Those integrations come later.</div>
  </main>
}

function Recovery({ profile, setProfile, days, navigate }: { profile:Profile; setProfile:React.Dispatch<React.SetStateAction<Profile>>; days:number; navigate:(s:Screen)=>void }) {
  const [amount,setAmount]=useState('')
  return <main className="focus-wrap wide">
    <span className="eyebrow">RECOVERY DASHBOARD</span>
    <h1 className="focus-title">Track what you're <span>protecting</span>, not what you lost.</h1>
    <div className="metric-grid">
      <Metric n={String(days)} label="days protected" />
      <Metric n={formatMoney(profile.protectedMoney)} label="money protected" />
      <Metric n={String(profile.urgesSurvived)} label="urges survived" />
    </div>
    <div className="panel two-col">
      <div><h3>Add protected money</h3><p>Money that could have gone to gambling but stayed in your life instead.</p></div>
      <div className="inline-add"><div className="money-input compact"><span>₹</span><input inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,''))} placeholder="0" /></div><button className="btn btn-soft" onClick={()=>{setProfile(p=>({...p,protectedMoney:p.protectedMoney+(Number(amount)||0)}));setAmount('')}}>Add</button></div>
    </div>
    <div className="panel split-actions">
      <button className="btn btn-danger" onClick={()=>navigate('urge')}>I'm having an urge</button>
      <button className="btn btn-outline" onClick={()=>navigate('relapse')}>I relapsed</button>
      <button className="btn btn-outline" onClick={()=>navigate('mirror')}>Open The Mirror</button>
    </div>
  </main>
}

function Metric({n,label}:{n:string;label:string}) { return <div className="metric"><strong>{n}</strong><span>{label}</span></div> }

function Relapse({ navigate }:{navigate:(s:Screen)=>void}) {
  return <main className="focus-wrap">
    <span className="eyebrow">AFTER A RELAPSE</span>
    <h1 className="focus-title">The gambling happened.<br/><span>The chasing doesn't have to.</span></h1>
    <p className="focus-copy">You do not have to “fix” the loss with another bet. Focus on stopping the sequence now.</p>
    <div className="panel recovery-sequence">
      <div><span>1</span><p><strong>Stop the chase.</strong> Don't create another decision to repair the previous one.</p></div>
      <div><span>2</span><p><strong>Protect what remains.</strong> Move important money toward essentials and existing commitments.</p></div>
      <div><span>3</span><p><strong>Tell one person.</strong> Make the next hour less private.</p></div>
      <div><span>4</span><p><strong>Write down the trigger.</strong> Use it to strengthen your barriers later.</p></div>
    </div>
    <button className="btn btn-danger btn-xl full" onClick={()=>navigate('urge')}>PROTECT WHAT'S LEFT</button>
  </main>
}

function Mirror({ profile, setProfile, navigate }: {profile:Profile;setProfile:React.Dispatch<React.SetStateAction<Profile>>;navigate:(s:Screen)=>void}) {
  const count=profile.lastBetPromises.length
  return <main className="focus-wrap">
    <span className="eyebrow">THE MIRROR</span>
    <h1 className="focus-title">Make the gambling script <span>visible.</span></h1>
    <div className="mirror-card">
      <div className="quote-mark">“</div>
      <h2>I'll make one last bet and then stop.</h2>
      {count > 1 ? <p>You have recorded this thought <strong>{count} times.</strong> If the sentence keeps returning, it is not functioning as an ending.</p> : <p>You just recorded this thought. If it appears again, this page will remember that you've been here before.</p>}
      <button className="btn btn-danger full" onClick={()=>navigate('urge')}>BREAK THE LOOP NOW</button>
    </div>
    <button className="text-btn" onClick={()=>setProfile(p=>({...p,lastBetPromises:[]}))}>Reset this mirror history</button>
  </main>
}

function Footer() {
  return <footer><div><strong>Gambling Kills</strong><span>Working title · Recovery prototype</span></div><p>This tool supports recovery and is not medical care. If you feel unsafe or unable to stay in control, contact a trusted person, qualified professional, or local emergency service.</p></footer>
}
