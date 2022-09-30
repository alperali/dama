const celm = (th,e) => th.createElementNS('http://www.w3.org/2000/svg', e);

export 
function tahta_çiz(th) {

  (function çerçeve_çiz() {
    let tt, x1 = 47, x2 = 57,  y1 = 436, y2 = 426;
    const x_off = 54, y_off = 54;

    for (let c of 'abcdefgh') {
      tt = celm(th, 'text');
      tt.x.baseVal.appendItem(th.documentElement.createSVGLength());
      tt.x.baseVal[0].value = x1;
      tt.y.baseVal.appendItem(th.documentElement.createSVGLength());
      tt.y.baseVal[0].value = 472;
      tt.textContent = c;
      th.querySelectorAll('g')[4].appendChild(tt);
      tt = celm(th, 'text');
      tt.x.baseVal.appendItem(th.documentElement.createSVGLength());
      tt.x.baseVal[0].value = x2;
      tt.y.baseVal.appendItem(th.documentElement.createSVGLength());
      tt.y.baseVal[0].value = 8;
      tt.textContent = c;
      tt.rotate.baseVal.appendItem(th.documentElement.createSVGNumber());
      tt.rotate.baseVal[0].value = 180;
      th.querySelectorAll('g')[4].appendChild(tt);
      x1 += x_off;
      x2 += x_off;
    }

    for (let c of '12345678') {
      tt = celm(th, 'text');
      tt.x.baseVal.appendItem(th.documentElement.createSVGLength());
      tt.x.baseVal[0].value = 8;
      tt.y.baseVal.appendItem(th.documentElement.createSVGLength());
      tt.y.baseVal[0].value = y1;
      tt.textContent = c;
      th.querySelectorAll('g')[4].appendChild(tt);
      tt = celm(th, 'text');
      tt.x.baseVal.appendItem(th.documentElement.createSVGLength());
      tt.x.baseVal[0].value = 472;
      tt.y.baseVal.appendItem(th.documentElement.createSVGLength());
      tt.y.baseVal[0].value = y2;
      tt.textContent = c;
      tt.rotate.baseVal.appendItem(th.documentElement.createSVGNumber());
      tt.rotate.baseVal[0].value = 180;
      th.querySelectorAll('g')[4].appendChild(tt);
      y1 -= y_off;
      y2 -= y_off;
    }
  })();

  for (let y=25, y_say=0; y_say<8; y+=54, ++y_say)
    for (let x=25, x_say=0; x_say<8; x+=54, ++x_say) {
      const dd = celm(th, 'rect');  /* kareler */
      dd.x.baseVal.value = x;
      dd.y.baseVal.value = y;
      dd.width.baseVal.value = 52;
      dd.height.baseVal.value = 52;
      dd.dataset.x = x_say+1;
      dd.dataset.y = 8-y_say;
      dd.dataset.taş = 'yok';
      th.querySelectorAll('g')[1].appendChild(dd);
    }
}

export
function oyun_yükle(th) {
  const ilk = {
    "siyah": [
      ["1","7","0"],["2","7","0"],["3","7","0"],["4","7","0"],["5","7","0"],["6","7","0"],["7","7","0"],["8","7","0"],
      ["1","6","0"],["2","6","0"],["3","6","0"],["4","6","0"],["5","6","0"],["6","6","0"],["7","6","0"],["8","6","0"]
    ],
    "beyaz": [
      ["1","3","0"],["2","3","0"],["3","3","0"],["4","3","0"],["5","3","0"],["6","3","0"],["7","3","0"],["8","3","0"],
      ["1","2","0"],["2","2","0"],["3","2","0"],["4","2","0"],["5","2","0"],["6","2","0"],["7","2","0"],["8","2","0"]
    ],
    "sıra": "N/A"
  }
  let durum = JSON.parse(localStorage.getItem('damalper')) ?? ilk;
  taşları_diz(durum['siyah'], 'siyah', th.querySelectorAll('g')[2]);
  taşları_diz(durum['beyaz'], 'beyaz', th.querySelectorAll('g')[3]);
  return durum['sıra'];

  function taşları_diz(taşlar, renk, g) {
    const x_off = 54, y_off = 54, baş_x = 51, baş_y = 51;
    let cc, at;
    for (const t of taşlar) {
      cc = celm(th, 'circle');
      cc.cx.baseVal.value = baş_x + (+t[0]-1)*x_off;
      cc.cy.baseVal.value = baş_y + (8-(+t[1]))*y_off;
      cc.r.baseVal.value = 21;
      cc.dataset.x = t[0];
      cc.dataset.y = t[1];
      th.querySelector(`g g rect[data-x="${cc.dataset.x}"][data-y="${cc.dataset.y}"`).dataset.taş = renk;
      cc.dataset.dama = t[2];
      at = celm(th, 'animate');
      at.setAttribute('dur', '250ms');
      at.setAttribute('fill', 'freeze');
      at.setAttribute('begin', 'indefinite');
      cc.appendChild(at);
      if (t[2] === '1') dama_çiz(cc, renk);
      g.appendChild(cc);
    }
  }
}

export
function dama_çiz(c, renk) {
  if (renk == 'beyaz') {
    c.setAttribute('stroke-dasharray','none');
    c.setAttribute('stroke-width', '2');
    c.setAttribute('fill', 'url(#beyazdama)');
  }
  else {
    c.setAttribute('stroke-dasharray','none');
    c.setAttribute('stroke', 'dimgray');
    c.setAttribute('fill', 'url(#siyahdama)');
  }
}

export
function oyun_kaydet(th, s) {
  let durum = {
    "siyah": [ ],
    "beyaz": [ ],
    "sıra": ""
  }
  for (let t of th.querySelectorAll('g')[2].querySelectorAll('circle'))
    durum['siyah'].push([t.dataset.x, t.dataset.y, t.dataset.dama]);
  for (let t of th.querySelectorAll('g')[3].querySelectorAll('circle'))
    durum['beyaz'].push([t.dataset.x, t.dataset.y, t.dataset.dama]);
  durum['sıra'] = s;
  localStorage.setItem('damalper', JSON.stringify(durum));
}

export
function tahta_çevir(th) {
  let at = th.querySelector('g animateTransform[type="rotate"]');
  let beyaz_taraf = true;
  return function() {
    if (beyaz_taraf) {
      at.setAttribute('from', '0 240 240');
      at.setAttribute('to', '180 240 240');
      beyaz_taraf = false;
    }
    else {
      at.setAttribute('from', '180 240 240');
      at.setAttribute('to', '0 240 240');
      beyaz_taraf = true;
    }
    at.beginElement();
  }
}

export
function çerçeve_gör(th) {
  let at1 = th.querySelector('g animateTransform[type="translate"]');
  let at2 = th.querySelector('g animateTransform[type="scale"]');
  let görünür = true;
  return function() {
    if (görünür) {
      at1.setAttribute('from', '0 0');
      at1.setAttribute('to','-25 -24');
      at2.setAttribute('from', '1');
      at2.setAttribute('to', '1.1');
      görünür = false;
    }
    else {
      at1.setAttribute('from', '-25 -24');
      at1.setAttribute('to', '0 0');
      at2.setAttribute('from', '1.1');
      at2.setAttribute('to', '1');
      görünür = true;
    }
    at1.beginElement();
    at2.beginElement();
  }
}
