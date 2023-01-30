/*---------------------------------------------------------------------------
 * Telif Hakkı/Copyright A. Alper Atıcı. Her Hakkı Saklıdır.
 * All Rights Reserved. This is not free software.
 *---------------------------------------------------------------------------*/
import * as Dama from './dama.js';

onload = () => {
  navigator.serviceWorker.register('/dama/serw.js', { scope: '/dama'});
  const beyaz_sayaç = new EventTarget();
  const siyah_sayaç = new EventTarget();
  let beyaz_onlu=false, siyah_onlu=false;
  beyaz_sayaç.addEventListener('taş-aldı', e => {
    if (!beyaz_onlu && +e.detail > 9) {
      document.querySelector('#beyazskor svg text').setAttribute('x', '1.75');
      beyaz_onlu = true;
    }
    document.querySelector('#beyazskor svg text').textContent = e.detail;
    if (+e.detail == 16) {
      document.querySelector('#framanim').setAttribute('visibility', 'visible');
      document.querySelector('#anim1').beginElement();
    }
  });
  siyah_sayaç.addEventListener('taş-aldı', e => {
    if (!siyah_onlu && +e.detail > 9) {
      document.querySelector('#siyahskor svg text').setAttribute('x', '1.75');
      siyah_onlu = true;
    }
    document.querySelector('#siyahskor svg text').textContent = e.detail;
    if (+e.detail == 16) {
      document.querySelector('#framanim').setAttribute('visibility', 'visible');
      document.querySelector('#anim1').beginElement();
    }
  });
  const th = document.querySelector('object').contentDocument;
  document.querySelector('#yeni').addEventListener('click', Dama.oyna(th, beyaz_sayaç, siyah_sayaç, 'taş-aldı'));
  document.querySelector('#yeni').addEventListener('click', () => {
    document.querySelector('#beyazskor svg text').setAttribute('x', '6');
    document.querySelector('#siyahskor svg text').setAttribute('x', '6');
    beyaz_onlu = siyah_onlu = false;
    document.querySelector('#oyuncu').children[0].children[0].attributes[0].value = './img/icons.svg#cpu';
    document.querySelector('#anim1').endElement();
    document.querySelector('#framanim').setAttribute('visibility', 'hidden');
  });

  if (!Dama.makina.aktif)
    document.querySelector('#oyuncu').children[0].children[0].attributes[0].value = './img/icons.svg#person';

  document.querySelector('#oyuncu').addEventListener('click', e => {
    Dama.oyuncu_değiştir();
    e.currentTarget.children[0].children[0].attributes[0].value = Dama.makina.aktif ? './img/icons.svg#cpu' :
                                                                                      './img/icons.svg#person';
  });
  document.querySelector('#çevir').addEventListener('click', Dama.tahta_çevir(th));
  document.querySelector('#çevir').addEventListener('click', (() => {
    const frm = document.querySelector('div.çerçeve');
    const levha = ['#beyazskor', '#siyahskor'];
    let alttaki=0, üstteki=1;
    return function() {
      frm.appendChild(frm.replaceChild(document.querySelector(`${levha[alttaki]}`),
                                       document.querySelector(`${levha[üstteki]}`))
                     );
      [üstteki,alttaki] = [alttaki,üstteki];
    };
  })());
  document.querySelector('#çgör').addEventListener('click', Dama.çerçeve_gör(th));
  document.querySelector('#çgör').addEventListener('click', (() => {
    const ikon = ['./img/icons.svg#arrows-angle-expand', './img/icons.svg#arrows-angle-contract'];
    let şimdi=0, önceki=1;
    return function(e) {
      [şimdi,önceki] = [önceki,şimdi];
      e.currentTarget.children[0].children[0].attributes[0].value = ikon[şimdi];
    };
  })());
  document.querySelector('#çutaşı').addEventListener('click', (() => {
    const ikon = [{yatay: './img/icons.svg#arrow-bar-right', düşey: './img/icons.svg#arrow-bar-down'},
                  {yatay: './img/icons.svg#arrow-bar-left', düşey: './img/icons.svg#arrow-bar-up'}];
    const konum = ['solüst', 'sağalt'];
    let şimdi=0, önceki=1;
    return function(e) {
      [şimdi,önceki] = [önceki,şimdi];
      e.currentTarget.children[0].children[0].attributes[0].value = ikon[şimdi].yatay;
      e.currentTarget.children[1].children[0].attributes[0].value = ikon[şimdi].düşey;
      document.querySelector('main').className = konum[şimdi];
    };
  })());
};
