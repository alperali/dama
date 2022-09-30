const Yön = {B: 0, K: 1, D: 2, G: 3, Beyaz: 1, Siyah: -1 };
const Yağı = {[Yön.Beyaz]: 'siyah', [Yön.Siyah]: 'beyaz'};

export { tahta_çevir, çerçeve_gör } from './gorsel.js';
import { oyun_yükle, tahta_çiz, oyun_kaydet, dama_çiz } from './gorsel.js';

export
function oyna(th) {
  let sıra_siyahta=true, sıra_beyazda=true;
  let marker = th.querySelector('path');
  th.querySelectorAll('g')[1].addEventListener('click', kare_seç);
  th.querySelectorAll('g')[2].addEventListener('click', siyah_seç);
  th.querySelectorAll('g')[3].addEventListener('click', beyaz_seç);
  let from, seçim_sabit=false, taş_seçili=false, al=false;

  tahta_çiz(th);
  let sıra = oyun_yükle(th);
  if (sıra == 'beyazda') {
    sıra_siyahta = false;
    th.querySelector('line#beyaz').setAttribute('visibility', 'visible');
  }
  if (sıra == 'siyahta') {
    sıra_beyazda = false;
    th.querySelector('line#siyah').setAttribute('visibility', 'visible');
  }
  // sıra == 'N/A' ise ikisi de true kalsın

  return function yeni_oyun() {
    localStorage.removeItem('damalper');
    marker.setAttribute('visibility', 'hidden');
    th.querySelector('line#siyah').setAttribute('visibility', 'hidden');
    th.querySelector('line#beyaz').setAttribute('visibility', 'hidden');
    sıra_beyazda = sıra_siyahta = true;
    seçim_sabit = taş_seçili = al = false;
    th.querySelectorAll('g')[2].replaceChildren();
    th.querySelectorAll('g')[3].replaceChildren();
    for (let r of th.querySelectorAll('g g rect'))
      r.dataset.taş = 'yok';
    oyun_yükle(th);
  };

  function siyah_seç(e) {
    if (!sıra_siyahta) return;
    if (seçim_sabit)   return;
    sıra_beyazda = false;  // oyun başında gerekli sadece
    marker_set(from=e.target);
  }

  function beyaz_seç(e) {
    if (!sıra_beyazda) return;
    if (seçim_sabit)   return;
    sıra_siyahta = false;  // oyun başında gerekli sadece
    marker_set(from=e.target);
  }

  function marker_set(m) {
    marker.setAttribute('transform', `translate(${(m.dataset.x-1)*54},${(8-m.dataset.y)*54})`);
    marker.setAttribute('visibility','visible');
    marker.children[0].beginElement();
    taş_seçili = true;
  }

  function kare_seç(e) {
    if (!taş_seçili) return;
    if (e.target.dataset.taş !== 'yok')  // boş karede zaten taş 'yok'tur fakat bir şekilde
      return;                            // taş olan kareye tıklamayı becermişse oyuncu... 
    
    let seçilen_taşın_karesi = th.querySelector(`g g rect[data-x="${from.dataset.x}"][data-y="${from.dataset.y}"]`);
    let to = { x: +e.target.dataset.x, y: +e.target.dataset.y };
    if (sıra_beyazda) {
      const [devindi, taş_aldı, dama_yön] = taş_devindir(from, to, Yön.Beyaz);
      if (devindi) {
        e.target.dataset.taş = 'beyaz';
        seçilen_taşın_karesi.dataset.taş = 'yok';
        if (taş_aldı && (al=daha_alır_mı(Yön.Beyaz, dama_yön))) {
          marker_set(from);
          seçim_sabit = true;
        }
        else {
          sıra_beyazda = taş_seçili = seçim_sabit = false;
          sıra_siyahta = true;
          marker.setAttribute('visibility','hidden');
          th.querySelector('line#siyah').setAttribute('visibility', 'visible');
          th.querySelector('line#beyaz').setAttribute('visibility', 'hidden');
          if (from.dataset.dama == '0' && from.dataset.y == '8') {
            from.dataset.dama = '1';
            dama_çiz(from, 'beyaz');
            // from.setAttribute('stroke-dasharray','none');
            // from.setAttribute('stroke-width', '2');
            // from.setAttribute('fill', 'url(#beyazdama)');
          }
          oyun_kaydet(th, 'siyahta');
        }
      }
    }
    else {  /* sıra siyahta */
      const [devindi, taş_aldı, dama_yön] = taş_devindir(from, to, Yön.Siyah);
      if (devindi) {
        e.target.dataset.taş = 'siyah';
        seçilen_taşın_karesi.dataset.taş = 'yok';
        if (taş_aldı && (al=daha_alır_mı(Yön.Siyah, dama_yön))) {
          marker_set(from);
          seçim_sabit = true;
        }
        else {
          sıra_siyahta = taş_seçili = seçim_sabit = false;
          sıra_beyazda = true;
          marker.setAttribute('visibility','hidden');
          th.querySelector('line#siyah').setAttribute('visibility', 'hidden');
          th.querySelector('line#beyaz').setAttribute('visibility', 'visible');
          if (from.dataset.dama == '0' && from.dataset.y == '1') {
            from.dataset.dama = '1';
            dama_çiz(from, 'siyah');
            // from.setAttribute('stroke-dasharray','none');
            // from.setAttribute('stroke', 'dimgray');
            // from.setAttribute('fill', 'url(#siyahdama)');
          }
          oyun_kaydet(th, 'beyazda');
        }
      }
    }

    function daha_alır_mı(yön, dama_yön) {
      if (from.dataset.dama == '1')
        return daha_alır_mı_dama(yön, dama_yön);
      if (
        (th.querySelector(`g g rect[data-x="${+from.dataset.x-2}"][data-y="${+from.dataset.y}"]`)?.dataset.taş == 'yok' &&
         th.querySelector(`g g rect[data-x="${+from.dataset.x-1}"][data-y="${+from.dataset.y}"]`).dataset.taş == Yağı[yön]) ||
        (th.querySelector(`g g rect[data-x="${+from.dataset.x+2}"][data-y="${+from.dataset.y}"]`)?.dataset.taş == 'yok' &&
         th.querySelector(`g g rect[data-x="${+from.dataset.x+1}"][data-y="${+from.dataset.y}"]`).dataset.taş == Yağı[yön]) ||
        (th.querySelector(`g g rect[data-x="${+from.dataset.x}"][data-y="${+from.dataset.y+(2*yön)}"]`)?.dataset.taş == 'yok' &&
         th.querySelector(`g g rect[data-x="${+from.dataset.x}"][data-y="${+from.dataset.y+yön}"]`).dataset.taş == Yağı[yön])
      )
        return true;
      else
        return false;
    }

    function daha_alır_mı_dama(yön, dama_yön) {
      // dama_yön: damanın, son taşı alırken hangi yönde atılım yaptığı. Bu yönün
      //           tam tersinde taş almaya devam edemez.
      let t, x=[-1,0,1,0], y=[0,1,0,-1], ters_yön=[Yön.D, Yön.G, Yön.B, Yön.K];
      for (let d=Yön.B; d<=Yön.G; ++d)
        for (let i=1, buldu=false; t=th.querySelector(`g g rect[data-x="${+from.dataset.x + x[d]*i}"][data-y="${+from.dataset.y + y[d]*i}"]`); ++i)
          if (t.dataset.taş == Yağı[yön])
            if (buldu) break; /* yanyana iki yağı taş */
            else buldu = true;
          else if (t.dataset.taş == 'yok')
            if (buldu && ters_yön[dama_yön] != d)  return true;
            else continue;
          else break; /* kendiyle aynı renk taş */

      return false;
    }

  } /* kare_seç */

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
        let av;
        if (y == to.y && to.x == x-2 &&
            (av=th.querySelector(`g g rect[data-x="${x-1}"][data-y="${y}"]`)).dataset.taş === Yağı[yön]) {
            av.dataset.taş = 'yok';
            th.querySelector(`g g circle[data-x="${x-1}"][data-y="${y}"]`).remove();
            yatay_devinim();
            return [true,true,];
        }
        else if (y == to.y && to.x == x+2 &&
            (av=th.querySelector(`g g rect[data-x="${x+1}"][data-y="${y}"]`)).dataset.taş === Yağı[yön]) {
            av.dataset.taş = 'yok';
            th.querySelector(`g g circle[data-x="${x+1}"][data-y="${y}"]`).remove();
            yatay_devinim();
            return [true,true,];
        }
        else if (x == to.x && to.y == y+(2*yön) &&
            (av=th.querySelector(`g g rect[data-x="${x}"][data-y="${y+yön}"]`)).dataset.taş === Yağı[yön]) {
            av.dataset.taş = 'yok';
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
