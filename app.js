const grid = document.getElementById('productGrid');
const filterButtons = document.querySelectorAll('.filters button');
const chatLog = document.getElementById('chatLog');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function renderProducts(filter='all'){
  const list = filter === 'all' ? products : products.filter(p => p.brand === filter);
  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <p class="eyebrow">${p.brand}</p>
      <h3>${p.model}</h3>
      <p class="price">${p.price ? 'NT$ ' + p.price.toLocaleString() : '歡迎洽詢'}</p>
      <p>${p.summary}</p>
      <p class="spec">${p.specs}</p>
      <div>${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </article>
  `).join('');
}
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.filter);
}));

function addMsg(text, type='bot'){
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function aiReply(q){
  const text = q.toLowerCase();
  const budget = (text.match(/\d{4,5}/) || [])[0] ? Number((text.match(/\d{4,5}/) || [])[0]) : null;
  if(text.includes('d20') && text.includes('d30')){
    return 'D20 是桃花心木面單，聲音較溫暖，適合初學升級；D30 是雲杉面單搭玫瑰木側背，聲音層次與亮度更好，較適合進階演奏。預算夠的話選 D30，想控制預算選 D20。';
  }
  if(text.includes('旅行') || text.includes('攜帶') || text.includes('36')){
    return '建議看 EITMOSS 36 吋旅行吉他。尺寸較好攜帶，適合外出、學生、露營或空間有限的人。';
  }
  if(text.includes('拾音') || text.includes('直播') || text.includes('表演') || text.includes('舞台')){
    return '建議優先看有拾音器的 ANISA R7，適合直播、舞台彈唱與需要外接音箱的情境。';
  }
  if(text.includes('全單') || text.includes('全相思')){
    return '目前可主推 ANISA AS-01：全相思木全單板、亮面 JF 桶身，適合對音色與質感有要求的客人。';
  }
  if(budget){
    const matched = products.filter(p => p.price && p.price <= budget + 1000).map(p => `${p.model}（NT$${p.price.toLocaleString()}）`);
    if(matched.length) return `依照你的預算，建議先看：${matched.join('、')}。若你是初學，D10 最好入門；若想升級，D20 更適合。`;
    return '這個預算目前可能需要洽詢特殊方案或入門款。你可以告訴我預算上限與用途，我再幫你縮小選擇。';
  }
  if(text.includes('初學') || text.includes('新手')){
    return '初學建議從 DADARWOOD D10 或 D20 開始。D10 價格較好入手；D20 聲音更溫暖，適合想一次買好一點的人。';
  }
  return '我可以依照預算、木材、桶身、是否需要拾音器、用途來推薦。你可以輸入：「預算 8000 初學」、「我要直播彈唱」、「D20 跟 D30 差在哪」。';
}

function handleSend(){
  const q = input.value.trim();
  if(!q) return;
  addMsg(q, 'user');
  addMsg(aiReply(q), 'bot');
  input.value = '';
}
sendBtn.addEventListener('click', handleSend);
input.addEventListener('keydown', e => { if(e.key === 'Enter') handleSend(); });
renderProducts();
