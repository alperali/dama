const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Yağı = {[Yön.Beyaz]: 'siyah', [Yön.Siyah]: 'beyaz'};

export { tahta_çevir, çerçeve_gör } from './gorsel.js';
import { oyun_yükle, tahta_çiz, oyun_kaydet, dama_çiz } from './gorsel.js';

export
function oyna(th, byz_sayaç, syh_sayaç, evnt) {
  const marker = th.querySelector('#marker');
  const alt_marker = [th.querySelector('#alan1'), th.querySelector('#alan2'), th.querySelector('#alan3')];
  th.querySelector('#kareler').addEventListener('click', kare_seç);
  th.querySelector('#siyahlar').addEventListener('click', siyah_seç);
  th.querySelector('#beyazlar').addEventListener('click', beyaz_seç);
  let from, sıra, seçim_sabit=false, taş_seçili=false, al=false, alan=[];
  const sayaçlar = {[Yön.Beyaz]: {sayaç: byz_sayaç, say: 0},
                    [Yön.Siyah]: {sayaç: syh_sayaç, say: 0}};

  tahta_çiz(th);

  [sıra, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say] = oyun_yükle(th);

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
    th.querySelectorAll('g')[2].replaceChildren();
    th.querySelectorAll('g')[3].replaceChildren();
    for (let r of th.querySelectorAll('g g rect'))
      r.dataset.taş = 'yok';
    sayaçlar[Yön.Beyaz].say = sayaçlar[Yön.Siyah].say = 0;
    sayaçlar[Yön.Beyaz].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: ""}));
    sayaçlar[Yön.Siyah].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: ""}));
    oyun_yükle(th);
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
          alt_marker_unset(i);
          alan[i].x = from.dataset.x; alan[i].y = from.dataset.y;
          marker_set(from=e.target);
          alt_marker_set(i);
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
    if (e.target.dataset.taş !== 'yok')  // boş karede zaten taş 'yok'tur fakat bir şekilde
      return;                            // taş olan kareye tıklamayı becermişse oyuncu... 
    
    let seçilen_taşın_karesi = th.querySelector(`g g rect[data-x="${from.dataset.x}"][data-y="${from.dataset.y}"]`);
    let to = { x: +e.target.dataset.x, y: +e.target.dataset.y };

    sıra == 'beyazda' ? devinim(Yön.Beyaz, 'beyaz', '8') : devinim(Yön.Siyah, 'siyah', '1');

    function devinim(yön, renk, dama_satırı) {
      const [devindi, taş_aldı, dama_yön] = taş_devindir(from, to, yön);
      if (!devindi)  return;
      e.target.dataset.taş = renk;
      seçilen_taşın_karesi.dataset.taş = 'yok';
      switch (alan.length) {
        case 3: alt_marker_unset(2);  // bilerek fall-through
        case 2: alt_marker_unset(1);
        case 1: alt_marker_unset(0);
        default: alan.length = 0;
      }
      if (taş_aldı) {
        ++sayaçlar[yön].say;
        sayaçlar[yön].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: sayaçlar[yön].say}));
        if (al=daha_alır_mı(yön, dama_yön)) {
          marker_set(from);
          seçim_sabit = true;
          return;
        }
      }

      seçim_sabit = false;
      sıra = (yön == Yön.Beyaz ? 'siyahta' : 'beyazda');
      marker_unset();
      th.querySelector(`line#${Yağı[yön]}`).setAttribute('visibility', 'visible');
      th.querySelector(`line#${renk}`).setAttribute('visibility', 'hidden');
      if (from.dataset.dama == '0' && from.dataset.y == dama_satırı) {
        from.dataset.dama = '1';
        dama_çiz(from, renk);
      }
      oyun_kaydet(th, sıra, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say);
    
      if (al=alır_mı(...(sıra=='siyahta' ? ['#siyahlar', Yön.Siyah] : ['#beyazlar', Yön.Beyaz]))) {
        const seç = alan.pop();
        marker_set(from=th.querySelector(`g g circle[data-x="${seç.x}"][data-y="${seç.y}"]`));
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
    alan.length = 0;
    for (const t of th.querySelector(g).children)
      if (t.dataset.dama == '1' ? alım_olası_dama(t, yön, Yön.yok) : alım_olası(t, yön))
        alan.push({x: t.dataset.x, y: t.dataset.y});
    return  alan.length > 0;
  }

  function daha_alır_mı(yön, dama_yön) {
    return (from.dataset.dama == '1' ? alım_olası_dama(from, yön, dama_yön) : alım_olası(from, yön));
  }

  function alım_olası(t, yön) {
    return (
      (th.querySelector(`g g rect[data-x="${+t.dataset.x-2}"][data-y="${+t.dataset.y}"]`)?.dataset.taş == 'yok' &&
        th.querySelector(`g g rect[data-x="${+t.dataset.x-1}"][data-y="${+t.dataset.y}"]`).dataset.taş == Yağı[yön]) ||
      (th.querySelector(`g g rect[data-x="${+t.dataset.x+2}"][data-y="${+t.dataset.y}"]`)?.dataset.taş == 'yok' &&
        th.querySelector(`g g rect[data-x="${+t.dataset.x+1}"][data-y="${+t.dataset.y}"]`).dataset.taş == Yağı[yön]) ||
      (th.querySelector(`g g rect[data-x="${+t.dataset.x}"][data-y="${+t.dataset.y+(2*yön)}"]`)?.dataset.taş == 'yok' &&
        th.querySelector(`g g rect[data-x="${+t.dataset.x}"][data-y="${+t.dataset.y+yön}"]`).dataset.taş == Yağı[yön])
    );
  }

  function alım_olası_dama(t, yön, dama_yön) {
    // dama_yön: damanın, son taşı alırken hangi yönde atılım yaptığı. Bu yönün
    //           tam tersinde taş almaya devam edemez. Yeni atılımda bu yön yoktur,
    //           Yön.yok değeri geçilir ve ters_yön[dama_yön] != d koşulu daima true olur.
    let kare, x=[-1,0,1,0], y=[0,1,0,-1], ters_yön=[Yön.D, Yön.G, Yön.B, Yön.K];
    for (let d=Yön.B; d<=Yön.G; ++d)
      for (let i=1, buldu=false; kare=th.querySelector(`g g rect[data-x="${+t.dataset.x + x[d]*i}"][data-y="${+t.dataset.y + y[d]*i}"]`); ++i)
        if (kare.dataset.taş == Yağı[yön])
          if (buldu) break; /* yanyana iki yağı taş */
          else buldu = true;
        else if (kare.dataset.taş == 'yok')
          if (buldu && ters_yön[dama_yön] != d)  return true;
          else continue;
        else break; /* kendiyle aynı renk taş */

    return false;
  }

  function taş_devindir(from, to, yön) {
    // devinirse [true, false,]
    // yağı taşı alarak devinirse [true, true,]
    // dama taş, yağı taşı alarak devinirse [true, true, Yön]
    // devinemezse [false,,]
    // döndürür.
    let x=+from.dataset.x, y=+from.dataset.y, dama=+from.dataset.dama;
    if (!dama) // yoz taş
      if (y == to.y && (to.x == x-1 || to.x == x+1) && !al) {
        yatay_devinim();
        return [true,false,];
      }
      else if (x == to.x && to.y == y+yön && !al) {
        düşey_devinim();
        return [true,false,];
      }
      else  {   /* taş alma atılımı */
        let yağı;
        if (y == to.y && to.x == x-2 &&
            (yağı=th.querySelector(`g g rect[data-x="${x-1}"][data-y="${y}"]`)).dataset.taş === Yağı[yön]) {
            yağı.dataset.taş = 'yok';
            th.querySelector(`g g circle[data-x="${x-1}"][data-y="${y}"]`).remove();
            yatay_devinim();
            return [true,true,];
        }
        else if (y == to.y && to.x == x+2 &&
            (yağı=th.querySelector(`g g rect[data-x="${x+1}"][data-y="${y}"]`)).dataset.taş === Yağı[yön]) {
            yağı.dataset.taş = 'yok';
            th.querySelector(`g g circle[data-x="${x+1}"][data-y="${y}"]`).remove();
            yatay_devinim();
            return [true,true,];
        }
        else if (x == to.x && to.y == y+(2*yön) &&
            (yağı=th.querySelector(`g g rect[data-x="${x}"][data-y="${y+yön}"]`)).dataset.taş === Yağı[yön]) {
            yağı.dataset.taş = 'yok';
            th.querySelector(`g g circle[data-x="${x}"][data-y="${y+yön}"]`).remove();
            düşey_devinim();
            return [true,true,];
        }
        else
          return [false,,];  // bu devinim olası değil.
      }

    /* dama taş */
    let yağı = { renk: Yağı[yön], x, y }; 
    if (y == to.y && arası_kaç_yağı_yatay(x, to.x, yağı) == 0 && !al) {
      yatay_devinim();
      return [true,false,];
    }
    else if (x == to.x && arası_kaç_yağı_düşey(y, to.y, yağı) == 0 && !al) {
      düşey_devinim();
      return [true,false,];
    }
    else { /* taş alma atılımı */
      if (y == to.y && arası_kaç_yağı_yatay(x, to.x, yağı) == 1) {
        th.querySelector(`g g rect[data-x="${yağı.x}"][data-y="${y}"]`).dataset.taş = 'yok';
        th.querySelector(`g g circle[data-x="${yağı.x}"][data-y="${y}"]`).remove();
        yatay_devinim();
        return [true,true,(yağı.x < x ? Yön.B : Yön.D)];
      }
      else if (x == to.x && arası_kaç_yağı_düşey(y, to.y, yağı) == 1) {
        th.querySelector(`g g rect[data-x="${x}"][data-y="${yağı.y}"]`).dataset.taş = 'yok';
        th.querySelector(`g g circle[data-x="${x}"][data-y="${yağı.y}"]`).remove();
        düşey_devinim();
        return [true,true,(yağı.y > y ? Yön.K : Yön.G)];
      }
      else
        return [false,,];  // bu devinim olası değil.
    }

    function arası_kaç_yağı_yatay(x, to_x, av) {
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
        else return -1;  /* arada kendiyle aynı renk taş var */
      }

      return say;
    }

    function arası_kaç_yağı_düşey(y, to_y, av) {
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
        else return -1;  /* arada kendiyle aynı renk taş var */
      }

      return say;
    }

    function yatay_devinim() {
      from.children[0].setAttribute('attributeName', 'cx');
      from.children[0].setAttribute('from', `${from.cx.baseVal.value}`);
      from.children[0].setAttribute('to', `${(to.x-x)*54 + from.cx.baseVal.value}`);
      from.dataset.x = to.x;
      from.setAttribute('cx', `${(to.x-x)*54 + from.cx.baseVal.value}`);
      from.children[0].beginElement();
    }
    function düşey_devinim() {
      from.children[0].setAttribute('attributeName', 'cy');
      from.children[0].setAttribute('from', `${from.cy.baseVal.value}`);
      from.children[0].setAttribute('to', `${(y-to.y)*54 + from.cy.baseVal.value}`);
      from.dataset.y = to.y;
      from.setAttribute('cy', `${(y-to.y)*54 + from.cy.baseVal.value}`);
      from.children[0].beginElement();
    }

  } /* taş_devindir */

} /* oyna */
