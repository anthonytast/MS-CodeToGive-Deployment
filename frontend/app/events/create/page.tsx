'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Copy, ChevronDown, Check, AlertCircle, X } from 'lucide-react';
import MapGL, { Marker, MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  yellow:       '#fecc0e',
  teal:         '#2E8B7A',
  tealLight:    '#D3EFEA',
  purple:       '#784cc5',
  purpleLight:  '#ede5f7',
  coral:        '#E86F51',
  coralLight:   '#FDDDD6',
  bg:           '#fef6df',
  inputBg:      '#fdf0e8',
  inputBorder:  '#e0bfb0',
  text:         '#2D2A26',
  textSec:      '#6B6560',
  textMuted:    '#9C9690',
  border:       '#e8d8cc',
  tealCard:     '#f2d1be',
  purpleCard:   '#f2d1be',
  coralCard:    '#f2d1be',
  neutralCard:  '#f2d1be',
};

// ─── Data ──────────────────────────────────────────────────────────────────────
const LANGUAGES = ['English','Spanish','Chinese (Simplified)','Chinese (Traditional)','Bengali','Russian','Haitian Creole','Korean','Arabic','Urdu','Polish','Yiddish','French','Tagalog','Italian','Portuguese','Hindi','Japanese','Greek','Albanian','Other'];

// ─── Input helpers ─────────────────────────────────────────────────────────────
const IB: React.CSSProperties = {
  width:'100%', padding:'10px 13px', fontSize:'14px',
  fontFamily:'var(--font-dm-sans)', color: C.text,
  background: '#fdf0e8', borderWidth: '2px', borderStyle: 'solid', borderColor: '#e0bfb0',
  borderRadius:'5px', outline:'none', boxSizing:'border-box' as const,
  transition:'border-color 0.15s, box-shadow 0.15s',
};
const IF: React.CSSProperties = { borderColor: C.purple, boxShadow:'0 0 0 3px rgba(107,70,193,0.15)', background:'#EDE5F7' };

function FInput(p: React.InputHTMLAttributes<HTMLInputElement> & { xStyle?: React.CSSProperties }) {
  const [f,setF] = useState(false);
  const { xStyle, ...rest } = p;
  return <input {...rest} style={{...IB,...(f?IF:{}),...xStyle}} onFocus={()=>setF(true)} onBlur={()=>setF(false)} />;
}
function FTextarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [f,setF] = useState(false);
  return <textarea {...p} style={{...IB,minHeight:'130px',lineHeight:'1.6',resize:'vertical',...(f?IF:{})}} onFocus={()=>setF(true)} onBlur={()=>setF(false)} />;
}

// ─── Dropdown ──────────────────────────────────────────────────────────────────
function Dropdown({ value, onChange, placeholder, options }: {
  value: string; onChange: (v:string)=>void; placeholder: string;
  options: string[];
}) {
  const [open,setOpen] = useState(false);
  const [search,setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e:MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  useEffect(() => { if (open) setTimeout(() => inp.current?.focus(), 40); }, [open]);

  const flat = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const pick = (v:string) => { onChange(v); setOpen(false); setSearch(''); };

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button type="button" onClick={() => setOpen(o=>!o)}
        style={{...IB, ...(open?IF:{}), display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', height:'42px', padding:'0 13px', overflow:'hidden'}}>
        <span style={{
          color: value ? C.text : '#a89bc7',
          fontSize: 14,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
          flex: 1,
        }}>{value || placeholder}</span>
        <div style={{display:'flex',gap:4,flexShrink:0}}>
          {value && <X size={13} style={{color:'#9b7fd4'}} onClick={e=>{e.stopPropagation();onChange('');}} />}
          <ChevronDown size={13} style={{color:'#9b7fd4',transform:open?'rotate(180deg)':'none',transition:'transform 0.2s'}} />
        </div>
      </button>
      {open && (
        <div style={{position:'absolute',zIndex:50,width:'100%',marginTop:3,background:'white',
          border:`2px solid ${C.inputBorder}`,borderRadius:'5px',
          boxShadow:'0 8px 24px rgba(107,70,193,0.15)',overflow:'hidden'}}>
          <div style={{padding:8,borderBottom:`1px solid ${C.border}`}}>
            <input ref={inp} type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search…" style={{...IB,padding:'6px 10px',fontSize:13}} />
          </div>
          <ul style={{maxHeight:350,overflowY:'auto',margin:0,padding:0,listStyle:'none'}}>
            {flat.length===0 && <li style={{padding:'8px 16px',fontSize:13,color:C.textMuted}}>No results</li>}
            {flat.map(opt => (
              <button key={opt} type="button" onClick={() => pick(opt)}
                style={{width:'100%',textAlign:'left',padding:'8px 16px',fontSize:13,display:'block',borderWidth:0,cursor:'pointer',fontFamily:'var(--font-dm-sans)',
                  background:value===opt?'#ede5f7':'white', color:value===opt?'#784cc5':C.text, fontWeight:value===opt?600:400}}
                onMouseEnter={e=>{if(value!==opt)(e.currentTarget as HTMLElement).style.background='#F9F5FF';}}
                onMouseLeave={e=>{if(value!==opt)(e.currentTarget as HTMLElement).style.background='white';}}
              >{opt}</button>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Map ───────────────────────────────────────────────────────────────────────
// LocationMap is defined inside the page component so it can access page state.

// ─── Card ──────────────────────────────────────────────────────────────────────
function Card({ accent, bg, title, children }: { accent:string; bg:string; title:string; children:React.ReactNode }) {
  return (
    <div style={{borderRadius:7,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 1px 5px rgba(0,0,0,0.05)',height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{background:accent,padding:'9px 18px',fontSize:11,fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.8px',color:'white',flexShrink:0, borderTopLeftRadius: 6, borderTopRightRadius: 6}}>{title}</div>
      <div style={{background:bg,padding:'16px 18px',flex:1, borderBottomLeftRadius: 6, borderBottomRightRadius: 6}}>{children}</div>
    </div>
  );
}
function Field({ label, children, mb=14 }: { label:string; children:React.ReactNode; mb?:number }) {
  return (
    <div style={{marginBottom:mb}}>
      <label style={{display:'block',fontSize:13,fontWeight:600,color:C.text,marginBottom:5,fontFamily:'var(--font-dm-sans)'}}>{label}</label>
      {children}
    </div>
  );
}

// ─── Hands banner ────────────────────────────────────────────────────────────────
function HandsBanner() {
  return (
    <div style={{
      width:'100vw', marginLeft:'calc(-50vw + 50%)',
      marginTop:40, background:'#fef6df',
      padding:'20px 0 0',
    }}>
      <div style={{
        position:'relative',
        background:'#ff5838',
        borderRadius:'50% 50% 0 0 / 44px 44px 0 0',
        overflow:'hidden',
        display:'flex',
        alignItems:'flex-end',
        width:'100%',
        minHeight:260,
      }}>
        <div style={{
          width:'100%',
          display:'flex',
          flexDirection:'row',
          alignItems:'flex-end',
          minHeight:360,
          position:'relative',
          zIndex:3,
          boxSizing:'border-box',
        }}>
          <div style={{
            flex:'1 1 0',
            minWidth:0,
            padding:'36px 24px 32px 64px',
            display:'flex',
            flexDirection:'column',
            justifyContent:'center',
            alignSelf:'center',
            boxSizing:'border-box',
          }}>
            <h2 style={{
              fontSize:34, fontWeight:800, color:'white',
              fontFamily:'var(--font-dm-sans)', margin:'0 0 16px 0',
              lineHeight:1.15, letterSpacing:'-0.5px',
            }}>
              Impact Starts With You.
            </h2>
            <p style={{
              fontSize:18, color:'rgba(255,255,255,0.92)',
              fontFamily:'var(--font-dm-sans)', margin:0, lineHeight:1.85,
              fontWeight:700,
            }}>
              Lemontree volunteers have turned collective action into $800,000
              of food for those in need. 1 in 8 of our neighbors still lacks
              reliable access to meals. Step up today and make a tangible
              difference.
            </p>
          </div>

          <div style={{
            flex:'1 1 0',
            minWidth:0,
            display:'flex',
            alignItems:'flex-end',
            justifyContent:'center',
            alignSelf:'stretch',
            overflow:'hidden',
            boxSizing:'border-box',
          }}>
            <img
              src="/hands.png"
              alt="Diverse hands raised together"
              style={{
                display:'block',
                width:'100%',
                maxWidth:'100%',
                height:'auto',
                maxHeight:'360px',
                objectFit:'contain',
                objectPosition:'bottom center',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Form {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  locationAddress: string;
  volunteers: string;
  flyerLanguage: string;
  visibility: 'public' | 'private';
}
const INIT: Form = {
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  locationAddress: '',
  volunteers: '',
  flyerLanguage: '',
  visibility: 'private',
};

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CreateEventPage() {
  const [form, setForm]               = useState<Form>(INIT);
  const [copied, setCopied]           = useState(false);
  const [busy, setBusy]               = useState(false);
  const [err, setErr]                 = useState<string|null>(null);
  const [ok, setOk]                   = useState(false);
  const [createdEventId, setCreatedEventId] = useState('');
  const [geocodedCoords, setGeocodedCoords] = useState<{lat:number;lng:number}|null>(null);

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<{display_name:string;lat:string;lon:string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const suggestionWrapRef = useRef<HTMLDivElement>(null);

  // Map state
  const mapRef = useRef<MapRef>(null);
  const [mapMarkers, setMapMarkers] = useState<{id:string;lng:number;lat:number;type:string}[]>([]);
  const [viewState, setViewState] = useState({longitude:-73.9857,latitude:40.7128,zoom:12});

  const shareLink = createdEventId
    ? `${typeof window !== 'undefined' ? window.location.host : 'lemontree.app'}/events/${createdEventId}`
    : 'lemontree.app/events/<event-id>';

  const ch = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(p => ({...p, [e.target.name]: e.target.value}));

  // Address autocomplete — debounced Nominatim search
  function onAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setForm(p => ({...p, locationAddress: val}));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setLocationSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5`,
          { headers: { 'User-Agent': 'lemontree-volunteer-app' } }
        );
        const data = await res.json();
        setLocationSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch { /* ignore */ }
    }, 300);
  }

  function pickSuggestion(s: {display_name:string;lat:string;lon:string}) {
    setForm(p => ({...p, locationAddress: s.display_name}));
    setGeocodedCoords({lat: parseFloat(s.lat), lng: parseFloat(s.lon)});
    setShowSuggestions(false);
    setLocationSuggestions([]);
  }

  // Dismiss suggestions on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (suggestionWrapRef.current && !suggestionWrapRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Map marker loading
  async function loadMarkers(bounds: {minLng:number;minLat:number;maxLng:number;maxLat:number}) {
    try {
      const url = `https://platform.foodhelpline.org/api/resources/markersWithinBounds`
        + `?corner=${bounds.minLng},${bounds.minLat}&corner=${bounds.maxLng},${bounds.maxLat}`;
      const raw = await fetch(url).then(r => r.json());
      const fc = raw.features ? raw : raw.json;
      type GeoFeature = { geometry: { coordinates: number[] }; properties: { id: string; resourceTypeId: string } };
      setMapMarkers((fc?.features ?? [])
        .filter((f: GeoFeature) => f.geometry?.coordinates?.length >= 2)
        .map((f: GeoFeature) => ({
          id: f.properties.id,
          type: f.properties.resourceTypeId,
          lng: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
        })));
    } catch { /* ignore */ }
  }

  useEffect(() => {
    loadMarkers({minLng:-74.1,minLat:40.6,maxLng:-73.7,maxLat:40.9});
  }, []);

  // Fly to geocoded coords when address is selected
  useEffect(() => {
    if (geocodedCoords && mapRef.current) {
      mapRef.current.flyTo({center:[geocodedCoords.lng, geocodedCoords.lat], zoom:15});
    }
  }, [geocodedCoords]);

  const copy = useCallback(() => {
    const url = `https://${shareLink}`;
    navigator.clipboard?.writeText(url).catch(() => {
      const el = document.createElement('textarea');
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    });
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }, [shareLink]);

  async function submit() {
    if (!form.title.trim()) { setErr('Please add an event title.'); return; }
    setBusy(true); setErr(null);
    try {
      // Geocode address via Nominatim
      let latitude: number | null = null;
      let longitude: number | null = null;
      if (form.locationAddress.trim()) {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.locationAddress)}&format=json&limit=1`,
          { headers: { 'User-Agent': 'lemontree-volunteer-app' } }
        ).then(r => r.json()).catch(() => []);
        if (geo[0]) {
          latitude = parseFloat(geo[0].lat);
          longitude = parseFloat(geo[0].lon);
          setGeocodedCoords({ lat: latitude, lng: longitude });
        }
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title:           form.title,
          description:     form.description,
          date:            form.date,
          start_time:      form.startTime,
          end_time:        form.endTime,
          location_name:   form.locationAddress,
          latitude:        latitude,
          longitude:       longitude,
          volunteer_limit: form.volunteers.trim() ? parseInt(form.volunteers) : null,
          visibility:      form.visibility,
          flyer_language:  form.flyerLanguage === 'Spanish' ? 'es' : 'en',
          pantry_mode:     'none',
          resource_count:  null,
          resource_id:     null,
        }),
      });
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.message||`Error ${res.status}`); }
      const data = await res.json();
      setCreatedEventId(data.id);
      setOk(true); setForm(INIT); window.scrollTo({top:0,behavior:'smooth'});
    } catch(e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  function LocationMap() {
    return (
      <div style={{position:'relative',width:'100%',height:250,borderRadius:5,border:`2px solid ${C.inputBorder}`,overflow:'hidden'}}>
        <MapGL
          ref={mapRef}
          mapLib={maplibregl}
          {...viewState}
          onMove={e => setViewState(e.viewState)}
          onMoveEnd={e => {
            const b = e.target.getBounds();
            loadMarkers({minLng:b.getWest(),minLat:b.getSouth(),maxLng:b.getEast(),maxLat:b.getNorth()});
          }}
          style={{width:'100%',height:'100%'}}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          {mapMarkers.map(m => (
            <Marker key={m.id} longitude={m.lng} latitude={m.lat} anchor="center">
              <div style={{
                width:14,height:14,borderRadius:'50%',
                border:'2px solid white',
                background:m.type==='SOUP_KITCHEN'?'#E86F51':'#6942b5',
                boxShadow:'0 1px 4px rgba(0,0,0,0.4)',
              }} title={m.type==='SOUP_KITCHEN'?'Soup Kitchen':'Food Pantry'} />
            </Marker>
          ))}
          {geocodedCoords && (
            <Marker longitude={geocodedCoords.lng} latitude={geocodedCoords.lat} anchor="center">
              <div style={{
                width:18,height:18,borderRadius:'50%',
                border:'3px solid white',
                background:C.teal,
                boxShadow:'0 2px 8px rgba(0,0,0,0.5)',
              }} title="Event location" />
            </Marker>
          )}
        </MapGL>
        {!geocodedCoords && (
          <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',pointerEvents:'none'}}>
            <span style={{background:'rgba(255,255,255,0.88)',color:C.textMuted,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:4}}>
              Enter an address above to zoom in
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#fef6df', fontFamily:'var(--font-dm-sans)'}}>

      {/* Date picker theming */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(30%) sepia(80%) saturate(500%) hue-rotate(240deg) brightness(80%);
          cursor: pointer;
          opacity: 0.7;
        }
        input[type="date"]::-webkit-datetime-edit {
          color: #2D2A26;
        }
      `}</style>

      {/* ── Yellow header bar with real logo ── */}
      <header style={{background:'#fecc0e', height:60, display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 24px', flexShrink:0}}>
        <Link href="/dashboard" style={{display:'flex', alignItems:'center', gap:10, textDecoration:'none'}}>
          <Image src="/logo.svg" alt="Lemontree" width={42} height={42} priority />
          <Image src="/lemontree_text_logo.svg" alt="Lemontree" width={112} height={24} priority style={{filter:'brightness(0)'}} />
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:8, background:'rgba(45,42,38,0.12)',
          padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:600,
          textTransform:'uppercase', letterSpacing:'0.5px', color:'#2D2A26',
          fontFamily:'var(--font-dm-sans)'}}>
          <div style={{width:10, height:10, borderRadius:'50%', background:'#2D2A26', opacity:0.45}} />
          User
        </div>
      </header>

      {/* ── Sticky top bar ── */}
      <div style={{position:'sticky',top:0,zIndex:20,
        background:'rgba(254,246,223,0.97)',backdropFilter:'blur(8px)',
        borderBottom:`1px solid ${C.border}`,padding:'10px 32px',
        display:'flex',alignItems:'center',justifyContent:'space-between'}}>

        <div style={{display:'flex',flexDirection:'column',gap:1}}>
          <span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.purple,lineHeight:1}}>Create</span>
          <span style={{fontSize:17,fontWeight:700,color:C.text,lineHeight:1}}>New Event</span>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {['Save Draft','My Events'].map(label => (
            <button key={label} type="button" style={{
              padding:'8px 16px',fontSize:13,fontWeight:600,fontFamily:'var(--font-dm-sans)',
              background:'rgba(255,255,255,0.7)',color:C.textSec,
              border:`1.5px solid ${C.border}`,borderRadius:5,cursor:'pointer',whiteSpace:'nowrap',
            }}>{label}</button>
          ))}
          <button type="button" onClick={submit} disabled={busy} style={{
            padding:'9px 22px',fontSize:14,fontWeight:700,fontFamily:'var(--font-dm-sans)',
            background:C.teal,color:'white',border:'none',borderRadius:5,
            cursor:busy?'not-allowed':'pointer',opacity:busy?0.65:1,
            display:'flex',alignItems:'center',gap:7,
            boxShadow:`0 2px 10px ${C.teal}55`,whiteSpace:'nowrap',
          }}>
            {busy ? <><span className="lt-spinner" style={{width:14,height:14}}/>Creating…</> : 'Create Event'}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{maxWidth:1160,margin:'0 auto',padding:'22px 32px 0'}}>

        {/* Banners */}
        {ok && (
          <div style={{marginBottom:14,display:'flex',alignItems:'center',gap:10,padding:'11px 16px',borderRadius:5,fontSize:13,fontWeight:500,background:C.tealLight,color:C.teal,border:`1.5px solid ${C.teal}44`}}>
            <Check size={14}/><span>Event created — it&apos;s live!</span>
            <button onClick={()=>setOk(false)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:C.teal,opacity:.6}}><X size={13}/></button>
          </div>
        )}
        {err && (
          <div style={{marginBottom:14,display:'flex',alignItems:'center',gap:10,padding:'11px 16px',borderRadius:5,fontSize:13,fontWeight:500,background:'#FEF0EF',color:'#D63B2F',border:'1.5px solid rgba(214,59,47,0.25)'}}>
            <AlertCircle size={14}/><span>{err}</span>
            <button onClick={()=>setErr(null)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'#D63B2F',opacity:.6}}><X size={13}/></button>
          </div>
        )}

        {/* ── Event Title — full width ── */}
        <div style={{marginBottom:16,borderRadius:7,overflow:'hidden',border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 1px 5px rgba(0,0,0,0.05)'}}>
          <div style={{background:C.purple,padding:'9px 18px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.8px',color:'white'}}>
            Event Title *
          </div>
          <div style={{background:C.tealCard,padding:'14px 18px'}}>
            <FInput type="text" name="title" value={form.title} onChange={ch}
              placeholder="e.g. Crown Heights Community Food Drive"
              xStyle={{fontSize:20,fontWeight:700,padding:'12px 14px'}} />
          </div>
        </div>

        {/* ── Two-col grid ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,alignItems:'start'}}>

          {/* LEFT col */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>

            <Card accent={C.purple} bg={C.tealCard} title="About This Event">
              <Field label="Description" mb={0}>
                <FTextarea name="description" value={form.description} onChange={ch}
                  placeholder="Tell volunteers what to expect, what to bring, and any other details…" />
              </Field>
            </Card>

            <Card accent={C.purple} bg={C.tealCard} title="Date & Time">
              <Field label="Date">
                <FInput type="date" name="date" value={form.date} onChange={ch} />
              </Field>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Field label="Start Time" mb={0}><FInput type="time" name="startTime" value={form.startTime} onChange={ch} /></Field>
                <Field label="End Time"   mb={0}><FInput type="time" name="endTime"   value={form.endTime}   onChange={ch} /></Field>
              </div>
            </Card>

            <Card accent={C.purple} bg={C.tealCard} title="Capacity">
              <Field label="Volunteer Limit" mb={0}>
                <FInput type="number" name="volunteers" value={form.volunteers} onChange={ch}
                  min="1" placeholder="Leave blank for unlimited" />
              </Field>
            </Card>

          </div>

          {/* RIGHT col */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>

            <Card accent={C.purple} bg={C.tealCard} title="Location">
              <Field label="Address">
                <div ref={suggestionWrapRef} style={{position:'relative'}}>
                  <FInput type="text" name="locationAddress" value={form.locationAddress}
                    onChange={onAddressChange} placeholder="e.g. 123 Main St, Brooklyn, NY"
                    autoComplete="off" />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <ul style={{
                      position:'absolute',zIndex:100,width:'100%',marginTop:3,
                      background:'white',border:`2px solid ${C.inputBorder}`,borderRadius:5,
                      boxShadow:'0 8px 24px rgba(107,70,193,0.15)',
                      maxHeight:220,overflowY:'auto',margin:'3px 0 0',padding:0,listStyle:'none',
                    }}>
                      {locationSuggestions.map((s,i) => (
                        <li key={i}>
                          <button type="button" onMouseDown={()=>pickSuggestion(s)}
                            style={{
                              width:'100%',textAlign:'left',padding:'8px 14px',fontSize:13,
                              display:'block',borderWidth:0,cursor:'pointer',
                              fontFamily:'var(--font-dm-sans)',background:'white',color:C.text,
                            }}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#F9F5FF';}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='white';}}
                          >{s.display_name}</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>
              <LocationMap />
            </Card>

            <Card accent={C.purple} bg={C.tealCard} title="Flyer">
              <Field label="Flyer Language" mb={0}>
                <Dropdown value={form.flyerLanguage} onChange={v=>setForm(p=>({...p,flyerLanguage:v}))}
                  placeholder="Select a language…" options={LANGUAGES} />
              </Field>
            </Card>

            <Card accent={C.purple} bg={C.tealCard} title="Visibility">
              <div style={{display:'flex',gap:10,marginBottom:10}}>
                {(['Public','Private'] as const).map(opt => {
                  const val = opt.toLowerCase() as 'public' | 'private';
                  const active = form.visibility === val;
                  return (
                    <button key={opt} type="button" onClick={()=>setForm(p=>({...p,visibility:val}))}
                      style={{flex:1,padding:'10px',fontSize:13,fontWeight:700,fontFamily:'var(--font-dm-sans)',
                        borderRadius:5,cursor:'pointer',transition:'all 0.15s',
                        background:active?C.purple:C.inputBg,color:active?'white':'#9b7fd4',
                        border:`2px solid ${active?C.purple:C.inputBorder}`}}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              <p style={{fontSize:12,color:C.textMuted,lineHeight:1.5,margin:0}}>
                {form.visibility === 'private'
                  ? 'Only people with the link can see and join this event.'
                  : 'This event appears publicly on lemontree for anyone to discover.'}
              </p>
            </Card>

          </div>
        </div>

        {/* ── Shareable link — full width ── */}
        <div style={{marginTop:16,borderRadius:7,overflow:'hidden',border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 1px 5px rgba(0,0,0,0.05)'}}>
          <div style={{background:C.teal,padding:'9px 18px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.8px',color:'white'}}>
            Shareable Link
          </div>
          <div style={{background:C.tealCard,padding:'14px 18px'}}>
            <p style={{fontSize:13,color:C.textSec,margin:'0 0 10px 0'}}>
              {createdEventId
                ? 'Share this link with volunteers to let them sign up.'
                : 'Your shareable link will appear here after the event is created.'}
            </p>
            <div style={{display:'flex',gap:10}}>
              <div style={{flex:1,display:'flex',alignItems:'center',gap:8,background:C.inputBg,
                border:`2px solid ${C.inputBorder}`,borderRadius:5,padding:'0 14px',height:42,overflow:'hidden'}}>
                <span style={{fontSize:12,fontWeight:700,color:'#9b7fd4',flexShrink:0}}>https://</span>
                <span style={{fontSize:13,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',
                  whiteSpace:'nowrap',color:createdEventId?C.text:'#a89bc7'}}>{shareLink}</span>
              </div>
              <button type="button" onClick={copy} disabled={!createdEventId} style={{
                height:42,padding:'0 20px',borderRadius:5,cursor:createdEventId?'pointer':'not-allowed',
                fontSize:13,fontWeight:700,fontFamily:'var(--font-dm-sans)',
                display:'flex',alignItems:'center',gap:7,flexShrink:0,transition:'all 0.2s',
                background:copied?C.tealLight:C.purpleLight,
                color:copied?C.teal:C.purple,
                border:`2px solid ${copied?C.teal+'66':C.inputBorder}`,
                opacity:createdEventId?1:0.5,
              }}>
                {copied ? <><Check size={14}/>Copied!</> : <><Copy size={14}/>Copy Link</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Submit button ── */}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
          <button type="button" onClick={submit} disabled={busy} style={{
            padding:'13px 36px',fontSize:15,fontWeight:700,fontFamily:'var(--font-dm-sans)',
            background:C.teal,color:'white',border:'none',borderRadius:5,
            cursor:busy?'not-allowed':'pointer',opacity:busy?0.65:1,
            display:'flex',alignItems:'center',gap:8,
            boxShadow:`0 4px 14px ${C.teal}55`,transition:'all 0.2s',
          }}>
            {busy ? <><span className="lt-spinner"/>Creating Event…</> : 'Create Event →'}
          </button>
        </div>

        {/* ── Hands banner ── */}
        <HandsBanner />

      </div>
    </div>
  );
}
