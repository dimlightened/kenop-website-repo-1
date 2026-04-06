export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Kenop — Payment Links</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Instrument Sans',sans-serif;background:#09090E;color:#F0F0F8;min-height:100vh;padding:28px 16px 80px}
.wrap{max-width:500px;margin:0 auto}
.logo{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#EF9F27;margin-bottom:28px;display:block}
h1{font-size:22px;font-weight:600;margin-bottom:4px}
.sub{font-size:13px;color:#8888A0;margin-bottom:28px;line-height:1.6}
.field{margin-bottom:14px}
label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:#44445A;display:block;margin-bottom:6px}
input{width:100%;padding:11px 14px;background:#0F0F18;border:1px solid rgba(255,255,255,.1);border-radius:4px;color:#F0F0F8;font-family:'Instrument Sans',sans-serif;font-size:14px;outline:none}
input:focus{border-color:#EF9F27}
.plan-label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:#44445A;margin-bottom:8px;display:block}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px}
.plan{background:#0F0F18;border:2px solid rgba(255,255,255,.07);border-radius:6px;padding:14px 10px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s}
.plan.sel-ion{border-color:#4DB6FF;background:rgba(77,182,255,.06)}
.plan.sel-nova{border-color:#00D8A4;background:rgba(0,216,164,.06)}
.plan.sel-plaid{border-color:#EF9F27;background:rgba(239,159,39,.06)}
.plan-n{font-family:'DM Mono',monospace;font-size:14px;font-weight:500;margin-bottom:5px}
.ion .plan-n{color:#4DB6FF}.nova .plan-n{color:#00D8A4}.plaid .plan-n{color:#EF9F27}
.plan-p{font-family:'DM Mono',monospace;font-size:10px;color:#8888A0}
.plan-t{font-family:'DM Mono',monospace;font-size:9px;color:#44445A;margin-top:3px}
#gen-btn{width:100%;padding:14px;background:#EF9F27;color:#09090E;font-family:'DM Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;border:none;border-radius:4px;cursor:pointer;margin-top:4px}
#gen-btn:disabled{opacity:.35;cursor:not-allowed}
.err{margin-top:14px;background:rgba(255,80,80,.08);border:1px solid rgba(255,80,80,.2);border-radius:4px;padding:11px 14px;font-family:'DM Mono',monospace;font-size:11px;color:#ff8080}
.res{margin-top:22px;background:#0F0F18;border:1px solid rgba(255,255,255,.08);border-radius:6px;overflow:hidden}
.res-head{background:#141421;padding:11px 16px;display:flex;justify-content:space-between;align-items:center}
.res-ok{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#00D8A4}
.res-plan{font-family:'DM Mono',monospace;font-size:9px;color:#44445A}
.res-body{padding:18px 16px}
.link-row{display:flex;align-items:center;gap:8px;background:#09090E;border:1px solid rgba(239,159,39,.25);border-radius:4px;padding:11px 14px;margin-bottom:14px}
.link-val{font-family:'DM Mono',monospace;font-size:12px;color:#EF9F27;flex:1;word-break:break-all;line-height:1.4}
.copy-btn{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;padding:6px 11px;background:rgba(239,159,39,.15);border:1px solid rgba(239,159,39,.3);border-radius:3px;color:#EF9F27;cursor:pointer;white-space:nowrap;flex-shrink:0}
.wa-btn{display:block;width:100%;padding:12px;background:#25D366;color:#fff;font-family:'DM Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:none;border-radius:4px;cursor:pointer;text-align:center;text-decoration:none;margin-bottom:10px}
.bks{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.bk{background:#09090E;border:1px solid rgba(255,255,255,.05);border-radius:4px;padding:10px;text-align:center}
.bk-n{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:#F0F0F8}
.bk-l{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#44445A;margin-top:3px}
.spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(9,9,14,.3);border-top-color:#09090E;border-radius:50%;animation:sp .7s linear infinite;margin-right:6px;vertical-align:middle}
@keyframes sp{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="wrap">
  <span class="logo">Kenop Intelligence</span>
  <h1>Payment Links</h1>
  <p class="sub">Fill in client details, pick a plan, generate a Razorpay link. Share on WhatsApp. Invoice auto-generates on payment.</p>
  <div class="field"><label>Client Name *</label><input id="f-name" type="text" placeholder="ABC Industries"/></div>
  <div class="field"><label>Phone *</label><input id="f-phone" type="tel" placeholder="9876543210" maxlength="10"/></div>
  <div class="field"><label>Email (optional)</label><input id="f-email" type="email" placeholder="owner@company.com"/></div>
  <div class="field"><label>GSTIN (optional)</label><input id="f-gstin" type="text" placeholder="27AADCE8793N1ZS" maxlength="15"/></div>
  <span class="plan-label">Select Plan *</span>
  <div class="plans">
    <div class="plan ion" id="p-ion"><div class="plan-n">ION</div><div class="plan-p">₹11,000</div><div class="plan-t">+GST ₹12,980</div></div>
    <div class="plan nova" id="p-nova"><div class="plan-n">NOVA</div><div class="plan-p">₹29,000</div><div class="plan-t">+GST ₹34,220</div></div>
    <div class="plan plaid" id="p-plaid"><div class="plan-n">PLAID</div><div class="plan-p">₹65,000</div><div class="plan-t">+GST ₹76,700</div></div>
  </div>
  <button id="gen-btn" disabled>Select a plan to continue</button>
  <div id="err" style="display:none"></div>
  <div id="res" style="display:none">
    <div class="res">
      <div class="res-head"><span class="res-ok">✓ Link created</span><span class="res-plan" id="r-plan"></span></div>
      <div class="res-body">
        <div class="link-row"><span class="link-val" id="r-link"></span><button class="copy-btn" id="copy-btn">Copy</button></div>
        <a class="wa-btn" id="wa-btn" href="#" target="_blank">💬 Share on WhatsApp</a>
        <div class="bks">
          <div class="bk"><div class="bk-n" id="r-base"></div><div class="bk-l">Plan</div></div>
          <div class="bk"><div class="bk-n" id="r-gst"></div><div class="bk-l">GST 18%</div></div>
          <div class="bk"><div class="bk-n" id="r-total" style="color:#EF9F27"></div><div class="bk-l">Total</div></div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
var plan = null;
function inr(n){ return '₹' + Number(n).toLocaleString('en-IN'); }
['ion','nova','plaid'].forEach(function(p){
  document.getElementById('p-'+p).addEventListener('click', function(){
    plan = p;
    ['ion','nova','plaid'].forEach(function(x){
      document.getElementById('p-'+x).className = 'plan ' + x;
    });
    this.className = 'plan ' + p + ' sel-' + p;
    var btn = document.getElementById('gen-btn');
    btn.disabled = false;
    btn.textContent = 'Generate payment link →';
  });
});
document.getElementById('gen-btn').addEventListener('click', function(){
  var name = document.getElementById('f-name').value.trim();
  var phone = document.getElementById('f-phone').value.trim();
  var email = document.getElementById('f-email').value.trim();
  var gstin = document.getElementById('f-gstin').value.trim().toUpperCase();
  document.getElementById('err').style.display = 'none';
  document.getElementById('res').style.display = 'none';
  if(!name){ showErr('Client name is required'); return; }
  if(!phone || phone.length < 10){ showErr('Enter valid 10-digit phone'); return; }
  if(!plan){ showErr('Select a plan'); return; }
  var btn = this;
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span>Generating...';
  fetch('https://wvjohfmeubnxlwzgszhe.supabase.co/functions/v1/kenop-razorpay', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({action:'create_payment_link',client_id:'cli_'+Date.now(),client_name:name,client_phone:phone,client_email:email||undefined,client_gstin:gstin||undefined,plan:plan})
  })
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.error){showErr(d.error);return;}
    document.getElementById('r-link').textContent = d.payment_link;
    document.getElementById('r-plan').textContent = plan.toUpperCase();
    document.getElementById('r-base').textContent = inr(d.breakdown.plan_price);
    document.getElementById('r-gst').textContent = inr(d.breakdown.gst_18pct);
    document.getElementById('r-total').textContent = inr(d.breakdown.total);
    var msg = 'Hi '+name+',\\n\\nYour Kenop Intelligence subscription:\\n'+d.payment_link+'\\n\\nPlan: '+plan.toUpperCase()+' | Amount: '+inr(d.breakdown.total)+' (GST incl.)\\n\\nLink valid 7 days.\\n— Kenop Intelligence';
    document.getElementById('wa-btn').href = 'https://wa.me/91'+phone+'?text='+encodeURIComponent(msg);
    document.getElementById('res').style.display = 'block';
  })
  .catch(function(){showErr('Network error. Try again.');})
  .finally(function(){btn.disabled=false;btn.textContent='Generate another →';});
});
document.getElementById('copy-btn').addEventListener('click', function(){
  var link = document.getElementById('r-link').textContent;
  var btn = this;
  navigator.clipboard.writeText(link).then(function(){
    btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy';},2000);
  }).catch(function(){
    var ta=document.createElement('textarea');ta.value=link;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy';},2000);
  });
});
function showErr(msg){
  var e=document.getElementById('err');e.className='err';e.textContent='⚠ '+msg;e.style.display='block';
  var btn=document.getElementById('gen-btn');btn.disabled=false;btn.textContent='Generate payment link →';
}
</script>
</body>
</html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}.rb{padding:18px 16px}
.lr{display:flex;align-items:center;gap:8px;background:#09090E;border:1px solid rgba(239,159,39,.25);border-radius:4px;padding:11px 14px;margin-bottom:14px}
.lv{font-family:'DM Mono',monospace;font-size:12px;color:#EF9F27;flex:1;word-break:break-all;line-height:1.4}
.cb{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;padding:6px 11px;background:rgba(239,159,39,.15);border:1px solid rgba(239,159,39,.3);border-radius:3px;color:#EF9F27;cursor:pointer;white-space:nowrap;flex-shrink:0}
.wb{display:block;width:100%;padding:12px;background:#25D366;color:#fff;font-family:'DM Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:none;border-radius:4px;cursor:pointer;text-align:center;text-decoration:none;margin-bottom:10px}
.bks{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.bk{background:#09090E;border:1px solid rgba(255,255,255,.05);border-radius:4px;padding:10px;text-align:center}
.bn{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:#F0F0F8}
.bl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#44445A;margin-top:3px}
.spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(9,9,14,.3);border-top-color:#09090E;border-radius:50%;animation:sp .7s linear infinite;margin-right:6px;vertical-align:middle}
@keyframes sp{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="wrap">
  <span class="logo">Kenop Intelligence</span>
  <h1>Payment Links</h1>
  <p class="sub">Fill in client details, pick a plan, generate the Razorpay link. Invoice auto-generates on payment.</p>
  <div class="field"><label>Client Name *</label><input id="fn" type="text" placeholder="ABC Industries"/></div>
  <div class="field"><label>Phone *</label><input id="fp" type="tel" placeholder="9876543210" maxlength="10"/></div>
  <div class="field"><label>Email (optional)</label><input id="fe" type="email" placeholder="owner@company.com"/></div>
  <div class="field"><label>GSTIN (optional)</label><input id="fg" type="text" placeholder="27AADCE8793N1ZS" maxlength="15"/></div>
  <span class="pl">Select Plan *</span>
  <div class="plans">
    <div class="plan ion" id="p-ion"><div class="pn">ION</div><div class="pp">&#8377;11,000</div><div class="pt">+GST &#8377;12,980</div></div>
    <div class="plan nova" id="p-nova"><div class="pn">NOVA</div><div class="pp">&#8377;29,000</div><div class="pt">+GST &#8377;34,220</div></div>
    <div class="plan plaid" id="p-plaid"><div class="pn">PLAID</div><div class="pp">&#8377;65,000</div><div class="pt">+GST &#8377;76,700</div></div>
  </div>
  <button id="btn" disabled>Select a plan to continue</button>
  <div class="err" id="err"></div>
  <div class="res" id="res">
    <div class="rh"><span class="rok">&#10003; Link created</span><span class="rpl" id="rpl"></span></div>
    <div class="rb">
      <div class="lr"><span class="lv" id="lv"></span><button class="cb" id="cb">Copy</button></div>
      <a class="wb" id="wb" href="#" target="_blank">&#128172; Share on WhatsApp</a>
      <div class="bks">
        <div class="bk"><div class="bn" id="b1"></div><div class="bl">Plan</div></div>
        <div class="bk"><div class="bn" id="b2"></div><div class="bl">GST 18%</div></div>
        <div class="bk"><div class="bn" id="b3" style="color:#EF9F27"></div><div class="bl">Total</div></div>
      </div>
    </div>
  </div>
</div>
<script>
var sel = null;
function inr(n){return '&#8377;'+Number(n).toLocaleString('en-IN');}
['ion','nova','plaid'].forEach(function(p){
  document.getElementById('p-'+p).addEventListener('click',function(){
    sel=p;
    ['ion','nova','plaid'].forEach(function(x){
      var el=document.getElementById('p-'+x);
      el.className='plan '+x+(x===p?' active-'+x:'');
    });
    var b=document.getElementById('btn');
    b.disabled=false;
    b.textContent='Generate payment link \u2192';
  });
});
document.getElementById('btn').addEventListener('click',function(){
  var name=document.getElementById('fn').value.trim();
  var phone=document.getElementById('fp').value.trim();
  var email=document.getElementById('fe').value.trim();
  var gstin=document.getElementById('fg').value.trim().toUpperCase();
  var err=document.getElementById('err');
  err.style.display='none';
  document.getElementById('res').style.display='none';
  if(!name){err.textContent='\u26a0 Client name required';err.style.display='block';return;}
  if(!phone||phone.length<10){err.textContent='\u26a0 Valid 10-digit phone required';err.style.display='block';return;}
  if(!sel){err.textContent
