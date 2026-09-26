import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  EyeOff,
  HeartHandshake,
  Lock,
  MessageCircle,
  Pause,
  RefreshCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react'

type Screen = 'home' | 'emergency' | 'setup' | 'recovery' | 'relapse'

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

function money(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)
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
    const t = window.setTimeout(() => setToast(''), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  const days = useMemo(() => {
    const start = new Date(profile.quitDate).getTime()
    return Math.max(0, Math.floor((Date.now() - start) / 86400000))
  }, [profile.quitDate, screen])

  const go = (next: Screen) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setScreen(next)
  }

  return (
    <div className={`app ${screen === 'emergency' ? 'is-emergency' : ''}`}>
      {toast && <div className="toast">{toast}</div>}
      {screen === 'home' && <Home profile={profile} days={days} go={go} />}
      {screen === 'emergency' && (
        <EmergencyMode
          profile={profile}
          setProfile={setProfile}
          go={go}
          setToast={setToast}
        />
      )}
      {screen === 'setup' && <Setup profile={profile} setProfile={setProfile} go={go} />}
      {screen === 'recovery' && (
        <Recovery profile={profile} setProfile={setProfile} days={days} go={go} />
      )}
      {screen === 'relapse' && <Relapse go={go} />}

      {screen !== 'emergency' && screen !== 'home' && <BackButton go={go} />}
      {screen !== 'emergency' && (
        <button className="floating-sos" onClick={() => go('emergency')}>
          <ShieldAlert size={18} /> STOP ME NOW
        </button>
      )}
    </div>
  )
}

function BackButton({ go }: { go: (s: Screen) => void }) {
  return (
    <button className="back-button" onClick={() => go('home')} aria-label="Back home">
      <ArrowLeft size={18} /> Home
    </button>
  )
}

function Header({ go }: { go: (s: Screen) => void }) {
  return (
    <header className="site-header shell">
      <button className="brand" onClick={() => go('home')}>
        <span className="brand-symbol"><ShieldAlert size={18} /></span>
        <span className="brand-words"><strong>GAMBLING</strong><b>KILLS</b></span>
      </button>
      <nav className="desktop-nav">
        <a href="#system">How it works</a>
        <a href="#layers">Protection layers</a>
        <a href="#privacy">Privacy</a>
      </nav>
      <button className="header-cta" onClick={() => go('emergency')}>
        I need help now <ArrowRight size={15} />
      </button>
    </header>
  )
}

function Home({ profile, days, go }: { profile: Profile; days: number; go: (s: Screen) => void }) {
  return (
    <main>
      <Header go={go} />

      <section className="hero shell">
        <div className="hero-copy-block">
          <div className="signal"><span /> FOR THE MOMENT THE URGE GETS LOUD</div>
          <h1>Don't fight the urge with <em>willpower alone.</em></h1>
          <p>
            This is not a motivational timer. It is an emergency interruption system built to put
            distance between an urge, your money, and the next gambling decision.
          </p>
          <div className="hero-actions">
            <button className="primary-stop" onClick={() => go('emergency')}>
              <ShieldAlert size={23} />
              <span><small>EXTREME URGE?</small>STOP ME NOW</span>
              <ArrowRight size={20} />
            </button>
            <button className="secondary-action" onClick={() => go('relapse')}>
              I already gambled
            </button>
          </div>
          <div className="hero-note"><Shield size={14} /> No account required. Recovery data stays in this browser.</div>
        </div>

        <div className="command-card">
          <div className="command-top">
            <span className="live-dot" />
            EMERGENCY PROTOCOL
            <span>01—04</span>
          </div>
          <div className="command-title">When thinking gets narrow,<br />reduce the number of choices.</div>
          <div className="command-steps">
            <CommandStep icon={<EyeOff />} n="01" title="Cut access" text="Close the path to gambling." />
            <CommandStep icon={<WalletCards />} n="02" title="Protect money" text="Put essential money behind friction." />
            <CommandStep icon={<UsersRound />} n="03" title="Get a human in" text="Make the urge less private." />
            <CommandStep icon={<BrainCircuit />} n="04" title="Break the chase" text="Separate the last loss from the next decision." />
          </div>
          <button className="command-button" onClick={() => go('emergency')}>Run the protocol <ChevronRight size={17} /></button>
        </div>
      </section>

      <section className="truth-band">
        <div className="shell truth-grid">
          <div>
            <span className="kicker">THE CORE IDEA</span>
            <h2>A timer cannot stop a serious urge.<br /><span>Friction can buy you a decision.</span></h2>
          </div>
          <p>
            High-risk moments need layers: reduce access, protect money, involve another person,
            interrupt chasing, then use time. The countdown comes last — not first.
          </p>
        </div>
      </section>

      <section className="shell system-section" id="system">
        <div className="section-heading">
          <span className="kicker">THE SYSTEM</span>
          <h2>Four moves. One goal: make the next bet harder to place.</h2>
        </div>
        <div className="layer-grid" id="layers">
          <LayerCard number="01" icon={<Lock />} title="Remove the path" text="Close gambling tabs and apps, mute triggers, and turn on any blocking or self-exclusion tools you already use." accent="red" />
          <LayerCard number="02" icon={<WalletCards />} title="Remove easy money" text="Freeze or lower payment access, protect money for essentials, or put money behind a trusted barrier." />
          <LayerCard number="03" icon={<MessageCircle />} title="Remove secrecy" text="Send one pre-written message to someone you trust so the urge is no longer happening in isolation." />
          <LayerCard number="04" icon={<Pause />} title="Remove the chase" text="Name what you are trying to recover and force a clean separation between the previous loss and the next decision." />
        </div>
      </section>

      <section className="shell fourth-wall">
        <div className="fourth-wall-card">
          <span className="kicker">THE FOURTH WALL</span>
          <h2>The site should not lecture you.<br />It should let your clear-headed self interrupt you.</h2>
          <p>
            Write a message while calm. During a future urge, Gambling Kills shows your own words
            back to you — before you make another decision.
          </p>
          <div className="wall-preview">
            <span>MESSAGE FROM CLEAR-HEADED YOU</span>
            <blockquote>“{profile.calmMessage || 'Tomorrow-me will care more about what I protected than what I tried to win back.'}”</blockquote>
          </div>
          <button className="text-link" onClick={() => go('setup')}>Set up my message <ArrowRight size={16} /></button>
        </div>
        <div className="recovery-snapshot">
          <span className="kicker">YOUR PRIVATE SNAPSHOT</span>
          <div className="snapshot-number">{days}</div>
          <div className="snapshot-label">days since your recovery start date</div>
          <div className="snapshot-grid">
            <div><strong>{money(profile.protectedMoney)}</strong><span>money protected</span></div>
            <div><strong>{profile.urgesSurvived}</strong><span>urges interrupted</span></div>
          </div>
          <button onClick={() => go('recovery')}>Open recovery dashboard <ChevronRight size={15} /></button>
        </div>
      </section>

      <section className="shell transparency" id="privacy">
        <div>
          <span className="kicker">NO FALSE PROMISES</span>
          <h2>A website cannot physically control another app or bank account.</h2>
        </div>
        <div className="transparency-copy">
          <p>
            This site is designed to create immediate friction and guide you toward stronger barriers.
            Real blocking, payment restrictions, self-exclusion and human support have to happen outside the webpage.
          </p>
          <p>
            V1 keeps your recovery setup in local browser storage. No gambling ads, operator promotions,
            odds tools or casino-style reward mechanics belong here.
          </p>
        </div>
      </section>

      <footer className="footer shell">
        <div className="brand footer-brand">
          <span className="brand-symbol"><ShieldAlert size={18} /></span>
          <span className="brand-words"><strong>GAMBLING</strong><b>KILLS</b></span>
        </div>
        <p>Recovery tool · local-first prototype · built to protect the next decision.</p>
        <button onClick={() => go('emergency')}>STOP ME NOW</button>
      </footer>
    </main>
  )
}

function CommandStep({ icon, n, title, text }: { icon: React.ReactNode; n: string; title: string; text: string }) {
  return (
    <div className="command-step">
      <span className="command-icon">{icon}</span>
      <span className="command-number">{n}</span>
      <div><strong>{title}</strong><small>{text}</small></div>
      <ChevronRight size={16} />
    </div>
  )
}

function LayerCard({ number, icon, title, text, accent = '' }: { number: string; icon: React.ReactNode; title: string; text: string; accent?: string }) {
  return (
    <article className={`layer-card ${accent}`}>
      <div className="layer-top"><span>{number}</span><i>{icon}</i></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function EmergencyMode({
  profile,
  setProfile,
  go,
  setToast,
}: {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
  go: (s: Screen) => void
  setToast: (s: string) => void
}) {
  const [started, setStarted] = useState(false)
  const [stage, setStage] = useState(1)
  const [access, setAccess] = useState<Record<string, boolean>>({ close: false, mute: false, block: false })
  const [moneySteps, setMoneySteps] = useState<Record<string, boolean>>({ limits: false, essentials: false, trusted: false })
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState('')
  const [seconds, setSeconds] = useState(180)

  useEffect(() => {
    if (!started || stage !== 5 || seconds <= 0) return
    const timer = window.setInterval(() => setSeconds(s => s - 1), 1000)
    return () => window.clearInterval(timer)
  }, [started, stage, seconds])

  const startLockdown = async () => {
    setStarted(true)
    try {
      await document.documentElement.requestFullscreen?.()
    } catch {
      // Fullscreen is optional; the intervention continues without it.
    }
  }

  const shareCheckIn = async () => {
    const text = "I'm having a strong urge to gamble right now. Please stay with me for a few minutes while I get through it."
    try {
      if (navigator.share) {
        await navigator.share({ text })
      } else {
        await navigator.clipboard.writeText(text)
        setToast('Check-in message copied')
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text)
        setToast('Check-in message copied')
      } catch {
        setToast('Copy unavailable — say it directly to someone you trust')
      }
    }
  }

  const finish = () => {
    setProfile(p => ({
      ...p,
      urgesSurvived: p.urgesSurvived + 1,
      protectedMoney: p.protectedMoney + (Number(amount) || 0),
    }))
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    go('recovery')
  }

  const progress = ((stage - 1) / 4) * 100

  if (!started) {
    return (
      <main className="lockdown-intro">
        <button className="emergency-exit" onClick={() => go('home')}><X size={18} /> Exit</button>
        <div className="lockdown-center">
          <div className="alert-ring"><ShieldAlert size={38} /></div>
          <span className="lockdown-label">EXTREME URGE MODE</span>
          <h1>Do not negotiate with the urge yet.</h1>
          <p>We are going to reduce access, reduce money availability, bring another person in, and interrupt the chase. The timer comes after that.</p>
          <button className="lockdown-start" onClick={startLockdown}>
            START LOCKDOWN <ArrowRight size={22} />
          </button>
          <small>This cannot control other apps or accounts. It gives you immediate actions that create friction.</small>
        </div>
      </main>
    )
  }

  return (
    <main className="lockdown-screen">
      <header className="lockdown-header">
        <div className="lockdown-brand"><ShieldAlert size={18} /> GAMBLING KILLS</div>
        <div className="lockdown-progress"><span style={{ width: `${progress}%` }} /></div>
        <button onClick={() => go('home')}><X size={18} /></button>
      </header>

      <div className="lockdown-body">
        {stage === 1 && (
          <InterventionStep
            eyebrow="01 / CUT ACCESS"
            title="Make gambling physically harder to reach."
            copy="Do at least one action outside this page before moving on."
          >
            <ActionCheck checked={access.close} onChange={() => setAccess({ ...access, close: !access.close })} title="Close the gambling app or tab" text="Don't leave it waiting in the background." />
            <ActionCheck checked={access.mute} onChange={() => setAccess({ ...access, mute: !access.mute })} title="Mute gambling triggers" text="Turn off gambling notifications, messages or feeds you can control." />
            <ActionCheck checked={access.block} onChange={() => setAccess({ ...access, block: !access.block })} title="Turn on a block or self-exclusion barrier" text="Use any blocking or self-exclusion control you already have available." />
            <button className="lockdown-next" disabled={!Object.values(access).some(Boolean)} onClick={() => setStage(2)}>I DID ONE — NEXT <ArrowRight size={18} /></button>
          </InterventionStep>
        )}

        {stage === 2 && (
          <InterventionStep
            eyebrow="02 / PROTECT MONEY"
            title="Make the next payment harder than the urge."
            copy="Choose a barrier that fits what you can safely do right now."
          >
            <ActionCheck checked={moneySteps.limits} onChange={() => setMoneySteps({ ...moneySteps, limits: !moneySteps.limits })} title="Freeze or lower payment access" text="Use your normal banking controls to reduce easy spending access." />
            <ActionCheck checked={moneySteps.essentials} onChange={() => setMoneySteps({ ...moneySteps, essentials: !moneySteps.essentials })} title="Protect money needed for real life" text="Separate money needed for food, travel, bills or other essentials." />
            <ActionCheck checked={moneySteps.trusted} onChange={() => setMoneySteps({ ...moneySteps, trusted: !moneySteps.trusted })} title="Put a trusted person between you and the money" text="If appropriate, ask someone you trust to help you protect access temporarily." />
            <div className="protect-amount">
              <label>How much money are you protecting from this urge?</label>
              <div><span>₹</span><input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" /></div>
            </div>
            <button className="lockdown-next" disabled={!Object.values(moneySteps).some(Boolean)} onClick={() => setStage(3)}>MONEY HAS FRICTION — NEXT <ArrowRight size={18} /></button>
          </InterventionStep>
        )}

        {stage === 3 && (
          <InterventionStep
            eyebrow="03 / REMOVE SECRECY"
            title="Get another human into the next five minutes."
            copy="An extreme urge is harder to rationalize when someone else knows it is happening."
          >
            <div className="human-card">
              <div className="human-icon"><UsersRound size={28} /></div>
              <div>
                <span>YOUR CHECK-IN</span>
                <h3>{profile.trustedPerson ? `Tell ${profile.trustedPerson}` : 'Tell someone you trust'}</h3>
                <p>“I'm having a strong urge to gamble right now. Please stay with me for a few minutes while I get through it.”</p>
              </div>
            </div>
            <button className="share-button" onClick={shareCheckIn}><MessageCircle size={18} /> SHARE / COPY THIS MESSAGE</button>
            <button className="lockdown-next" onClick={() => setStage(4)}>SOMEONE KNOWS — NEXT <ArrowRight size={18} /></button>
          </InterventionStep>
        )}

        {stage === 4 && (
          <InterventionStep
            eyebrow="04 / BREAK THE CHASE"
            title="What are you asking the next bet to fix?"
            copy="Name it. Then separate the previous outcome from the next decision."
          >
            <div className="reason-grid">
              {['A loss from today', 'Debt or money pressure', 'Anger / frustration', 'Boredom / escape', 'The feeling of betting', '“One last bet”'].map(item => (
                <button
                  key={item}
                  className={reason === item ? 'selected' : ''}
                  onClick={() => {
                    setReason(item)
                    if (item === '“One last bet”') {
                      setProfile(p => ({ ...p, lastBetPromises: [...p.lastBetPromises, new Date().toISOString()] }))
                    }
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            {reason && (
              <div className="mirror-panel">
                <span>THE MIRROR</span>
                <h3>The next bet is not part of the previous one.</h3>
                <p>
                  {reason === '“One last bet”' && profile.lastBetPromises.length > 0
                    ? `You have recorded the “one last bet” thought before. Repeating the sentence does not make it an ending.`
                    : `What happened before this screen is already decided. The next bet creates a new risk; it does not rewrite the old decision.`}
                </p>
                {profile.calmMessage && <blockquote>“{profile.calmMessage}”<small>— clear-headed you</small></blockquote>}
              </div>
            )}
            <button className="lockdown-next" disabled={!reason} onClick={() => setStage(5)}>I'M NOT CHASING IT — CONTINUE <ArrowRight size={18} /></button>
          </InterventionStep>
        )}

        {stage === 5 && (
          <InterventionStep
            eyebrow="PROTECTION ACTIVE"
            title="Now use time. Not before."
            copy="The important work is already done: access, money, secrecy and chasing have all been interrupted."
          >
            <div className="cooldown-card">
              <span className="cooldown-label"><Clock3 size={16} /> SHORT COOLDOWN</span>
              <div className="cooldown-time">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</div>
              <p>Put the phone down for a moment, move away from where you usually gamble, and stay near another person if possible.</p>
            </div>
            <div className="completed-layers">
              <span><CheckCircle2 size={16} /> Access interrupted</span>
              <span><CheckCircle2 size={16} /> Money protected</span>
              <span><CheckCircle2 size={16} /> Human contact</span>
              <span><CheckCircle2 size={16} /> Chase interrupted</span>
            </div>
            <button className="lockdown-finish" onClick={finish}><ShieldCheck size={18} /> I DIDN'T GAMBLE — SAVE THIS MOMENT</button>
          </InterventionStep>
        )}
      </div>
    </main>
  )
}

function InterventionStep({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: React.ReactNode }) {
  return (
    <section className="intervention-step">
      <span className="intervention-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="intervention-copy">{copy}</p>
      <div className="intervention-actions">{children}</div>
    </section>
  )
}

function ActionCheck({ checked, onChange, title, text }: { checked: boolean; onChange: () => void; title: string; text: string }) {
  return (
    <button className={`action-check ${checked ? 'checked' : ''}`} onClick={onChange}>
      <span className="check-box">{checked && <Check size={18} />}</span>
      <span><strong>{title}</strong><small>{text}</small></span>
      <ChevronRight size={17} />
    </button>
  )
}

function Setup({ profile, setProfile, go }: { profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>; go: (s: Screen) => void }) {
  const [message, setMessage] = useState(profile.calmMessage)
  const [person, setPerson] = useState(profile.trustedPerson)

  return (
    <main className="internal-page shell">
      <span className="kicker">SET UP BEFORE THE NEXT URGE</span>
      <h1>Let your calm self prepare the emergency version of you.</h1>
      <div className="setup-grid">
        <div className="setup-card">
          <label>Message from clear-headed you</label>
          <textarea value={message} maxLength={320} onChange={e => setMessage(e.target.value)} placeholder="What do you want yourself to remember when gambling suddenly feels urgent?" />
          <small>{message.length}/320</small>
        </div>
        <div className="setup-card">
          <label>Trusted person</label>
          <input value={person} onChange={e => setPerson(e.target.value)} placeholder="Name or relationship" />
          <p>This stays in your browser. During Emergency Mode, the site reminds you who to contact.</p>
        </div>
      </div>
      <button className="save-setup" onClick={() => {
        setProfile(p => ({ ...p, calmMessage: message.trim(), trustedPerson: person.trim() }))
        go('home')
      }}><Check size={18} /> SAVE MY EMERGENCY SETUP</button>
    </main>
  )
}

function Recovery({ profile, setProfile, days, go }: { profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>; days: number; go: (s: Screen) => void }) {
  const [amount, setAmount] = useState('')
  return (
    <main className="internal-page shell">
      <span className="kicker">RECOVERY DASHBOARD</span>
      <h1>Track what stayed in your life.</h1>
      <div className="recovery-metrics">
        <Metric value={String(days)} label="days since start" />
        <Metric value={money(profile.protectedMoney)} label="money protected" />
        <Metric value={String(profile.urgesSurvived)} label="urges interrupted" />
      </div>
      <div className="recovery-panel">
        <div>
          <h2>Add money you protected</h2>
          <p>Only add money you genuinely chose not to gamble. This is not “money won.”</p>
        </div>
        <div className="amount-row">
          <span>₹</span>
          <input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" />
          <button onClick={() => {
            setProfile(p => ({ ...p, protectedMoney: p.protectedMoney + (Number(amount) || 0) }))
            setAmount('')
          }}>Add</button>
        </div>
      </div>
      <div className="recovery-actions">
        <button className="danger" onClick={() => go('emergency')}><ShieldAlert size={18} /> I HAVE AN URGE</button>
        <button onClick={() => go('setup')}><RefreshCcw size={18} /> Update emergency setup</button>
        <button onClick={() => go('relapse')}><HeartHandshake size={18} /> I relapsed</button>
      </div>
    </main>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="metric-card"><strong>{value}</strong><span>{label}</span></div>
}

function Relapse({ go }: { go: (s: Screen) => void }) {
  return (
    <main className="internal-page shell relapse-page">
      <span className="kicker">AFTER A RELAPSE</span>
      <h1>The gambling happened.<br /><em>The chase does not have to.</em></h1>
      <p className="page-lead">Do not turn one decision into a sequence. The most useful move now is to protect what remains and interrupt access again.</p>
      <div className="relapse-grid">
        <div><span>01</span><h3>Stop the sequence</h3><p>Do not place another bet to repair the previous one.</p></div>
        <div><span>02</span><h3>Protect money</h3><p>Move essential money behind whatever safe barrier you can use.</p></div>
        <div><span>03</span><h3>Tell someone</h3><p>Bring a trusted person into the next few minutes.</p></div>
      </div>
      <button className="save-setup danger" onClick={() => go('emergency')}><ShieldAlert size={18} /> PROTECT WHAT'S LEFT</button>
    </main>
  )
}
