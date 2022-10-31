export { tahta_çevir, çerçeve_gör } from './gorsel.js';
import { Taş, oyun_yükle, tahta_çiz, oyun_kaydet, dama_çiz } from './gorsel.js';

const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Yağı = {[Yön.Beyaz]: Taş.Syh, [Yön.Siyah]: Taş.Byz};

export
function oyna(th, byz_sayaç, syh_sayaç, evnt) {
  const marker = th.querySelector('#marker');
  const alt_marker = [th.querySelector('#alan1'), th.querySelector('#alan2'), th.querySelector('#alan3')];
  th.querySelector('#kareler').addEventListener('click', kare_seç);
  th.querySelector('#siyahlar').addEventListener('click', siyah_seç);
  th.querySelector('#beyazlar').addEventListener('click', beyaz_seç);
  let from, sıra, seçim_sabit=false, taş_seçili=false, al=false, alan=[], seçili_alım;
  const sayaçlar = {[Yön.Beyaz]: {sayaç: byz_sayaç, say: 0},
                    [Yön.Siyah]: {sayaç: syh_sayaç, say: 0}};

  const glgth = tahta_çiz(th);

  [sıra, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say] = oyun_yükle(th, glgth);
// console.log(glgth);
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

  // aşağıdaki blok kare_seç()'teki ile aynı
  if (al=alır_mı(...(sıra=='siyahta' ? ['#siyahlar', Yön.Siyah] : ['#beyazlar', Yön.Beyaz]))) {
    const seç = alan.pop();
    marker_set(from=th.querySelector(`g g circle[data-x="${seç.x}"][data-y="${seç.y}"]`));
    seçili_alım = seç.alım;
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
    sıra = 'N/A';
    seçim_sabit = al = false;
    th.querySelector('#siyahlar').replaceChildren();
    th.querySelector('#beyazlar').replaceChildren();
    for (let y=8; y>0; --y)
      for (let x=1; x<9; ++x)
        glgth[y][x] = Taş.yok;
    sayaçlar[Yön.Beyaz].say = sayaçlar[Yön.Siyah].say = 0;
    sayaçlar[Yön.Beyaz].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: ""}));
    sayaçlar[Yön.Siyah].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: ""}));
    oyun_yükle(th, glgth);
  };

  function siyah_seç(e) {
    if (sıra == 'beyazda') return;
    if (seçim_sabit)   return;
    if (sıra == 'N/A') sıra = 'siyahta';
    alan_seç(e);
  }

  function alan_seç(e) {
    if (alan.length) {
      if (e.target.dataset.x == from.dataset.x && e.target.dataset.y == from.dataset.y)
        return;
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

  function beyaz_seç(e) {
    if (sıra == 'siyahta') return;
    if (seçim_sabit)   return;
    if (sıra == 'N/A') sıra = 'beyazda';
    alan_seç(e);
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

  function kare_seç(e) {
    if (!taş_seçili) return;
    if (glgth[+e.target.dataset.y][+e.target.dataset.x] != Taş.yok)  // boş karede zaten taş 'yok'tur fakat bir şekilde
      return;                                                        // taş olan kareye tıklamayı becermişse oyuncu... 

    let to = { x: +e.target.dataset.x, y: +e.target.dataset.y };

    sıra == 'beyazda' ? devinim(Yön.Beyaz, Taş.Byz, '8') : devinim(Yön.Siyah, Taş.Syh, '1');

    function devinim(yön, renk, dama_satırı) {
      const [devindi, taş_aldı, dama_yön] = taş_devindir(from, to, yön);
      if (!devindi)  return;  // console.log(glgth);
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
          return;
        }
      }

      seçim_sabit = false;
      sıra = (yön == Yön.Beyaz ? 'siyahta' : 'beyazda');
      marker_unset();
      th.querySelector(`line#${Yağı[yön] == Taş.Syh ? 'siyah' : 'beyaz'}`).setAttribute('visibility', 'visible');
      th.querySelector(`line#${renk == Taş.Byz ? 'beyaz' : 'siyah'}`).setAttribute('visibility', 'hidden');
      if (from.dataset.dama == '0' && from.dataset.y == dama_satırı) {
        from.dataset.dama = '1';
        dama_çiz(from, renk);
      }
      oyun_kaydet(th, sıra, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say);
    
      if (al=alır_mı(...(sıra=='siyahta' ? ['#siyahlar', Yön.Siyah] : ['#beyazlar', Yön.Beyaz]))) {
        const seç = alan.pop();
        marker_set(from=th.querySelector(`g g circle[data-x="${seç.x}"][data-y="${seç.y}"]`));
        seçili_alım = seç.alım;
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
    } /* devinim */

  } /* kare_seç */

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
    if (glgth[y][x-2] == Taş.yok && glgth[y][x-1] == Yağı[yön]) {
      glgth[y][x-1] = Taş.yok;
      // özyinelemeli çağrılarda alım konum bilgileri gerekli değil, yalnızca alım sayısı
      [rv] = alım_olası(x-2, y, yön);
      if (rv+1 > say) {
        say = rv+1;
        alım.length = 0;
        alım.push({alınan_x: x-1, alınan_y: y, alan_yeni_x: x-2, alan_yeni_y: y});
      }
      else if (rv+1 == say) alım.push({alınan_x: x-1, alınan_y: y, alan_yeni_x: x-2, alan_yeni_y: y});
      glgth[y][x-1] = Yağı[yön];
    }
    if (glgth[y][x+2] == Taş.yok && glgth[y][x+1] == Yağı[yön]) {
      glgth[y][x+1] = Taş.yok;
      [rv] = alım_olası(x+2, y, yön);
      if (rv+1 > say) {
        say = rv+1;
        alım.length = 0;
        alım.push({alınan_x: x+1, alınan_y: y, alan_yeni_x: x+2, alan_yeni_y: y});
      }
      else if (rv+1 == say) alım.push({alınan_x: x+1, alınan_y: y, alan_yeni_x: x+2, alan_yeni_y: y});
      glgth[y][x+1] = Yağı[yön];
    }
    if (glgth[y+(2*yön)]?.[x] == Taş.yok && glgth[y+yön]?.[x] == Yağı[yön]) {
      glgth[y+yön][x] = Taş.yok;
      [rv] = alım_olası(x, y+(2*yön), yön);
      if (rv+1 > say) {
        say = rv+1;
        alım.length = 0;
        alım.push({alınan_x: x, alınan_y: y+yön, alan_yeni_x: x, alan_yeni_y: y+(2*yön)});
      }
      else if (rv+1 == say) alım.push({alınan_x: x, alınan_y: y+yön, alan_yeni_x: x, alan_yeni_y: y+(2*yön)});
      glgth[y+yön][x] = Yağı[yön];
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
      else {    /* taş alma atılımı */
        for (let i=0; i<seçili_alım.length; ++i)
          if (to.y == seçili_alım[i].alan_yeni_y && to.x == seçili_alım[i].alan_yeni_x) {
            glgth[seçili_alım[i].alınan_y][seçili_alım[i].alınan_x] = Taş.yok;
            th.querySelector(`g g circle[data-x="${seçili_alım[i].alınan_x}"][data-y="${seçili_alım[i].alınan_y}"]`).remove();
            devin();
            return [true,true,];
          }
        return [false,,];  // bu devinim olası değil.
      }

    /* dama taş */
    if (!al && (
        (y == to.y && arası_kaç_yağı_yatay() === 0) ||
        (x == to.x && arası_kaç_yağı_düşey() === 0))) {
      devin();
      return [true,false,];
    }
    else { /* taş alma atılımı */
      for (let i=0; i<seçili_alım.length; ++i)
        if (to.y == seçili_alım[i].alan_yeni_y && to.x == seçili_alım[i].alan_yeni_x) {
          glgth[seçili_alım[i].alınan_y][seçili_alım[i].alınan_x] = Taş.yok;
          th.querySelector(`g g circle[data-x="${seçili_alım[i].alınan_x}"][data-y="${seçili_alım[i].alınan_y}"]`).remove();
          devin();
          return [true,true,seçili_alım[i].dama_yön];
        }
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
    }

  } /* taş_devindir */

} /* oyna */
