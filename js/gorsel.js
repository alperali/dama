const celm = (th,e) => th.createElementNS('http://www.w3.org/2000/svg', e);
const Taş = { yok: 9, Syh: 13, Byz: 17, Yoz: 0, Dama: 1 };
const Yön = { B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };

export 
function tahta_çiz(th) {

  (function çerçeve_çiz() {
    let tt, x1 = 47, x2 = 57,  y1 = 436, y2 = 426;
    const x_off = 54, y_off = 54, çv = th.querySelector('#çerçeve');

    for (let c of 'abcdefgh') {
      tt = celm(th, 'text');
      tt.setAttribute('x', x1);
      tt.setAttribute('y', 472);
      tt.textContent = c;
      çv.appendChild(tt);
      tt = celm(th, 'text');
      tt.setAttribute('x', x2);
      tt.setAttribute('y', 8);
      tt.textContent = c;
      tt.setAttribute('rotate', '180');
      çv.appendChild(tt);
      x1 += x_off;
      x2 += x_off;
    }

    for (let c of '12345678') {
      tt = celm(th, 'text');
      tt.setAttribute('x', 8);
      tt.setAttribute('y', y1);
      tt.textContent = c;
      çv.appendChild(tt);
      tt = celm(th, 'text');
      tt.setAttribute('x', 472);
      tt.setAttribute('y', y2);
      tt.textContent = c;
      tt.setAttribute('rotate', '180');
      çv.appendChild(tt);
      y1 -= y_off;
      y2 -= y_off;
    }
  })();

  const k = th.querySelector('#kareler');
  const glgth = Array(9);
  glgth[0] = null;  // 1 tabanlı
  for (let y=25, y_say=8; y_say>0; y+=54, --y_say) {
    glgth[y_say] = Array(9);
    glgth[y_say][0] = null;  // 1 tabanlı
    for (let x=25, x_say=1; x_say<9; x+=54, ++x_say) {
      const dd = celm(th, 'rect');  /* kareler */
      dd.x.baseVal.value = x;
      dd.y.baseVal.value = y;
      dd.width.baseVal.value = 52;
      dd.height.baseVal.value = 52;
      dd.dataset.x = x_say;
      dd.dataset.y = y_say;
      glgth[y_say][x_say] = Taş.yok;
      const at = celm(th, 'animate');
      at.setAttribute('attributeName', 'fill');
      at.setAttribute('from', 'olive');
      at.setAttribute('to', 'wheat');
      at.setAttribute('dur', '500ms');
      at.setAttribute('begin', 'indefinite');
      dd.appendChild(at);
      k.appendChild(dd);
    }
  }

  return glgth;
}

export
function oyun_yükle(th, glgth) {
  const ilk = {
    siyah: [                                     // x,y,dama/yoz
      [1,7,Taş.Yoz], [2,7,Taş.Yoz], [3,7,Taş.Yoz], [4,7,Taş.Yoz], [5,7,Taş.Yoz], [6,7,Taş.Yoz], [7,7,Taş.Yoz], [8,7,Taş.Yoz],
      [1,6,Taş.Yoz], [2,6,Taş.Yoz], [3,6,Taş.Yoz], [4,6,Taş.Yoz], [5,6,Taş.Yoz], [6,6,Taş.Yoz], [7,6,Taş.Yoz], [8,6,Taş.Yoz]
    ],
    beyaz: [
      [1,3,Taş.Yoz], [2,3,Taş.Yoz], [3,3,Taş.Yoz], [4,3,Taş.Yoz], [5,3,Taş.Yoz], [6,3,Taş.Yoz], [7,3,Taş.Yoz], [8,3,Taş.Yoz],
      [1,2,Taş.Yoz], [2,2,Taş.Yoz], [3,2,Taş.Yoz], [4,2,Taş.Yoz], [5,2,Taş.Yoz], [6,2,Taş.Yoz], [7,2,Taş.Yoz], [8,2,Taş.Yoz]
    ],
    sıra: "N/A",
    beyaz_sayaç: 0,
    siyah_sayaç: 0,
    makina: {
      aktif: 1,
      yön: Yön.yok
    }
  }
  const durum = JSON.parse(localStorage.getItem('damalper')) ?? ilk;
  const siyahlar = taşları_diz(durum.siyah, Taş.Syh, th.querySelector('#siyahlar'));
  const beyazlar = taşları_diz(durum.beyaz, Taş.Byz, th.querySelector('#beyazlar'));
  return [durum.sıra, durum.beyaz_sayaç, durum.siyah_sayaç, beyazlar, siyahlar, durum.makina];

  function taşları_diz(taşlar, renk, g) {
    const x_off = 54, y_off = 54, baş_x = 51, baş_y = 51, tga = new Map();
    let cc, at;
    for (const t of taşlar) {
      cc = celm(th, 'circle');
      cc.cx.baseVal.value = baş_x + (+t[0]-1)*x_off;
      cc.cy.baseVal.value = baş_y + (8-(+t[1]))*y_off;
      cc.r.baseVal.value = 21;
      cc.dataset.x = t[0];
      cc.dataset.y = t[1];
      glgth[+t[1]][+t[0]] = renk;
      cc.dataset.taş = t[2];
      tga.set(`${t[1]}${t[0]}`, +t[2]);
      at = celm(th, 'animate');
      at.setAttribute('dur', '250ms');
      at.setAttribute('fill', 'freeze');
      at.setAttribute('begin', 'indefinite');
      cc.appendChild(at);
      if (+t[2] == Taş.Dama) dama_çiz(cc, renk);
      g.appendChild(cc);
    }
    return tga;
  }

} /* oyun_yükle */

export
function dama_çiz(c, renk) {
  if (renk == Taş.Byz) {
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
function oyun_kaydet(th, s, beyaz_sayaç, siyah_sayaç, makina) {
  const durum = {
    siyah: [ ],
    beyaz: [ ],
    sıra: "",
    beyaz_sayaç: 0,
    siyah_sayaç: 0,
    makina: { 
      aktif: 0,
      yön: Yön.yok
    }
  };
  if (arguments.length == 1) {
    const kyt = JSON.parse(localStorage.getItem('damalper'));
    if (kyt) {
      kyt.makina.aktif = arguments[0];
      localStorage.setItem('damalper', JSON.stringify(kyt));
    }
    return;
  }
  for (let t of th.querySelector('#siyahlar').children)
    durum.siyah.push([t.dataset.x, t.dataset.y, t.dataset.taş]);
  for (let t of th.querySelector('#beyazlar').children)
    durum.beyaz.push([t.dataset.x, t.dataset.y, t.dataset.taş]);
  durum.sıra = s;
  durum.beyaz_sayaç = beyaz_sayaç;
  durum.siyah_sayaç = siyah_sayaç;
  durum.makina.aktif = makina.aktif;
  durum.makina.yön = makina.yön;
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
