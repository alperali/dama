/*---------------------------------------------------------------------------
 * Telif Hakkı/Copyright A. Alper Atıcı. Her Hakkı Saklıdır.
 * All Rights Reserved. This is not free software.
 *---------------------------------------------------------------------------*/
import * as Dama from './dama.js';

onload = () => {
  const beyaz_sayaç = new EventTarget();
  const siyah_sayaç = new EventTarget();
  const bağ_durum = new EventTarget();
  let beyaz_onlu=false, siyah_onlu=false;
  let bağlı = false, bağlanıyor = false;
  beyaz_sayaç.addEventListener('taş-aldı', e => {
    if (!beyaz_onlu && +e.detail > 9) {
      document.querySelector('#beyazskor svg text').setAttribute('x', '1.75');
      beyaz_onlu = true;
    }
    document.querySelector('#beyazskor svg text').textContent = e.detail;
    if (+e.detail == 16) {
      document.querySelector('#yeni').classList.add('oyun-sonu');
    }
  });
  siyah_sayaç.addEventListener('taş-aldı', e => {
    if (!siyah_onlu && +e.detail > 9) {
      document.querySelector('#siyahskor svg text').setAttribute('x', '1.75');
      siyah_onlu = true;
    }
    document.querySelector('#siyahskor svg text').textContent = e.detail;
    if (+e.detail == 16) {
      document.querySelector('#yeni').classList.add('oyun-sonu');
    }
  });
  const th = document.querySelector('object').contentDocument;
  document.querySelector('#yeni').addEventListener('click', Dama.başlat(th, beyaz_sayaç, siyah_sayaç, bağ_durum, 'taş-aldı'));
  document.querySelector('#yeni').addEventListener('click', () => {
    if (bağlı || bağlanıyor) return;
    document.querySelector('#beyazskor svg text').setAttribute('x', '6');
    document.querySelector('#siyahskor svg text').setAttribute('x', '6');
    beyaz_onlu = siyah_onlu = false;
    document.querySelector('#yeni').classList.remove('oyun-sonu');
  });

  if (!Dama.makina.aktif)
    document.querySelector('#oyuncu').children[0].children[0].attributes[0].value = './img/icons.svg#person';

  document.querySelector('#oyuncu').addEventListener('click', e => {
    if (bağlı || bağlanıyor)  return;
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

  document.querySelector('#çevrim').addEventListener('click', e => {
    if (bağlı || bağlanıyor) {
      Dama.kişi.kop();
      bağlı = bağlanıyor = false;
      e.currentTarget.classList.remove('bağlı');
      document.querySelector('#oyuncu svg').classList.remove('oyuncu-bağlı');
      e.currentTarget.children[0].children[0].attributes[0].value = './img/icons.svg#cloud-slash';
      document.querySelector('#anons').style.opacity="0";
    }
    else {
      document.querySelector('#yeni').click();
      if (Dama.makina.aktif)  document.querySelector('#oyuncu').click();
      e.currentTarget.children[0].children[0].attributes[0].value = './img/icons.svg#cloud';
      document.querySelector('#mesaj1').textContent = "Bağlanıyor...";
      document.querySelector('#mesaj2').textContent = '';
      document.querySelector('#anons').style.visibility="visible";
      document.querySelector('#anons').style.opacity="1";
      bağlanıyor = true;
      Dama.kişi.bağlan();
    }
  });

  document.querySelector('#anons').addEventListener('transitionend', e => {
    if (e.currentTarget.style.opacity == '0')
      e.currentTarget.style.visibility = 'hidden';
  }, true);

  bağ_durum.addEventListener('izlemci-bağlanma-hatası', e => {
    document.querySelector('#mesaj1').textContent = "İzlemci bağlanamadı.";
    document.querySelector('#mesaj2').textContent = e.detail;
    setTimeout(() => document.querySelector('#anons').style.opacity="0", 1500);
    bağlanıyor = false;
    document.querySelector('#çevrim').children[0].children[0].attributes[0].value = './img/icons.svg#cloud-slash';
  });
  bağ_durum.addEventListener('soket-hatası', () => {
    document.querySelector('#mesaj1').textContent = 'İzlemci soket hatası.';
    document.querySelector('#mesaj2').textContent = '';
    setTimeout(() => document.querySelector('#anons').style.opacity="0", 1500);
    bağlanıyor = false;
    document.querySelector('#çevrim').children[0].children[0].attributes[0].value = './img/icons.svg#cloud-slash';
  });
  bağ_durum.addEventListener('bağlandı', e => {
    if (e.detail) { // ben_başlarım
      document.querySelector('#mesaj1').textContent = 'Oyuna başlayın.';
      document.querySelector('#mesaj2').textContent = 'Bağlandı.';
    }
    else {
      document.querySelector('#mesaj1').textContent = 'Bağlandı, bekleyin.';
      document.querySelector('#mesaj2').textContent = 'Karşısı başlar.';
    }
    bağlı = true; bağlanıyor = false;
    document.querySelector('#çevrim').classList.add('bağlı');
    document.querySelector('#oyuncu svg').classList.add('oyuncu-bağlı');
  });
  bağ_durum.addEventListener('başladı', () => {
    document.querySelector('#anons').style.opacity="0";
  });
  bağ_durum.addEventListener('karşı-terk', () => {
    document.querySelector('#mesaj1').textContent = 'Karşısı terk etti.';
    document.querySelector('#mesaj2').textContent = '';
    document.querySelector('#anons').style.visibility="visible";
    document.querySelector('#anons').style.opacity="1";
    setTimeout(() => document.querySelector('#çevrim').click(), 2000);
  });
  bağ_durum.addEventListener('oda-boş', () => {
    if (bağlanıyor)  document.querySelector('#mesaj2').textContent = 'Oda boş.';
  });

};
