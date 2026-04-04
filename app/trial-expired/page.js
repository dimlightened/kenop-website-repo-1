import Link from 'next/link'
const G = '#1D9E75'

export default function TrialExpired() {
  return (
    <div style={{minHeight:'100vh',background:'#F8F5EF',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" />
      <div style={{width:'100%',maxWidth:460,textAlign:'center'}}>
        <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:28,fontWeight:700,color:'#1C1611'}}>Ken<span style={{color:G}}>op</span></span>
        <div style={{background:'#fff',border:'0.5px solid rgba(28,22,17,0.09)',borderRadius:16,padding:'48px 32px',marginTop:32}}>
          <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:24,fontWeight:600,color:'#1C1611',marginBottom:12}}>Your trial has ended</h2>
          <p style={{fontSize:15,color:'#A09285',lineHeight:1.7,marginBottom:28,fontWeight:300}}>
            Your 3-day free trial is complete. To continue using Kenop Intelligence, reach out to our team and we will get you set up on the right plan.
          </p>
          <a href="mailto:nachiket@idhma.in?subject=Kenop Intelligence - Continue Access"
            style={{display:'block',padding:'14px 24px',background:G,color:'#fff',borderRadius:10,textDecoration:'none',fontSize:15,fontWeight:500,marginBottom:14}}>
            Contact us to continue
          </a>
          <Link href="/login" style={{display:'block',padding:'12px',background:'none',border:'0.5px solid rgba(28,22,17,0.12)',color:'#A09285',borderRadius:10,textDecoration:'none',fontSize:13}}>
            Back to login
          </Link>
        </div>
        <p style={{fontSize:11,color:'#A09285',marginTop:20,fontWeight:300}}>E-Shakti Binary Currents Pvt. Ltd.</p>
      </div>
    </div>
  )
}
