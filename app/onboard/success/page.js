export default function Success() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F4F6F8',fontFamily:'sans-serif'}}>
      <div style={{textAlign:'center',background:'white',padding:48,borderRadius:12,boxShadow:'0 2px 16px rgba(0,0,0,0.06)',maxWidth:440}}>
        <div style={{fontSize:48,marginBottom:16}}>✅</div>
        <h2 style={{color:'#1B2A4A',marginBottom:12}}>Application submitted</h2>
        <p style={{color:'#666',lineHeight:1.7,marginBottom:24}}>
          Thank you. Our team will review your details and activate your account within 24 hours. You will receive an email with your login credentials.
        </p>
        <p style={{color:'#888',fontSize:13}}>Questions? Contact us at nachiket@idhma.in</p>
      </div>
    </div>
  )
}
