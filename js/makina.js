const Taş = { yok: 9, Syh: 13, Byz: 17, Yoz: 0, Dama: 1 };
const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Yağı = {[Yön.Beyaz]: Taş.Syh, [Yön.Siyah]: Taş.Byz};
const Karşı = {[Yön.Beyaz]: Yön.Siyah, [Yön.Siyah]: Yön.Beyaz};
let glgth, yön, taşlar={};

self.addEventListener('message', (e) => {
  switch (e.data.msg) {
    case 'oyun-yükle':
      glgth = e.data.glgth;
      taşlar[Yön.Beyaz] = taşlar[Taş.Byz] = e.data.beyazlar;
      taşlar[Yön.Siyah] = taşlar[Taş.Syh] = e.data.siyahlar;
      yön = e.data.makina.yön;
      // aktif = e.data.makina.aktif;
      break;
    case 'seç-byz':
      yön = Yön.Beyaz;
      break;
    case 'seç-syh':
      yön = Yön.Siyah;
      break;
    case 'dama-oldu':
      taşlar[e.data.renk].set(`${e.data.y}${e.data.x}`, Taş.Dama);
      break;
    case 'devindir':
      glgth[e.data.to.y][e.data.to.x] = glgth[e.data.y][e.data.x];
      glgth[e.data.y][e.data.x] = Taş.yok;
      taşlar[e.data.yön].set(`${e.data.to.y}${e.data.to.x}`, taşlar[e.data.yön].get(`${e.data.y}${e.data.x}`))
                        .delete(`${e.data.y}${e.data.x}`);
      break;
    case 'taş-al':
      glgth[e.data.y][e.data.x] = Taş.yok;
      taşlar[e.data.yön].delete(`${e.data.y}${e.data.x}`);
      break;
    case 'oyna':
      // buraya e.data ile gelen alım nesnesinde 'sonra' bağlantısı yok...
      if (e.data.alan.length) {
        let puan = -Infinity, fav_alım;
        for (const t of [e.data.seçili_alan, ...[e.data.alan]]) {
          const [rp, rf] = alım_bak(t.x, t.y, t.alım);
          if (rp > puan) {
            puan = rp;
            fav_alım = rf;
          }
        }
        postMessage({msg: 'devindir', from: { x: t.x, y: t.y },
                     to: { x: fav_alım.alan_yeni_x, y: fav_alım.alan_yeni_y}});
      }
          // for (const cap of t.alım) {
          //   glgth[cap.alan_yeni_y][cap.alan_yeni_x] = glgth[t.y][t.x];
          //   glgth[cap.alınan_y][cap.alınan_x] = glgth[t.y][t.x] = Taş.yok;
          //   const rv = ileri_bak(taşlar[Karşı[yön]], Karşı[yön]) + 1;
          //   if (rv > puan) {
          //     puan = rv;
          //     fav = { x: t.x, y: t.y, alım: cap };
          //   }
          //   glgth[t.y][t.x] = glgth[cap.alan_yeni_y][cap.alan_yeni_x];
          //   glgth[cap.alan_yeni_y][cap.alan_yeni_x] = Taş.yok;
          //   glgth[cap.alınan_y][cap.alınan_x] = Yağı[yön];
          // }
        // seçili_alım = alım_seç(alan_seç(e.data.seçili_alan, e.data.alan).alım);
        // postMessage({msg: 'devindir', 
        //              to: { x: seçili_alım.alan_yeni_x, y: seçili_alım.alan_yeni_y}});
      else if (e.data.seçili_alan) {
        const [ , fav_alım] = alım_bak(e.data.seçili_alan.x, e.data.seçili_alan.y, e.data.seçili_alan.alım);
        postMessage({msg: 'devindir', from: { x: e.data.seçili_alan.x, y: e.data.seçili_alan.y },
                     to: { x: fav_alım.alan_yeni_x, y: fav_alım.alan_yeni_y}});
      }
      //   seçili_alım = alım_seç(e.data.seçili_alan.alım);
      //   postMessage({msg: 'devindir', 
      //                to: { x: seçili_alım.alan_yeni_x, y: seçili_alım.alan_yeni_y}});
      // }
      else
        oyna();
      break;
    case 'dur':
      // aktif = 0;
      console.log('makina: devredışı.');
      break;
    default:
      console.log('makina: bilinmeyen mesaj geldi.');
  }
});

function alım_bak(x, y, alım) {
  let puan = -Infinity, fav = null;
  for (const cap of alım) {
    glgth[cap.alan_yeni_y][cap.alan_yeni_x] = glgth[y][x];
    const sav = glgth[cap.alınan_y][cap.alınan_x];
    glgth[cap.alınan_y][cap.alınan_x] = glgth[y][x] = Taş.yok;
    const rv = ileri_bak(taşlar[Karşı[yön]], Karşı[yön]);
    if (rv > puan) {
      puan = rv;
      fav = { x: t.x, y: t.y, alım: cap };
    }
    glgth[y][x] = glgth[cap.alan_yeni_y][cap.alan_yeni_x];
    glgth[cap.alan_yeni_y][cap.alan_yeni_x] = Taş.yok;
    glgth[cap.alınan_y][cap.alınan_x] = sav;
  }
  return [puan, fav];
}

// alan = [ {x, y, alım}, {x, y, alım}, ... ];
// alım = [ {alınan_x, alınan_y, alan_yeni_x, alan_yeni_y, sonra}, ...]


function oyna() {
  let puan = -Infinity, seçenekler=[];
  for (const [t,val] of taşlar[yön]) {
    const to = val == Taş.Dama ? devin_bak_dama(+t[1], +t[0], yön) : devin_bak(+t[1], +t[0]);
    if (to.puan > puan) {
      puan = to.puan;
      seçenekler.length = 0;
      seçenekler.push(to);
    }
    else if (to.puan != -Infinity  &&  to.puan == puan)
      seçenekler.push(to);
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
  postMessage({msg: 'devindir',
                to: { x: seçenekler[s].x, y: seçenekler[s].y }});
}

function devin_bak(x, y) {
  let puan = -Infinity, to={puan};
  for (const [mx,my] of [[x-1,y], [x,y+yön], [x+1,y]])
    if (glgth[my]?.[mx] == Taş.yok) {
      glgth[my][mx] = glgth[y][x];
      glgth[y][x] = Taş.yok;
      taşlar[yön].set(`${my}${mx}`, taşlar[yön].get(`${y}${x}`))
                 .delete(`${y}${x}`);
      const rv = ileri_bak(taşlar[Karşı[yön]], Karşı[yön]);
      if (rv > puan) {
        to.x = mx;
        to.y = my;
        to.puan = puan = rv;
      }
      glgth[y][x] = glgth[my][mx];
      glgth[my][mx] = Taş.yok;
      taşlar[yön].set(`${y}${x}`, taşlar[yön].get(`${my}${mx}`))
                 .delete(`${my}${mx}`);
    }
  return to;  // devinim mümkün değilse to.puan -Infinity olarak döner.
}

function ileri_bak(taşlar, yön) {
  const [rv,alan] = alır_mı(taşlar, yön);
  if (rv) {
    let puan = -Infinity;
    for (const n of alan)
      puan = Math.max(ileri_al(n.x, n.y, n.alım, yön), puan);
    return puan-rv;
  }
  else
    return rv; // hep sıfır aslında.. return 0;  da olur.
}

function ileri_al(x, y, alım, yön) {
  let puan=0, sav;
  for (const m of alım) {
    glgth[m.alan_yeni_y][m.alan_yeni_x] = glgth[y][x];
    glgth[m.alınan_y][m.alınan_x] = glgth[y][x] = Taş.yok;
    taşlar[yön].set(`${m.alan_yeni_y}${m.alan_yeni_x}`, taşlar[yön].get(`${y}${x}`))
               .delete(`${y}${x}`);
    sav = taşlar[Karşı[yön]].get(`${m.alınan_y}${m.alınan_x}`);
    taşlar[Karşı[yön]].delete(`${m.alınan_y}${m.alınan_x}`);
    if (m.sonra.length)
      ileri_al(m.alan_yeni_x, m.alan_yeni_y, m.sonra, yön);
    else
      puan = Math.max(ileri_bak(taşlar[Karşı[yön]], Karşı[yön]), puan);
    glgth[y][x] = glgth[m.alan_yeni_y][m.alan_yeni_x];
    glgth[m.alınan_y][m.alınan_x] = Yağı[yön];
    glgth[m.alan_yeni_y][m.alan_yeni_x] = Taş.yok;
    taşlar[yön].set(`${y}${x}`, taşlar[yön].get(`${m.alan_yeni_y}${m.alan_yeni_x}`))
              .delete(`${m.alan_yeni_y}${m.alan_yeni_x}`);
    taşlar[Karşı[yön]].set(`${m.alınan_y}${m.alınan_x}`, sav);
  }
  return puan;
}

function alır_mı(taşlar, yön) {
  let alan=[], say=0, alım, rv;
  for (const [t,val] of taşlar) {
    [rv, alım] = (val == Taş.Dama ? alım_olası_dama(+t[1], +t[0], yön, Yön.yok)
                         : alım_olası(+t[1], +t[0], yön));
    if (rv)
      if (rv > say) {
        alan.length = 0;
        say = rv;
        alan.push({x: +t[1], y: +t[0], alım});
      }
      else if (rv == say)
        alan.push({x: +t[1], y: +t[0], alım});
  }
  return [say, alan];
}

function alım_olası(x, y, yön) {
  let say=0, rv, alım=[], ralım=[];
  for (const [ax,ay,kx,ky] of [[x-1,y,x-2,y], [x+1,y,x+2,y], [x,y+yön,x,y+2*yön]])
    if (glgth[ky]?.[kx] == Taş.yok && glgth[ay]?.[ax] == Yağı[yön]) {
      glgth[ay][ax] = Taş.yok;  // taşı almış gibi yap
      [rv,ralım] = alım_olası(kx, ky, yön);
      if (rv+1 > say) {
        say = rv+1;
        alım.length = 0;
        alım.push({alınan_x: ax, alınan_y: ay, alan_yeni_x: kx, alan_yeni_y: ky, sonra: ralım});
      }
      else if (rv+1 == say) alım.push({alınan_x: ax, alınan_y: ay, alan_yeni_x: kx, alan_yeni_y: ky, sonra: ralım});
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
