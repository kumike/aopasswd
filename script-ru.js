let animationEnabled=localStorage.getItem('animationEnabled')!=='false';
let matrixInterval;
let currentMode='brute';

function toggleTheme(){const h=document.documentElement;const c=h.getAttribute('data-theme')||'dark';const n=c==='dark'?'light':'dark';h.setAttribute('data-theme',n);localStorage.setItem('theme',n);document.getElementById('themeToggle').textContent=n==='dark'?'🌙 Тема':'☀️ Тема'}
function toggleAnimation(){animationEnabled=!animationEnabled;localStorage.setItem('animationEnabled',animationEnabled);document.getElementById('animToggle').textContent=animationEnabled?'✨ Анимация':'⏸️ Анимация';if(animationEnabled)startAnimation();else stopAnimation()}
function startAnimation(){if(matrixInterval)return;matrixInterval=setInterval(drawMatrix,50)}
function stopAnimation(){if(matrixInterval){clearInterval(matrixInterval);matrixInterval=null;ctx.clearRect(0,0,canvas.width,canvas.height)}}

const savedTheme=localStorage.getItem('theme')||'dark';
document.documentElement.setAttribute('data-theme',savedTheme);
document.getElementById('themeToggle').textContent=savedTheme==='dark'?'🌙 Тема':'☀️ Тема';
document.getElementById('animToggle').textContent=animationEnabled?'✨ Анимация':'⏸️ Анимация';

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
    if(!pwd){strengthFill.style.width='0%';strengthText.textContent='Введите пароль';strengthText.style.color='var(--text-dim)';pwnedWarning.classList.remove('show');return}
    let charset=0;
    if(/[a-z]/.test(pwd))charset+=26;
    if(/[A-Z]/.test(pwd))charset+=26;
    if(/[0-9]/.test(pwd))charset+=10;
    if(/[^a-zA-Z0-9]/.test(pwd))charset+=32;
    let score=0;
    if(pwd.length>=8)score++;if(pwd.length>=12)score++;if(pwd.length>=16)score++;
    if(charset>=52)score++;if(charset>=62)score++;if(/[^a-zA-Z0-9]/.test(pwd))score++;
    const percentage=Math.min((score/6)*100,100);
    strengthFill.style.width=percentage+'%';
    if(score<=1){strengthFill.style.background='#ff2a2a';strengthText.textContent='ОЧЕНЬ СЛАБЫЙ';strengthText.style.color='#ff2a2a'}
    else if(score<=2){strengthFill.style.background='#ff8800';strengthText.textContent='СЛАБЫЙ';strengthText.style.color='#ff8800'}
    else if(score<=3){strengthFill.style.background='#ffcc00';strengthText.textContent='СРЕДНИЙ';strengthText.style.color='#ffcc00'}
    else if(score<=4){strengthFill.style.background='#88ff00';strengthText.textContent='СИЛЬНЫЙ';strengthText.style.color='#88ff00'}
    else{strengthFill.style.background='#00ff41';strengthText.textContent='ОЧЕНЬ СИЛЬНЫЙ';strengthText.style.color='#00ff41'}
    if(['password','123456','qwerty','admin'].includes(pwd.toLowerCase())){strengthText.textContent='🚨 СЕРЬЁЗНО? Даже мой кот мог бы взломать это!';strengthText.style.color='#ff2a2a'}
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
        if(match){const count=match.split(':')[1].trim();pwnedWarning.innerHTML=`⚠️ <strong>ЭТОТ ПАРОЛЬ НАЙДЕН В ${count} УТЕЧКАХ!</strong><br>Немедленно смените его на всех сайтах, где вы его использовали.`;pwnedWarning.classList.add('show')}
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
        document.getElementById('resultLabel').textContent='Атака полным перебором займет до:';
    }else{
        document.querySelectorAll('.calc-tab')[1].classList.add('active');
        document.getElementById('mode-dict').classList.add('active');
        document.getElementById('resultLabel').textContent='Перебор всего словаря займет до:';
    }
    document.getElementById('resultBox').classList.remove('show');
}

function updateSpeedByAlgorithm(){
    const algorithm=document.getElementById('algorithm').value;
    if(algorithm!=='custom'){document.getElementById('speed').value=parseInt(algorithm).toLocaleString('ru-RU')}
}

function formatTime(tSeconds,locale){
    if(!isFinite(tSeconds))return{main:"БОЛЕЕ 1 000 000 ЛЕТ<br><span style='font-size:0.9rem; color: var(--neon-green);'>ВАШ ПАРОЛЬ НАДЕЖЕН</span>",exact:"Значение превышает стандартные пределы вычисления."};
    if(tSeconds<60)return{main:"МЕНЕЕ 1 МИНУТЫ",exact:`Точное время: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    let t=tSeconds/60;
    if(t<180)return{main:Math.ceil(t)+" МИНУТ",exact:`Точное время: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    t/=60;
    if(t<72)return{main:Math.ceil(t)+" ЧАСОВ",exact:`Точное время: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    t/=24;
    if(t<90)return{main:Math.ceil(t)+" ДНЕЙ",exact:`Точное время: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    t/=30;
    if(t<36)return{main:Math.ceil(t)+" МЕСЯЦЕВ",exact:`Точное время: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
    t/=12;
    return{main:Math.ceil(t)+" ЛЕТ",exact:`Точное время: ${tSeconds.toLocaleString(locale,{maximumFractionDigits:0})} секунд`};
}

function doit(){
    let speedS=document.getElementById('speed').value.replace(/,/g,"").replace(/\s/g,"");
    const speed=parseFloat(speedS);
    if(isNaN(speed)||speed<=0||speed>1e15){alert("Неверное значение скорости");return}
    let tSeconds,combinations,modeInfo;
    if(currentMode==='brute'){
        const n=parseInt(document.getElementById('len').value);
        if(isNaN(n)||n<1||n>20){alert("Неверная длина пароля. Диапазон: 1..20");return}
        let cslen=0;
        if(document.getElementById('csascii').checked)cslen=96;
        else{
            if(document.getElementById('cslwr').checked)cslen+=26;
            if(document.getElementById('csuppr').checked)cslen+=26;
            if(document.getElementById('csdigits').checked)cslen+=10;
            if(document.getElementById('cssymb').checked)cslen+=12;
        }
        if(cslen===0){alert("Выберите хотя бы один набор символов");return}
        combinations=BigInt(cslen)**BigInt(n);
        const totalSpeed=BigInt(Math.floor(speed));
        tSeconds=Number(combinations)/Number(totalSpeed);
        modeInfo={mode:'Brute Force',length:n,charset:cslen,speed:speed};
    }else{
        let dictS=document.getElementById('dictSize').value.replace(/,/g,"").replace(/\s/g,"");
        const dictSize=parseFloat(dictS);
        if(isNaN(dictSize)||dictSize<=0||dictSize>1e18){alert("Неверное количество паролей в словаре");return}
        tSeconds=dictSize/speed;
        combinations=BigInt(Math.floor(dictSize));
        modeInfo={mode:'Dictionary',dictSize:dictSize,speed:speed};
    }
    const formatted=formatTime(tSeconds,'ru-RU');
    document.getElementById('result2').innerHTML=formatted.main;
    document.getElementById('resultExact').innerText=formatted.exact;
    document.getElementById('resultBox').classList.add('show');
    saveToHistory({...modeInfo,result:formatted.main,date:new Date().toLocaleString('ru-RU')});
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
            if(h.mode==='Brute Force')info=`Длина: ${h.length} | Набор: ${h.charset} | Скорость: ${h.speed.toLocaleString('ru-RU')}/сек`;
            else info=`Словарь: ${h.dictSize.toLocaleString('ru-RU')} | Скорость: ${h.speed.toLocaleString('ru-RU')}/сек`;
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
    navigator.clipboard.writeText(url).then(()=>showToast('Ссылка скопирована!'));
}

function exportAsImage(){showToast('Экспорт... (требуется html2canvas)')}
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3000)}

document.querySelectorAll('.data-table td').forEach(cell=>{
    cell.addEventListener('click',()=>{
        document.getElementById('modalBody').innerHTML=`
            <h3 style="color:var(--neon-cyan)">Время взлома WiFi: ${cell.textContent}</h3>
            <p style="margin-top:1rem">Это время рассчитано для скорости <strong>300,000 паролей/сек</strong> — типичной скорости перебора WPA2/WPA3 хешей на среднем ПК с хорошей видеокартой.</p>
            <p style="margin-top:1rem">На реальном оборудовании время может отличаться в зависимости от:</p>
            <ul style="margin-left:1.5rem;margin-top:.5rem">
                <li>Мощности видеокарты (RTX 4060 даёт ~1 млн/сек)</li>
                <li>Использования словарных атак (ускоряет в разы)</li>
                <li>Наличия PMKID в захваченном handshake</li>
            </ul>
            <p style="margin-top:1rem;color:var(--neon-green)"><strong>Совет:</strong> Для надёжной защиты WiFi используйте пароль длиной минимум 12 символов с буквами разного регистра, цифрами и спецсимволами.</p>
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
