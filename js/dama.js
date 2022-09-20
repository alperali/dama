const celm = (th,e) => th.createElementNS('http://www.w3.org/2000/svg', e);

export 
function tahta_çiz(th) {

  (function çerçeve_çiz() {
    let tt, x_off = 54, x1 = 47, x2 = 57,
            y_off = 54, y1 = 436, y2 = 426;

    for (let c of "abcdefgh") {
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

    for (let c of "12345678") {
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
      dd.dataset.taş = "yok";
      th.querySelectorAll('g')[1].appendChild(dd);
    }
  for (let y=105, y_say=0, yery='76'; y_say<2; y+=54, ++y_say)
    for (let x=51, x_say=0; x_say<8; x+=54, ++x_say) {
      const cc = celm(th, 'circle'); /* siyahlar */
      cc.cx.baseVal.value = x;
      cc.cy.baseVal.value = y;
      cc.r.baseVal.value = 21;
      cc.dataset.x = x_say+1;
      cc.dataset.y = yery[y_say];
      th.querySelector(`g g rect[data-x="${cc.dataset.x}"][data-y="${cc.dataset.y}"`).dataset.taş ="siyah";
      cc.dataset.dama = 0;
      const at = celm(th, 'animate');
      at.setAttribute('dur', '250ms');
      at.setAttribute('fill', 'freeze');
      at.setAttribute('begin', 'indefinite');
      cc.appendChild(at);
      th.querySelectorAll('g')[2].appendChild(cc);
    }
  for (let y=321, y_say=0, yery="32"; y_say<2; y+=54, ++y_say)
    for (let x=51, x_say=0; x_say<8; x+=54, ++x_say){
      const cc = celm(th, 'circle'); /* beyazlar */
      cc.cx.baseVal.value = x;
      cc.cy.baseVal.value = y;
      cc.r.baseVal.value = 21;
      cc.dataset.x = x_say+1;
      cc.dataset.y = yery[y_say];
      th.querySelector(`g g rect[data-x="${cc.dataset.x}"][data-y="${cc.dataset.y}"`).dataset.taş ="beyaz";
      cc.dataset.dama = 0;
      const at = celm(th, 'animate');
      at.setAttribute('dur', '250ms');
      at.setAttribute('fill', 'freeze');
      at.setAttribute('begin', 'indefinite');
      cc.appendChild(at);
      th.querySelectorAll('g')[3].appendChild(cc);
    }
}

export
function oynat(th) {
  let sıra_siyahta=true, sıra_beyazda=true;
  let marker = th.querySelector('path');
  th.querySelectorAll('g')[1].addEventListener('click', kare_seç);
  th.querySelectorAll('g')[2].addEventListener('click', siyah_oynat);
  th.querySelectorAll('g')[3].addEventListener('click', beyaz_oynat);
  let from, seçim_sabit=false, seçili=false;

  function siyah_oynat(e) {
    if (!sıra_siyahta) return;
    if (seçim_sabit)   return;
    sıra_beyazda = false;  // oyun başında gerekli sadece
    marker_set(from=e.target);
  }

  function beyaz_oynat(e) {
    if (!sıra_beyazda) return;
    if (seçim_sabit)   return;
    sıra_siyahta = false;  // oyun başında gerekli sadece
    marker_set(from=e.target);
  }

  function marker_set(m) {
    marker.setAttribute('transform', `translate(${(m.dataset.x-1)*54},${(8-m.dataset.y)*54})`);
    marker.setAttribute('visibility','visible');
    marker.children[0].beginElement();
    seçili = true;
  }

  function kare_seç(e) {
    if (!seçili) return;
    if (e.target.dataset.taş !== 'yok')  // boş karede zaten taş 'yok'tur fakat bir şekilde
      return;                            // taş olan kareye tıklamayı becermişse oyuncu... 
    
    let seçilen_taşın_karesi = th.querySelector(`g g rect[data-x="${from.dataset.x}"][data-y="${from.dataset.y}"]`);
    if (sıra_beyazda) {
      const [devindi, taş_aldı] = beyaz_devin(+e.target.dataset.x, +e.target.dataset.y);
      if (devindi) {
        e.target.dataset.taş = 'beyaz';
        seçilen_taşın_karesi.dataset.taş = 'yok';
        if (taş_aldı && daha_alır_mı(1)) {
          marker_set(from);
          seçim_sabit = true;
        }
        else {
          sıra_beyazda = seçili = seçim_sabit = false;
          sıra_siyahta = true;
          marker.setAttribute('visibility','hidden');
          th.querySelector('line#siyah').setAttribute('visibility', 'visible');
          th.querySelector('line#beyaz').setAttribute('visibility', 'hidden');
          if (from.dataset.dama == '0' && from.dataset.y == '8') {
            from.dataset.dama = '1';
            from.setAttribute('stroke-dasharray','none');
            from.setAttribute('stroke-width', '2');
            from.setAttribute('fill', 'url(#beyazdama)');
          }
        }
      }
    }
    else {  /* sıra siyahta */
      const [devindi, taş_aldı] = siyah_devin(+e.target.dataset.x, +e.target.dataset.y);
      if (devindi) {
        e.target.dataset.taş = 'siyah';
        seçilen_taşın_karesi.dataset.taş = 'yok';
        if (taş_aldı && daha_alır_mı(-1)) {
          marker_set(from);
          seçim_sabit = true;
        }
        else {
          sıra_siyahta = seçili = seçim_sabit = false;
          sıra_beyazda = true;
          marker.setAttribute('visibility','hidden');
          th.querySelector('line#siyah').setAttribute('visibility', 'hidden');
          th.querySelector('line#beyaz').setAttribute('visibility', 'visible');
          if (from.dataset.dama == '0' && from.dataset.y == '1') {
            from.dataset.dama = '1';
            from.setAttribute('stroke-dasharray','none');
            from.setAttribute('stroke', 'dimgray');
            from.setAttribute('fill', 'url(#siyahdama)');
          }
        }
      }
    }

    function daha_alır_mı(yön) {
      const renk = (yön == 1 ? 'siyah' : 'beyaz');
      if (from.dataset.dama == '1')
        return daha_alır_mı_dama(renk);
      if (
        (th.querySelector(`g g rect[data-x="${+from.dataset.x-2}"][data-y="${+from.dataset.y}"]`)?.dataset.taş == 'yok' &&
         th.querySelector(`g g rect[data-x="${+from.dataset.x-1}"][data-y="${+from.dataset.y}"]`).dataset.taş == renk)  ||
        (th.querySelector(`g g rect[data-x="${+from.dataset.x+2}"][data-y="${+from.dataset.y}"]`)?.dataset.taş == 'yok' &&
         th.querySelector(`g g rect[data-x="${+from.dataset.x+1}"][data-y="${+from.dataset.y}"]`).dataset.taş == renk)  ||
        (th.querySelector(`g g rect[data-x="${+from.dataset.x}"][data-y="${+from.dataset.y+(2*yön)}"]`)?.dataset.taş == 'yok' &&
         th.querySelector(`g g rect[data-x="${+from.dataset.x}"][data-y="${+from.dataset.y+yön}"]`).dataset.taş == renk)
      )
        return true; 
      else
        return false;
    }

    function daha_alır_mı_dama(renk) {
      let t, x=[-1,0,1,0], y=[0,1,0,-1];
      for (let d=0; d<4; ++d)
        for (let i=1, buldu=false; t=th.querySelector(`g g rect[data-x="${+from.dataset.x + x[d]*i}"][data-y="${+from.dataset.y + y[d]*i}"]`); ++i)
          if (t.dataset.taş == renk)
            if (buldu) break; /* yanyana iki rakip taş */
            else buldu = true;
          else if (t.dataset.taş == 'yok')
            if (buldu) return true;
            else continue;
          else break; /* kendiyle aynı renk taş */

      return false;
    }

  } /* kare_seç */
  
  function beyaz_devin(to_x, to_y) {
    return taş_devindir(from, to_x, to_y, 1);
  }

  function siyah_devin(to_x, to_y) {
    return taş_devindir(from, to_x, to_y, -1);
  }

  function taş_devindir(from, to_x, to_y, yön) {
    // devinirse [true, false]
    // rakip taşı alarak devinirse [true, true]
    // devinemezse [false,] 
    // döndürür.
    let x=+from.dataset.x, y=+from.dataset.y, dama=+from.dataset.dama;
    if (!dama) // yoz taş
      if (y == to_y && (to_x == x-1 || to_x == x+1)) {
        yatay_devinim();
        return [true,false];
      }
      else if (x == to_x && to_y == y+yön) {
        düşey_devinim();
        return [true,false];
      }
      else  {   /* taş alma hamlesi */
        let renk = (yön == 1 ? 'siyah' : 'beyaz'), av;
        if (y == to_y && to_x == x-2 && 
            (av=th.querySelector(`g g rect[data-x="${x-1}"][data-y="${y}"]`)).dataset.taş === renk) {
            av.dataset.taş = 'yok';
            th.querySelector(`g g circle[data-x="${x-1}"][data-y="${y}"]`).remove();
            yatay_devinim();
            return [true,true];
        }
        else if (y == to_y && to_x == x+2 &&
            (av=th.querySelector(`g g rect[data-x="${x+1}"][data-y="${y}"]`)).dataset.taş === renk) {
            av.dataset.taş = 'yok';
            th.querySelector(`g g circle[data-x="${x+1}"][data-y="${y}"]`).remove();
            yatay_devinim();
            return [true,true];
        }
        else if (x == to_x && to_y == y+(2*yön) && 
            (av=th.querySelector(`g g rect[data-x="${x}"][data-y="${y+yön}"]`)).dataset.taş === renk) {
            av.dataset.taş = 'yok';
            th.querySelector(`g g circle[data-x="${x}"][data-y="${y+yön}"]`).remove();
            düşey_devinim();
            return [true,true];
        }
        else
          return [false,];  // bu devinim mümkün değil.
      }

    /* dama taş */
    if (y == to_y && arası_boş_mu_yatay(x, to_x, y)) {
      yatay_devinim();
      return [true,false];
    }
    else if (x == to_x && arası_boş_mu_düşey(y, to_y, x)) {
      düşey_devinim();
      return [true,false];
    }
    else { /* taş alma hamlesi */
      let av = {};
      av.renk = (yön == 1 ? 'siyah' : 'beyaz');
      av.x = x; av.y = y;
      if (y == to_y && arası_tek_av_mı_yatay(x, to_x, av)) {
        th.querySelector(`g g rect[data-x="${av.x}"][data-y="${y}"]`).dataset.taş = 'yok';
        th.querySelector(`g g circle[data-x="${av.x}"][data-y="${y}"]`).remove();
        yatay_devinim();
        return [true,true];
      }
      else if (x == to_x && arası_tek_av_mı_düşey(y, to_y, av)) {
        th.querySelector(`g g rect[data-x="${x}"][data-y="${av.y}"]`).dataset.taş = 'yok';
        th.querySelector(`g g circle[data-x="${x}"][data-y="${av.y}"]`).remove();
        düşey_devinim();
        return [true,true];
      }
      else
        return [false,];  // bu devinim mümkün değil.
    }

    function arası_boş_mu_yatay(x, to_x, y) {
      if (Math.abs(x - to_x) == 1)  return true;
      let baş, son;
      if (to_x > x) {
        baş = x+1; son = to_x;
      }
      else {
        baş = to_x+1; son = x;
      }
      for (let i=baş; i < son; ++i)
        if (th.querySelector(`g g rect[data-x="${i}"][data-y="${y}"]`).dataset.taş !== 'yok')
          return false;

      return true;
    }

    function arası_boş_mu_düşey(y, to_y, x) {
      if (Math.abs(y - to_y) == 1)  return true;
      let baş, son;
      if (to_y > y) {
        baş = y+1; son = to_y;
      }
      else {
        baş = to_y+1; son = y;
      }
      for (let i=baş; i < son; ++i)
        if (th.querySelector(`g g rect[data-x="${x}"][data-y="${i}"]`).dataset.taş !== 'yok')
          return false;

      return true;
    }

    function arası_tek_av_mı_yatay(x, to_x, av) {
      let baş, son, say=0, t;
      if (to_x > x) {
        baş = x+1; son = to_x;
      }
      else {
        baş = to_x+1; son = x;
      }
      for (let i=baş; i<son; ++i) {
        t = th.querySelector(`g g rect[data-x="${i}"][data-y="${av.y}"]`);
        if (t.dataset.taş == av.renk) { av.x=i; ++say; }
        else if (t.dataset.taş == 'yok') continue;
        else return false;  /* arada kendiyle aynı renk taş var */
      }
      
      if (say > 1)  return false;
      
      return true;
    }

    function arası_tek_av_mı_düşey(y, to_y, av) {
      let baş, son, say=0, t;
      if (to_y > y) {
        baş = y+1; son = to_y;
      }
      else {
        baş = to_y+1; son = y;
      }
      for (let i=baş; i<son; ++i) {
        t = th.querySelector(`g g rect[data-x="${av.x}"][data-y="${i}"]`);
        if (t.dataset.taş == av.renk) { av.y=i; ++say; }
        else if (t.dataset.taş == 'yok') continue;
        else return false;  /* arada kendiyle aynı renk taş var */
      }
      
      if (say > 1)  return false;
      
      return true;
    }

    function yatay_devinim() {
      from.children[0].setAttribute('attributeName', 'cx');
      from.children[0].setAttribute('from', `${from.cx.baseVal.value}`);
      from.children[0].setAttribute('to', `${(to_x-x)*54 + from.cx.baseVal.value}`);
      from.dataset.x = to_x;
      from.setAttribute('cx', `${(to_x-x)*54 + from.cx.baseVal.value}`);
      from.children[0].beginElement();
    }
    function düşey_devinim() {
      from.children[0].setAttribute('attributeName', 'cy');
      from.children[0].setAttribute('from', `${from.cy.baseVal.value}`);
      from.children[0].setAttribute('to', `${(y-to_y)*54 + from.cy.baseVal.value}`);
      from.dataset.y = to_y;
      from.setAttribute('cy', `${(y-to_y)*54 + from.cy.baseVal.value}`);
      from.children[0].beginElement();
    }

  } /* taş_devindir */

} /* oynat */

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
    return görünür;
  }
}
