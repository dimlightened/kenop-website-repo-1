'use client'
import { useRouter } from 'next/navigation'

export default function OnboardSelect() {
  const router = useRouter()
  return (
    <div style={{ background:'#0D1117', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', padding:24 }}>
      <div style={{ fontSize:10, color:'rgba(29,158,117,0.5)', letterSpacing:'0.3em', fontFamily:'monospace', marginBottom:4 }}>अथ</div>
      <div style={{ fontSize:22, fontWeight:600, color:'#E6EDF3', letterSpacing:'0.08em', marginBottom:8 }}>KEN<span style={{color:'#1D9E75'}}>OP</span></div>
      <div style={{ fontSize:14, color:'#7D8590', marginBottom:40 }}>What type of plant are you onboarding?</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, maxWidth:560, width:'100%' }}>
        <div onClick={() => router.push('/onboard/biodiesel')} style={{ background:'#161B22', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'28px 24px', cursor:'pointer' }}>
          <div style={{ fontSize:32, marginBottom:16 }}>⚗️</div>
          <div style={{ fontSize:16, fontWeight:500, color:'#E6EDF3', marginBottom:8 }}>Biodiesel plant</div>
          <div style={{ fontSize:12, color:'#7D8590', lineHeight:1.6 }}>Transesterification · Glycerolysis · FAME · OMC tender</div>
          <div style={{ marginTop:20, fontSize:12, color:'#1D9E75' }}>Start onboarding →</div>
        </div>
        <div onClick={() => router.push('/onboard/edible-oil')} style={{ background:'#161B22', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'28px 24px', cursor:'pointer' }}>
          <div style={{ fontSize:32, marginBottom:16 }}>🫙</div>
          <div style={{ fontSize:16, fontWeight:500, color:'#E6EDF3', marginBottom:8 }}>Edible oil refinery</div>
          <div style={{ fontSize:12, color:'#7D8590', lineHeight:1.6 }}>Neutralisation · Bleaching · Deodorisation · Acid oil</div>
          <div style={{ marginTop:20, fontSize:12, color:'#1D9E75' }}>Start onboarding →</div>
        </div>
      </div>
      <div style={{ marginTop:48, fontSize:10, color:'rgba(255,255,255,0.1)', letterSpacing:'0.25em', fontFamily:'monospace' }}>THE USER SHALL RECEIVE MORE THAN THEY GIVE · KENOPANISHAD</div>
    </div>
  )
}
