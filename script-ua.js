let animationEnabled=localStorage.getItem('animationEnabled')!=='false';
let matrixInterval;
let currentMode='brute';

function toggleTheme(){const h=document.documentElement;const c=h.getAttribute('data-theme')||'dark';const n=c==='dark'?'light':'dark';h.setAttribute('data-theme',n);localStorage.setItem('theme',n);document.getElementById('themeToggle').textContent=n==='dark'?'🌙 Тема':'☀️ Тема'}
function toggleAnimation(){animationEnabled=!animationEnabled;localStorage.setItem('animationEnabled',animationEnabled);document.getElementById('animToggle').textContent=animationEnabled?'✨ Анімація':'⏸️ Анімація';if(animationEnabled)startAnimation();else stopAnimation()}
function startAnimation(){if(matrixInterval)return;matrixInterval=setInterval(drawMatrix,50)}
function stopAnimation(){if(matrixInterval){clearInterval(matrixInterval);matrixInterval=null;ctx.clearRect(0,0,canvas.width,canvas.height)}}

const savedTheme=localStorage.getItem('theme')||'dark';
document.documentElement.setAttribute('data-theme',savedTheme);
document.getElementById('themeToggle').textContent=savedTheme==='dark'?'🌙 Тема':'☀️ Тема';
document.getElementById('animToggle').textContent=animationEnabled?'✨ Анімація':'⏸️ Анімація';

const canvas=document.getElementById('matrix-bg');
const ctx=canvas.getContext('2d');
canvas.width=window.innerWidth;canvas.height=window.innerHeight;
const chars='01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const fontSize=14;const columns=canvas.width/fontSize;
const drops=Array(Math.floor(columns)).fill(1);
function drawMatrix(){ctx.fillStyle='rgba(5,8,10,0.05)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#00ff41';ctx.font=fontSize+'px monospace';for(let i=0;i<drops.length;i++){const text=chars[Math.floor(Math.random()*chars.length)];ctx.fillText(text,i*fontSize,drops[i]*fontSize);if(drops[i]*fontSize>canvas.height&&Math.random()>.975)drops[i]=0;drops[i]++}}
if(animationEnabled)startAnimation();
window.addEventListener('resize',()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight});

const realPasswordInput=document.getElementById('realPassword');
const strengthFill=document.getElementById('strengthFill');
const strengthText=document.getElementById('strengthText');
const pwnedWarning=document.getElementById('pwnedWarning');

realPasswordInput.addEventListener('input',function(){
    const pwd=this.value;
    if(!pwd){strengthFill.style.width='0%';strengthText.textContent='Введіть пароль';strengthText.style.color='var(--text-dim)';pwnedWarning.classList.remove('show');return}
    let charset=0;
    if(/[a-z]/.test(pwd))charset+=26;if(/[A-Z]/.test(pwd))charset+=26;if(/[0-9]/.test(pwd))charset+=10;if(/[^a-zA-Z0-9]/.test(pwd))charset+=32;
    let score=0;
    if(pwd.length>=8)score++;if(pwd.length>=12)score++;if(pwd.length>=16)score++;
    if(charset>=52)score++;if(charset>=62)score++;if(/[^a-zA-Z0-9]/.test(pwd))score++;
    const percentage=Math.min((score/6)*100,100);
    strengthFill.style.width=percentage+'%';
    if(score<=1){strengthFill.style.background='#ff2a2a';strengthText.textContent='ДУЖЕ СЛАБКИЙ';strengthText.style.color='#ff2a2a'}
    else if(score<=2){strengthFill.style.background='#ff8800';strengthText.textContent='СЛАБКИЙ';strengthText.style.color='#ff8800'}
    else if(score<=3){strengthFill.style.background='#ffcc00';strengthText.textContent='СЕРЕДНІЙ';strengthText.style.color='#ffcc00'}
    else if(score<=4){strengthFill.style.background='#88ff00';strengthText.textContent='СИЛЬНИЙ';strengthText.style.color='#88ff00'}
    else{strengthFill.style.background='#00ff41';strengthText.textContent='ДУЖЕ СИЛЬНИЙ';strengthText.style.color='#00ff41'}
    if(['password','123456','qwerty','admin'].includes(pwd.toLowerCase())){strengthText.textContent='🚨 СЕРЙОЗНО? Навіть мій кіт міг би це зламати!';strengthText.style.color='#ff2a2a'}
    checkPwned(pwd);
});

async function checkPwned(password){
    try{
        const hashBuffer=await crypto.subtle.digest('SHA-1',new TextEncoder().encode(password));
        const hashArray=Array.from(new Uint8Array(hashBuffer));
        const hashHex=hashArray.map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
        const prefix=hashHex.substring(0,5);const suffix=hashHex.substring(5);
        const response=await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text=await response.text();
        const match=text.split('\n').find(line=>line.startsWith(suffix));
        if(match){const count=match.split(':')[1].trim();pwnedWarning.innerHTML=`⚠️ <strong>ЦЕЙ ПАРОЛЬ ЗНАЙДЕНО В ${count} ВИТОКАХ!</strong><br>Негайно змініть його на всіх сайтах, де ви його використовували.`;pwnedWarning.classList.add('show')}
        else{pwnedWarning.classList.remove('show')}
    }catch(e){console.log('HIBP API error:',e)}
}

function toggleCalculator(){document.getElementById('calcContent').classList.toggle('open');document.querySelector('.calc-toggle-btn').classList.toggle('active')}

function switchCalcMode(mode){
    currentMode=mode;
    document.querySelectorAll('.calc-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.calc-mode').forEach(m=>m.classList.remove('active'));
    if(mode==='brute'){
        document.querySelectorAll('.calc-tab')[0].classList.add('active');
        document.getElementById('mode-brute').classList.add('active');
        document.getElementById('resultLabel').textContent='Атака повним перебором займе до:';
    }else{
        document.querySelectorAll('.calc-tab')[1].classList.add('active');
        document.getElementById('mode-dict').classList.add('active');
        document.getElementById('resultLabel').textContent='Перебір усього словника займе до:';
    }
    document.getElementById('resultBox').classList.remove('show');
}

function updateSpeedByAlgorithm(){
    const algorithm=document.getElementById('algorithm').value;
    if(algorithm!=='custom'){document.getElementById('speed').value=parseInt(algorithm).toLocaleString('uk-UA')}
}

function formatTime(tSeconds,locale){
    if(!isFinite(tSeconds))return{main:"БІЛЬШЕ 1 000 000 РОКІВ<br><span style='font-size:0.9rem; color: var(--neon-green);'>ВАШ ПАРОЛЬ НАДІЙНИЙ</span>",exact:"Значення перевищує стандартні межі обчислення."};
    if(tSeconds<60)return{main:"МЕНШЕ 1 ХВИЛИНИ",exact:`Точний час: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    let t=tSeconds/60;
    if(t<180)return{main:Math.ceil(t)+" ХВИЛИН",exact:`Точний час: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    t/=60;
    if(t<72)return{main:Math.ceil(t)+" ГОДИН",exact:`Точний час: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    t/=24;
    if(t<90)return{main:Math.ceil(t)+" ДНІВ",exact:`Точний час: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    t/=30;
    if(t<36)return{main:Math.ceil(t)+" МІСЯЦІВ",exact:`Точний час: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    t/=12;
    return{main:Math.ceil(t)+" РОКІВ",exact:`Точний час: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
}

function doit(){
    let speedS=document.getElementById('speed').value.replace(/,/g,"").replace(/\s/g,"");
    const speed=parseFloat(speedS);
    if(isNaN(speed)||speed<=0||speed>1e15){alert("Невірне значення швидкості");return}
    let tSeconds,combinations,modeInfo;
    if(currentMode==='brute'){
        const n=parseInt(document.getElementById('len').value);
        if(isNaN(n)||n<1||n>20){alert("Невірна довжина пароля. Діапазон: 1..20");return}
        let cslen=0;
        if(document.getElementById('csascii').checked)cslen=96;
        else{
            if(document.getElementById('cslwr').checked)cslen+=26;
            if(document.getElementById('csuppr').checked)cslen+=26;
            if(document.getElementById('csdigits').checked)cslen+=10;
            if(document.getElementById('cssymb').checked)cslen+=12;
        }
        if(cslen===0){alert("Виберіть хоча б один набір символів");return}
        combinations=BigInt(cslen)**BigInt(n);
        const totalSpeed=BigInt(Math.floor(speed));
        tSeconds=Number(combinations)/Number(totalSpeed);
        modeInfo={mode:'Brute Force',length:n,charset:cslen,speed:speed};
    }else{
        let dictS=document.getElementById('dictSize').value.replace(/,/g,"").replace(/\s/g,"");
        const dictSize=parseFloat(dictS);
        if(isNaN(dictSize)||dictSize<=0||dictSize>1e18){alert("Невірна кількість паролів у словнику");return}
        tSeconds=dictSize/speed;
        combinations=BigInt(Math.floor(dictSize));
        modeInfo={mode:'Dictionary',dictSize:dictSize,speed:speed};
    }
    const formatted=formatTime(tSeconds,'uk-UA');
    document.getElementById('result2').innerHTML=formatted.main;
    document.getElementById('resultExact').innerText=formatted.exact;
    document.getElementById('resultBox').classList.add('show');
    saveToHistory({...modeInfo,result:formatted.main,date:new Date().toLocaleString('uk-UA')});
}

function saveToHistory(result){
    const history=JSON.parse(localStorage.getItem('calcHistory')||'[]');
    history.unshift(result);
    if(history.length>10)history.pop();
    localStorage.setItem('calcHistory',JSON.stringify(history));
}

function toggleHistory(){
    const panel=document.getElementById('historyPanel');
    panel.classList.toggle('show');
    if(panel.classList.contains('show')){
        const history=JSON.parse(localStorage.getItem('calcHistory')||'[]');
        document.getElementById('historyList').innerHTML=history.map(h=>{
            let info='';
            if(h.mode==='Brute Force')info=`Довжина: ${h.length} | Набір: ${h.charset} | Швидкість: ${h.speed.toLocaleString('uk-UA')}/сек`;
            else info=`Словник: ${h.dictSize.toLocaleString('uk-UA')} | Швидкість: ${h.speed.toLocaleString('uk-UA')}/сек`;
            return `<div class="history-item">${h.date} | ${h.mode} | ${info} | Результат: ${h.result}</div>`;
        }).join('');
    }
}

function shareResult(){
    const url=new URL(window.location);
    url.searchParams.set('mode',currentMode);
    url.searchParams.set('speed',document.getElementById('speed').value);
    if(currentMode==='brute'){url.searchParams.set('len',document.getElementById('len').value)}
    else{url.searchParams.set('dict',document.getElementById('dictSize').value)}
    navigator.clipboard.writeText(url).then(()=>showToast('Посилання скопійовано!'));
}

function exportAsImage(){showToast('Експорт... (потрібен html2canvas)')}
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3000)}

document.querySelectorAll('.data-table td').forEach(cell=>{
    cell.addEventListener('click',()=>{
        document.getElementById('modalBody').innerHTML=`
            <h3 style="color:var(--neon-cyan)">Час злому WiFi: ${cell.textContent}</h3>
            <p style="margin-top:1rem">Цей час розраховано для швидкості <strong>300,000 паролів/сек</strong> — типової швидкості перебору WPA2/WPA3 хешів на середньому ПК з хорошою відеокартою.</p>
            <p style="margin-top:1rem">На реальному обладнанні час може відрізнятися залежно від:</p>
            <ul style="margin-left:1.5rem;margin-top:.5rem">
                <li>Потужності відеокарти (RTX 4060 дає ~1 млн/сек)</li>
                <li>Використання словникових атак (прискорює в рази)</li>
                <li>Наявності PMKID у захопленому handshake</li>
            </ul>
            <p style="margin-top:1rem;color:var(--neon-green)"><strong>Порада:</strong> Для надійного захисту WiFi використовуйте пароль довжиною мінімум 12 символів з літерами різного регістру, цифрами та спецсимволами.</p>
        `;
        document.getElementById('modal').classList.add('show');
    });
});

function closeModal(){document.getElementById('modal').classList.remove('show')}

document.getElementById('csascii').addEventListener('change',function(){
    ['cslwr','csuppr','csdigits','cssymb'].forEach(id=>{
        const el=document.getElementById(id);
        el.disabled=this.checked;
        el.style.opacity=this.checked?'0.3':'1';
    });
});

const urlParams=new URLSearchParams(window.location.search);
if(urlParams.get('mode'))switchCalcMode(urlParams.get('mode'));
if(urlParams.get('len'))document.getElementById('len').value=urlParams.get('len');
if(urlParams.get('dict'))document.getElementById('dictSize').value=urlParams.get('dict');
if(urlParams.get('speed'))document.getElementById('speed').value=urlParams.get('speed');
