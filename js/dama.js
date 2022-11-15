export { tahta_çevir, çerçeve_gör } from './gorsel.js';
import { Taş, oyun_yükle, tahta_çiz, oyun_kaydet, dama_çiz } from './gorsel.js';

const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Yağı = {[Yön.Beyaz]: Taş.Syh, [Yön.Siyah]: Taş.Byz};

const makiwrk = new Worker('./js/makina.js');
let th, marker, alt_marker, glgth, sayaçlar, evnt;
let from, sıra, seçim_sabit=false, taş_seçili=false, al=false, alan=[], seçili_alım, seçili_alan,
      beyazlar, siyahlar;

export let makina;

export
function oyuncu_değiştir() {
  if (makina.aktif) {
    makina.aktif = 0;
    if (makina.renk != 'yok')
      makiwrk.postMessage({msg: 'dur'});
  }
  else {
    makina.aktif = 1;
    if ((makina.renk == 'byz' && sıra == 'beyazda') || (makina.renk == 'syh' && sıra == 'siyahta'))
      makiwrk.postMessage({msg: 'oyna', seçili_alan, alan});
  }

  oyun_kaydet(makina.aktif);
  // alım_denetimi();
}

export
function oyna(pth, byz_sayaç, syh_sayaç, pevt) {
  th = pth;
  evnt = pevt;
  marker = th.querySelector('#marker');
  alt_marker = [th.querySelector('#alan1'), th.querySelector('#alan2'), th.querySelector('#alan3')];
  sayaçlar = {[Yön.Beyaz]: {sayaç: byz_sayaç, say: 0},
              [Yön.Siyah]: {sayaç: syh_sayaç, say: 0}};

  glgth = tahta_çiz(th);
  th.querySelector('#kareler').addEventListener('click', kare_seç);
  th.querySelector('#siyahlar').addEventListener('click', siyah_seç);
  th.querySelector('#beyazlar').addEventListener('click', beyaz_seç);
  
  [sıra, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say, beyazlar, siyahlar, makina] = oyun_yükle(th, glgth);
  makiwrk.postMessage({msg: "oyun-yükle", glgth, beyazlar, siyahlar, makina});

  if (sıra == 'beyazda')
    th.querySelector('line#beyaz').setAttribute('visibility', 'visible');
  if (sıra == 'siyahta')
    th.querySelector('line#siyah').setAttribute('visibility', 'visible');

  // sıra == 'N/A' ise ikisi de hidden kalsın

  if (sayaçlar[Yön.Beyaz].say)
    sayaçlar[Yön.Beyaz].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: sayaçlar[Yön.Beyaz].say}));
  if (sayaçlar[Yön.Siyah].say)
    sayaçlar[Yön.Siyah].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: sayaçlar[Yön.Siyah].say}));

  // sayaç 0 ise tabelası boş kalsın

  alım_denetimi();
  makiwrk.addEventListener('message', mesaj_işle);

  return function yeni_oyun() {
    localStorage.removeItem('damalper');
    marker_unset();
    switch (alan.length) {
      case 3: alt_marker_unset(2);  // bilerek fall-through
      case 2: alt_marker_unset(1);
      case 1: alt_marker_unset(0);
      default: alan.length = 0;
    }
    th.querySelector('line#siyah').setAttribute('visibility', 'hidden');
    th.querySelector('line#beyaz').setAttribute('visibility', 'hidden');
    seçim_sabit = al = false;
    th.querySelector('#siyahlar').replaceChildren();
    th.querySelector('#beyazlar').replaceChildren();
    for (let y=8; y>0; --y)
      for (let x=1; x<9; ++x)
        glgth[y][x] = Taş.yok;
    sayaçlar[Yön.Beyaz].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: ""}));
    sayaçlar[Yön.Siyah].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: ""}));
    [sıra, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say, beyazlar, siyahlar, makina] = oyun_yükle(th, glgth);
    makiwrk.postMessage({msg: "oyun-yükle", glgth, beyazlar, siyahlar, makina});
  };
}

function mesaj_işle(e) {
  switch (e.data.msg) {
    case 'devindir':
      sıra == 'beyazda' ? setTimeout(devinim, 500, e.data.to, Yön.Beyaz, Taş.Byz, '8')
                        : setTimeout(devinim, 500, e.data.to, Yön.Siyah, Taş.Syh, '1');
      break;
    default:
      console.log('ana modül: bilinmeyen mesaj geldi.');
  }
}

function alım_denetimi() {
  seçili_alan = null;
  if (al=alır_mı(...(sıra=='siyahta' ? ['#siyahlar', Yön.Siyah] : ['#beyazlar', Yön.Beyaz]))) {
    seçili_alan = alan.pop();
    marker_set(from=th.querySelector(`circle[data-x="${seçili_alan.x}"][data-y="${seçili_alan.y}"]`));
    seçili_alım = seçili_alan.alım;
    switch (alan.length) {
      // aşağıda break unutulmuş değil, bilerek fall-through
      case 3: alt_marker_set(2);
      case 2: alt_marker_set(1);
      case 1: alt_marker_set(0);
        break;
      default:
        seçim_sabit = true;
    }
  }
  if (makina.aktif && ((makina.renk == 'byz' && sıra == 'beyazda') || (makina.renk == 'syh' && sıra == 'siyahta')))
    makiwrk.postMessage({msg: 'oyna', seçili_alan, alan});
}

function siyah_seç(e) {
  if (sıra == 'beyazda') return;
  if (makina.aktif && makina.renk == 'syh') return;
  if (seçim_sabit) {
    alım_göster();
    return;
  }
  if (sıra == 'N/A') { 
    sıra = 'siyahta';
    makina.renk = 'byz';
    makiwrk.postMessage({msg: 'seç-byz'});
  }
  alan_seç(e);
}

function beyaz_seç(e) {
  if (sıra == 'siyahta') return;
  if (makina.aktif && makina.renk == 'byz') return;
  if (seçim_sabit) {
    alım_göster();
    return;
  }
  if (sıra == 'N/A') {
    sıra = 'beyazda';
    makina.renk = 'syh';
    makiwrk.postMessage({msg: 'seç-syh'});
  }
  alan_seç(e);
}

function alan_seç(e) {
  if (alan.length) {
    if (e.target.dataset.x == from.dataset.x && e.target.dataset.y == from.dataset.y) {
      alım_göster();
      return;
    }
    for (let i=0; i < alan.length; ++i)
      if (e.target.dataset.x == alan[i].x && e.target.dataset.y == alan[i].y) {
        const tmp_alım = alan[i].alım;
        alt_marker_unset(i);
        alan[i].x = from.dataset.x; alan[i].y = from.dataset.y; alan[i].alım = seçili_alım;
        marker_set(from=e.target);
        alt_marker_set(i);
        seçili_alım = tmp_alım;
      }
  }
  else
    marker_set(from=e.target);
}

function marker_set(m) {
  marker.setAttribute('transform', `translate(${(m.dataset.x-1)*54},${(8-m.dataset.y)*54})`);
  marker.setAttribute('visibility','visible');
  marker.children[0].beginElement();
  taş_seçili = true;
}
function marker_unset() {
  marker.setAttribute('visibility', 'hidden');
  taş_seçili = false;
}

function alt_marker_set(i) {
  alt_marker[i].setAttribute('transform', `translate(${(alan[i].x-1)*54},${(8-alan[i].y)*54})`);
  alt_marker[i].setAttribute('visibility', 'visible');
}
function alt_marker_unset(i) {
  alt_marker[i].setAttribute('visibility', 'hidden');
}

function alım_göster() {
  for (let i=0; i<seçili_alım.length; ++i)
    th.querySelector(`rect[data-x="${seçili_alım[i].alan_yeni_x}"][data-y="${seçili_alım[i].alan_yeni_y}"]`)
      .children[0].beginElement();
}

function kare_seç(e) {
  if ((sıra == 'siyahta' && makina.aktif && makina.renk == 'syh') || 
      (sıra == 'beyazda' && makina.aktif && makina.renk == 'byz'))  
    return;
  if (!taş_seçili) return;
  if (glgth[+e.target.dataset.y][+e.target.dataset.x] != Taş.yok)  // boş karede zaten taş 'yok'tur fakat bir şekilde
    return;                                                        // taş olan kareye tıklamayı becermişse oyuncu... 

  const to = { x: +e.target.dataset.x, y: +e.target.dataset.y };

  sıra == 'beyazda' ? devinim(to, Yön.Beyaz, Taş.Byz, '8') : devinim(to, Yön.Siyah, Taş.Syh, '1');
}

function devinim(to, yön, renk, dama_satırı) {
  const [devindi, taş_aldı, dama_yön] = taş_devindir(from, to, yön);
  if (!devindi)  return;
  switch (alan.length) {
    case 3: alt_marker_unset(2);  // bilerek fall-through
    case 2: alt_marker_unset(1);
    case 1: alt_marker_unset(0);
    default: alan.length = 0;
  }
  if (taş_aldı) {
    ++sayaçlar[yön].say;
    sayaçlar[yön].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: sayaçlar[yön].say}));
    // daha alır mı?
    [al, seçili_alım] = from.dataset.dama == '1' ? alım_olası_dama(+from.dataset.x, +from.dataset.y, yön, dama_yön)
                                                  : alım_olası(+from.dataset.x, +from.dataset.y, yön);
    if (al) {
      marker_set(from);
      seçim_sabit = true;
      if (makina.aktif && ((makina.renk == 'byz' && sıra == 'beyazda') || (makina.renk == 'syh' && sıra == 'siyahta')))
        makiwrk.postMessage({msg: 'oyna', seçili_alan: {x: +from.dataset.x, y: +from.dataset.y, alım: seçili_alım}, alan});
      return;
    }
  }
  if (from.dataset.dama == '0' && from.dataset.y == dama_satırı) {
    from.dataset.dama = '1';
    dama_çiz(from, renk);
    makiwrk.postMessage({msg: 'dama-oldu', x: +from.dataset.x, y: +from.dataset.y, renk});
  }

  seçim_sabit = false;
  sıra = (yön == Yön.Beyaz ? 'siyahta' : 'beyazda');
  marker_unset();
  th.querySelector(`line#${Yağı[yön] == Taş.Syh ? 'siyah' : 'beyaz'}`).setAttribute('visibility', 'visible');
  th.querySelector(`line#${renk == Taş.Byz ? 'beyaz' : 'siyah'}`).setAttribute('visibility', 'hidden');
  oyun_kaydet(th, sıra, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say, makina);
  alım_denetimi();
}

function alır_mı(g, yön) {
  let say=0, alım, rv;
  alan.length = 0;
  for (const t of th.querySelector(g).children) {
    [rv, alım] = (t.dataset.dama == '1' ? alım_olası_dama(+t.dataset.x, +t.dataset.y, yön, Yön.yok)
                                        : alım_olası(+t.dataset.x, +t.dataset.y, yön));
    if (rv)
      if (rv > say) {
        alan.length = 0;
        say = rv;
        alan.push({x: t.dataset.x, y: t.dataset.y, alım});
      }
      else if (rv == say)
        alan.push({x: t.dataset.x, y: t.dataset.y, alım});
  }
  return alan.length > 0;
}

function alım_olası(x, y, yön) {
  let say=0, rv, alım=[];
  for (const [ax,ay,kx,ky] of [[x-1,y,x-2,y], [x+1,y,x+2,y], [x,y+yön,x,y+2*yön]])
    if (glgth[ky]?.[kx] == Taş.yok && glgth[ay]?.[ax] == Yağı[yön]) {
      glgth[ay][ax] = Taş.yok;  // taşı almış gibi yap
      // özyinelemeli çağrılarda alım konum bilgileri gerekli değil, yalnızca alım sayısı
      [rv] = alım_olası(kx, ky, yön);
      if (rv+1 > say) {
        say = rv+1;
        alım.length = 0;
        alım.push({alınan_x: ax, alınan_y: ay, alan_yeni_x: kx, alan_yeni_y: ky});
      }
      else if (rv+1 == say) alım.push({alınan_x: ax, alınan_y: ay, alan_yeni_x: kx, alan_yeni_y: ky});
      glgth[ay][ax] = Yağı[yön];  // almış gibi yaptığın taşı geri yerine koy
    }
  return [say, alım];
}

function alım_olası_dama(x, y, yön, dama_yön) {
  // dama_yön: damanın, son taşı alırken hangi yönde atılım yaptığı. Bu yönün
  //           tam tersinde taş almaya devam edemez. Yeni atılımda bu yön yoktur,
  //           Yön.yok değeri geçilir ve ters_yön[dama_yön] == d koşulu daima false olur.
  const rx=[-1,0,1,0], ry=[0,1,0,-1], ters_yön=[Yön.D, Yön.G, Yön.B, Yön.K],
        bu_taş = (yön == Yön.Beyaz ? Taş.Byz : Taş.Syh);
  let kare, say=0, rv, alım=[];
  for (let d=Yön.B; d<=Yön.G; ++d) {
    if (ters_yön[dama_yön] == d) continue;
    for (let i=1, buldu=false; kare=glgth[y+ry[d]*i]?.[x+rx[d]*i]; ++i)
      if (kare == Yağı[yön])
        if (buldu) break; /* yanyana iki yağı taş */
        else buldu = true;
      else if (kare == Taş.yok)
        if (buldu) {
          glgth[y][x] = glgth[y+ry[d]*(i-1)][x+rx[d]*(i-1)] = Taş.yok;
          for (let j=i; glgth[y+ry[d]*j]?.[x+rx[d]*j] == Taş.yok; ++j) {
            glgth[y+ry[d]*j][x+rx[d]*j] = bu_taş;
            [rv] = alım_olası_dama(x+rx[d]*j, y+ry[d]*j, yön, d);
            if (rv+1 > say) {
              say = rv+1;
              alım.length = 0;
              alım.push({alınan_x:    x+rx[d]*(i-1), alınan_y:    y+ry[d]*(i-1),
                          alan_yeni_x: x+rx[d]*j,     alan_yeni_y: y+ry[d]*j,  dama_yön: d});
            }
            else if (rv+1 == say)
              alım.push({alınan_x:    x+rx[d]*(i-1), alınan_y:    y+ry[d]*(i-1),
                          alan_yeni_x: x+rx[d]*j,     alan_yeni_y: y+ry[d]*j,  dama_yön: d});

            glgth[y+ry[d]*j][x+rx[d]*j] = Taş.yok;
          }
          glgth[y+ry[d]*(i-1)][x+rx[d]*(i-1)] = Yağı[yön];
          glgth[y][x] = bu_taş;
          break;
        }
        else continue;
      else break; /* kendiyle aynı renk taş */
  }
  return [say, alım];
}

function taş_devindir(from, to, yön) {
  // devinirse [true, false,]
  // yağı taşı alarak devinirse [true, true,]
  // dama taş, yağı taşı alarak devinirse [true, true, Yön]
  // devinemezse [false,,]
  // döndürür.
  // yan etki: devinirse from.dataset'i değiştirir.
  let x=+from.dataset.x, y=+from.dataset.y, dama=+from.dataset.dama;
  if (!dama) // yoz taş
    if (!al && (
        (y == to.y && (to.x == x-1 || to.x == x+1)) ||
        (x == to.x && to.y == y+yön))) {
      devin();
      return [true,false,];
    }
    else
      return taş_al();

  /* dama taş */
  if (!al && (
      (y == to.y && arası_kaç_yağı_yatay() === 0) ||
      (x == to.x && arası_kaç_yağı_düşey() === 0))) {
    devin();
    return [true,false,];
  }
  else
    return taş_al();

  function taş_al() {
    for (let i=0; i<seçili_alım.length; ++i)
      if (to.y == seçili_alım[i].alan_yeni_y && to.x == seçili_alım[i].alan_yeni_x) {
        glgth[seçili_alım[i].alınan_y][seçili_alım[i].alınan_x] = Taş.yok;
        th.querySelector(`circle[data-x="${seçili_alım[i].alınan_x}"][data-y="${seçili_alım[i].alınan_y}"]`).remove();
        makiwrk.postMessage({msg: 'taş-al', x: seçili_alım[i].alınan_x, y: seçili_alım[i].alınan_y, yön});
        devin();
        return [true,true,seçili_alım[i].dama_yön];
      }
    alım_göster();
    return [false,,];  // bu devinim olası değil.
  }

  function arası_kaç_yağı_yatay() {
    // x ile to.x arası
    //   boş ise 0
    //   bir yağı taş varsa onun x değerini,
    //   birden çok yağı veya kendiyle aynı renk taş varsa -1
    // döndürür.
    let baş, son, say=0, yağı_x;
    if (to.x > x) {
      baş = x+1; son = to.x;
    }
    else {
      baş = to.x+1; son = x;
    }
    for (let i=baş; i<son; ++i) {
      if (glgth[y][i] == Taş.yok) continue;
      else if (glgth[y][i] == Yağı[yön] && ++say == 1) yağı_x = i;
      else return -1;
    }

    return say == 1 ? yağı_x : say;
  }

  function arası_kaç_yağı_düşey() {
    // y ile to.y arası
    //   boş ise 0
    //   bir yağı taş varsa onun y değerini,
    //   birden çok yağı veya kendiyle aynı renk taş varsa -1
    // döndürür.
    let baş, son, say=0, yağı_y;
    if (to.y > y) {
      baş = y+1; son = to.y;
    }
    else {
      baş = to.y+1; son = y;
    }
    for (let i=baş; i<son; ++i) {
      if (glgth[i][x] == Taş.yok) continue;
      else if (glgth[i][x] == Yağı[yön] && ++say == 1) yağı_y = i;
      else return -1;
    }

    return say == 1 ? yağı_y : say;
  }

  function devin() {
    if (y == to.y) {   // yatay devinim
      from.children[0].setAttribute('attributeName', 'cx');
      from.children[0].setAttribute('from', `${from.cx.baseVal.value}`);
      from.children[0].setAttribute('to', `${(to.x-x)*54 + from.cx.baseVal.value}`);
      glgth[y][to.x] = glgth[y][x];
      glgth[y][x] = Taş.yok;
      from.dataset.x = to.x;
      from.setAttribute('cx', `${(to.x-x)*54 + from.cx.baseVal.value}`);
    }
    else {   // düşey devinim
      from.children[0].setAttribute('attributeName', 'cy');
      from.children[0].setAttribute('from', `${from.cy.baseVal.value}`);
      from.children[0].setAttribute('to', `${(y-to.y)*54 + from.cy.baseVal.value}`);
      glgth[to.y][x] = glgth[y][x];
      glgth[y][x] = Taş.yok;
      from.dataset.y = to.y;
      from.setAttribute('cy', `${(y-to.y)*54 + from.cy.baseVal.value}`);
    }
    from.children[0].beginElement();
    makiwrk.postMessage({msg: 'devindir', x, y, to, yön});
  }

} /* taş_devindir */
