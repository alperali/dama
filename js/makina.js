const Taş = { yok: 9, Syh: 13, Byz: 17, Yoz: 0, Dama: 1 };
const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Karşı = {[Yön.Beyaz]: Yön.Siyah, [Yön.Siyah]: Yön.Beyaz};
const C = {
  [Yön.Beyaz]: {taş_renk: Taş.Byz, yağı: Taş.Syh},
  [Yön.Siyah]: {taş_renk: Taş.Syh, yağı: Taş.Byz}
 };
let glgth, yön, taşlar={}, al=false;

self.addEventListener('message', (e) => {
  switch (e.data.msg) {
    case 'oyun-yükle':
      glgth = e.data.glgth;
      taşlar[Yön.Beyaz] = e.data.beyazlar;
      taşlar[Yön.Siyah] = e.data.siyahlar;
      yön = e.data.makina.yön;
      break;
    case 'seç-byz':
      yön = Yön.Beyaz;
      break;
    case 'seç-syh':
      yön = Yön.Siyah;
      break;
    case 'dama-oldu':
      for (const k of taşlar[e.data.yön].keys())
        if (k.x == e.data.x && k.y == e.data.y) {
          taşlar[e.data.yön].set(k, Taş.Dama);
          break;
        }
      break;
    case 'devindir':
      glgth[e.data.to.y][e.data.to.x] = glgth[e.data.y][e.data.x];
      glgth[e.data.y][e.data.x] = Taş.yok;
      for (const k of taşlar[e.data.yön].keys())
        if (k.x == e.data.x && k.y == e.data.y) {
          k.x = e.data.to.x;
          k.y = e.data.to.y;
          break;
        }
      break;
    case 'taş-al':
      glgth[e.data.y][e.data.x] = Taş.yok;
      for (const k of taşlar[Karşı[e.data.yön]].keys())
        if (k.x == e.data.x && k.y == e.data.y) {
          taşlar[Karşı[e.data.yön]].delete(k);
          break;
        }
      break;
    case 'oyna':
        oyna();
      break;
    case 'dur':
      console.log('makina: devredışı.');
      break;
    default:
      console.log('makina: bilinmeyen mesaj geldi.');
  }
});

// alan = [ {x, y, alım}, {x, y, alım}, ... ];
// alım = [ {alınan_x, alınan_y, alan_yeni_x, alan_yeni_y, sonra}, ...]

function oyna() {
  let puan, p, ri, seçenekler=[];
  const [rv,alan] = alır_mı(taşlar[yön], yön);
  if (rv) {
    puan = +Infinity;
    for (const n of alan) {
      [p,ri] = ileri_al(n.k, n.alım, yön);
      if (p < puan) {
        puan = p;
        seçenekler.length = 0;
        seçenekler.push({from: {x: n.k.x, y: n.k.y}, to: {x: n.alım[ri].alan_yeni_x, y: n.alım[ri].alan_yeni_y}, alım: n.alım});
      }
      else if (p == puan)
        seçenekler.push({from: {x: n.k.x, y: n.k.y}, to: {x: n.alım[ri].alan_yeni_x, y: n.alım[ri].alan_yeni_y}, alım: n.alım});
    }
  }
  else {
    puan = -Infinity;
    for (const [k,val] of taşlar[yön]) {
      const to = val == Taş.Dama ? devin_bak_dama(k, yön) : devin_bak(k);
      if (to.puan > puan) {
        puan = to.puan;
        seçenekler.length = 0;
        seçenekler.push({from: {x: k.x, y: k.y}, to});
      }
      else if (to.puan != -Infinity  &&  to.puan == puan)
        seçenekler.push({from: {x: k.x, y: k.y}, to});
    }
  }

  let s;
  if (seçenekler.length > 1)
    s = Math.floor(Math.random() * seçenekler.length);
  else if (seçenekler.length == 1)
    s = 0;
  else if (seçenekler.length == 0) {
    console.log('makina: atılım mümkün değil.');
    return;
  }
  postMessage({msg: 'devindir', dn: seçenekler[s]});
}

function devin_bak(k) {
  let puan = -Infinity, to={puan}, sav={};
  for (const [mx,my] of [[k.x-1,k.y], [k.x,k.y+yön], [k.x+1,k.y]])
    if (glgth[my]?.[mx] == Taş.yok) {
      glgth[my][mx] = glgth[k.y][k.x];
      glgth[k.y][k.x] = Taş.yok;
      sav.x = k.x; sav.y = k.y;
      k.y = my; k.x = mx;
      const rv = ileri_bak(taşlar[Karşı[yön]], Karşı[yön]);
      if (rv > puan) {
        to.x = mx;
        to.y = my;
        to.puan = puan = rv;
      }
      else if (rv == puan  &&  Math.floor(Math.random()*2)) {
        // eşitlik durumunda ikisinden birini rasgele seç.
        to.x = mx;
        to.y = my;
      }
      k.x = sav.x; k.y = sav.y;
      glgth[k.y][k.x] = glgth[my][mx];
      glgth[my][mx] = Taş.yok;
    }
  if (puan != -Infinity)  to.puan = -to.puan;
  return to;  // devinim mümkün değilse to.puan -Infinity olarak döner.
}

function ileri_bak(taşlar, yön) {
  let puan = -Infinity;
  const [rv,alan] = alır_mı(taşlar, yön);
  if (rv) {
    for (const n of alan) {
      const [p] = ileri_al(n.k, n.alım, yön);
      puan = Math.max(p, puan);
    }
    return rv-puan;
  }
  else
    return rv; // hep sıfır aslında.. return 0;  da olur.
}

function ileri_al(k, alım, yön, dal=false) {
  let puan=-Infinity, sav={}, ri;
  for (let i=0; i<alım.length; ++i) {
    const m = alım[i];
    glgth[m.alan_yeni_y][m.alan_yeni_x] = glgth[k.y][k.x];
    glgth[m.alınan_y][m.alınan_x] = glgth[k.y][k.x] = Taş.yok;
    sav.x = k.x; sav.y = k.y;
    k.x = m.alan_yeni_x; k.y = m.alan_yeni_y;
    let alınank, alınanval;
    for (const [a,e] of taşlar[Karşı[yön]])
      if (a.x == m.alınan_x && a.y == m.alınan_y) {
        alınank = a;
        alınanval = e;
        break;
      }
    taşlar[Karşı[yön]].set(alınank, Taş.yok);
    if (m.sonra.length)
      [puan] = ileri_al(k, m.sonra, yön, true);
    else {
      dal = false;
      p = ileri_bak(taşlar[Karşı[yön]], Karşı[yön]);
    }
    if (!dal)
      if (p > puan) {
        puan = p;
        ri = i;
      }
      else if (p == puan  &&  Math.floor(Math.random()*2))
        ri = i;

    k.x = sav.x; k.y = sav.y;
    glgth[k.y][k.x] = glgth[m.alan_yeni_y][m.alan_yeni_x];
    glgth[m.alınan_y][m.alınan_x] = C[yön].yağı;
    glgth[m.alan_yeni_y][m.alan_yeni_x] = Taş.yok;
    taşlar[Karşı[yön]].set(alınank, alınanval);
  }
  return [puan, ri];
}

function alır_mı(taşlar, yön) {
  let alan=[], say=0, alım, rv;
  for (const [k,val] of taşlar) {
    if (val == Taş.Yoz)
      [rv, alım] = alım_olası(k.x, k.y, yön);
    else if (val == Taş.Dama)
      [rv, alım] = alım_olası_dama(k.x, k.y, yön, Yön.yok);
    else
      continue;   // val == Taş.yok ise bu taşı atla

    if (rv)
      if (rv > say) {
        alan.length = 0;
        say = rv;
        alan.push({k, alım});
      }
      else if (rv == say)
        alan.push({k, alım});
  }
  return [say, alan];
}

function alım_olası(x, y, yön) {
  let say=0, rv, alım=[], ralım=[];
  for (const [ax,ay,kx,ky] of [[x-1,y,x-2,y], [x+1,y,x+2,y], [x,y+yön,x,y+2*yön]])
    if (glgth[ky]?.[kx] == Taş.yok && glgth[ay]?.[ax] == C[yön].yağı) {
      glgth[ay][ax] = Taş.yok;  // taşı almış gibi yap
      [rv,ralım] = alım_olası(kx, ky, yön);
      if (rv+1 > say) {
        say = rv+1;
        alım.length = 0;
        alım.push({alınan_x: ax, alınan_y: ay, alan_yeni_x: kx, alan_yeni_y: ky, sonra: ralım});
      }
      else if (rv+1 == say) alım.push({alınan_x: ax, alınan_y: ay, alan_yeni_x: kx, alan_yeni_y: ky, sonra: ralım});
      glgth[ay][ax] = C[yön].yağı;  // almış gibi yaptığın taşı geri yerine koy
    }
  return [say, alım];
}

function alım_olası_dama(x, y, yön, dama_yön) {
  // dama_yön: damanın, son taşı alırken hangi yönde atılım yaptığı. Bu yönün
  //           tam tersinde taş almaya devam edemez. Yeni atılımda bu yön yoktur,
  //           Yön.yok değeri geçilir ve ters_yön[dama_yön] == d koşulu daima false olur.
  const rx=[-1,0,1,0], ry=[0,1,0,-1], ters_yön=[Yön.D, Yön.G, Yön.B, Yön.K];
  let kare, say=0, rv, alım=[], ralım=[];
  for (let d=Yön.B; d<=Yön.G; ++d) {
    if (ters_yön[dama_yön] == d) continue;
    for (let i=1, buldu=false; kare=glgth[y+ry[d]*i]?.[x+rx[d]*i]; ++i)
      if (kare == C[yön].yağı)
        if (buldu) break; /* yanyana iki yağı taş */
        else buldu = true;
      else if (kare == Taş.yok)
        if (buldu) {
          glgth[y][x] = glgth[y+ry[d]*(i-1)][x+rx[d]*(i-1)] = Taş.yok;
          for (let j=i; glgth[y+ry[d]*j]?.[x+rx[d]*j] == Taş.yok; ++j) {
            glgth[y+ry[d]*j][x+rx[d]*j] = C[yön].taş_renk;
            [rv,ralım] = alım_olası_dama(x+rx[d]*j, y+ry[d]*j, yön, d);
            if (rv+1 > say) {
              say = rv+1;
              alım.length = 0;
              alım.push({alınan_x:    x+rx[d]*(i-1), alınan_y:    y+ry[d]*(i-1),
                         alan_yeni_x: x+rx[d]*j,     alan_yeni_y: y+ry[d]*j,  dama_yön: d, sonra: ralım});
            }
            else if (rv+1 == say)
              alım.push({alınan_x:    x+rx[d]*(i-1), alınan_y:    y+ry[d]*(i-1),
                         alan_yeni_x: x+rx[d]*j,     alan_yeni_y: y+ry[d]*j,  dama_yön: d, sonra: ralım});

            glgth[y+ry[d]*j][x+rx[d]*j] = Taş.yok;
          }
          glgth[y+ry[d]*(i-1)][x+rx[d]*(i-1)] = C[yön].yağı;
          glgth[y][x] = C[yön].taş_renk;
          break;
        }
        else continue;
      else break; /* kendiyle aynı renk taş */
  }
  return [say, alım];
}
