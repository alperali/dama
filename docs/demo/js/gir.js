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
  let bağlı = false, bağlanıyor = false, oyun_sonu = false;
  beyaz_sayaç.addEventListener('taş-aldı', e => {
    if (!beyaz_onlu && +e.detail > 9) {
      document.querySelector('#beyazskor svg text').setAttribute('x', '1.75');
      beyaz_onlu = true;
    }
    document.querySelector('#beyazskor svg text').textContent = e.detail;
    if (+e.detail == 16) {
      document.querySelector('#yeni svg').classList.add('oyun-sonu');
      oyun_sonu = true;
      ileti('beyaz-kazanır');
      document.querySelector('#anons').style.visibility="visible";
      document.querySelector('#anons').style.opacity="1";
    }
  });
  siyah_sayaç.addEventListener('taş-aldı', e => {
    if (!siyah_onlu && +e.detail > 9) {
      document.querySelector('#siyahskor svg text').setAttribute('x', '1.75');
      siyah_onlu = true;
    }
    document.querySelector('#siyahskor svg text').textContent = e.detail;
    if (+e.detail == 16) {
      document.querySelector('#yeni svg').classList.add('oyun-sonu');
      oyun_sonu = true;
      ileti('siyah-kazanır');
      document.querySelector('#anons').style.visibility="visible";
      document.querySelector('#anons').style.opacity="1";
    }
  });
  const th = document.querySelector('object').contentDocument;
  document.querySelector('#yeni').addEventListener('click', Dama.başlat(th, beyaz_sayaç, siyah_sayaç, bağ_durum, 'taş-aldı'));
  document.querySelector('#yeni').addEventListener('click', () => {
    if ((bağlı || bağlanıyor) && !oyun_sonu) return;
    document.querySelector('#beyazskor svg text').setAttribute('x', '6');
    document.querySelector('#siyahskor svg text').setAttribute('x', '6');
    beyaz_onlu = siyah_onlu = false;
    if (oyun_sonu) {
      document.querySelector('#yeni svg').classList.remove('oyun-sonu');
      document.querySelector('#anons').style.opacity="0";
      oyun_sonu = false;
    }
  });

  document.body.addEventListener('contextmenu', e => e.preventDefault());
  th.addEventListener('contextmenu', e => e.preventDefault());
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
      frm.appendChild(frm.replaceChild(document.querySelector(levha[alttaki]),
                                       document.querySelector(levha[üstteki]))
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
    ileti('demoda-yok');
    document.querySelector('#anons').style.visibility="visible";
    document.querySelector('#anons').style.opacity="1";
    setTimeout(() => document.querySelector('#anons').style.opacity="0", 1500);
    return;
    // eslint-disable-next-line no-unreachable
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
      ileti('bağlanıyor');
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

  bağ_durum.addEventListener('sinyalci-bağlanma-hatası', e => {
    ileti('sinyalci-bağlanma-hatası', e.detail);
    setTimeout(() => document.querySelector('#anons').style.opacity="0", 1500);
    bağlanıyor = false;
    document.querySelector('#çevrim').children[0].children[0].attributes[0].value = './img/icons.svg#cloud-slash';
  });
  bağ_durum.addEventListener('soket-hatası', () => {
    ileti('soket-hatası');
    setTimeout(() => document.querySelector('#anons').style.opacity="0", 1500);
    bağlanıyor = false;
    document.querySelector('#çevrim').children[0].children[0].attributes[0].value = './img/icons.svg#cloud-slash';
  });
  bağ_durum.addEventListener('bağlandı', e => {
    if (e.detail) { // teklif_yaptı
      ileti('bağlandı-teklifçi');
    }
    else {
      ileti('bağlandı-yanıtçı');
    }
    bağlı = true; bağlanıyor = false;
    document.querySelector('#çevrim').classList.add('bağlı');
    document.querySelector('#oyuncu svg').classList.add('oyuncu-bağlı');
  });
  bağ_durum.addEventListener('başladı', () => {
    document.querySelector('#anons').style.opacity="0";
  });
  bağ_durum.addEventListener('karşı-terk', () => {
    ileti('karşı-terk');
    document.querySelector('#anons').style.visibility="visible";
    document.querySelector('#anons').style.opacity="1";
    setTimeout(() => {
      document.querySelector('#çevrim').click();
      // giden oyuncu yerine makina geçsin
      document.querySelector('#oyuncu').click();
    }, 2000);
  });
  bağ_durum.addEventListener('oda-boş', () => {
    if (bağlanıyor)  ileti('oda-boş');
  });

  const ileti = (() => {
    let cari, dil1, dil2;
    const lng = navigator.language.slice(0,2).toLowerCase() != 'tr' ? 'en' : 'tr';
    dil1 = localStorage.getItem('dil') ?? (localStorage.setItem('dil', lng), lng);
    dil2 = (dil1 == 'en' ? 'tr' : 'en');
    document.querySelector('#anons').addEventListener('click', () => {
      [dil1, dil2] = [dil2, dil1];
      localStorage.setItem('dil', dil1);
      ileti(cari);
    });
    const m = {
      'beyaz-kazanır': {
        'tr': ['Beyaz kazanır.', ''],
        'en': ['White wins.', '']
      },
      'siyah-kazanır': {
        'tr': ['Siyah kazanır.', ''],
        'en': ['Black wins.', '']
      },
      'bağlanıyor': {
        'tr': ['Bağlanıyor...', ''],
        'en': ['Connecting...', '']
      },
      'sinyalci-bağlanma-hatası': {
        'tr': ['Sinyalci bağlanamadı.', ''],
        'en': ['Create socket failed.', '']
      },
      'soket-hatası': {
        'tr': ['Soket hatası.', ''],
        'en': ['Socket error.', '']
      },
      'bağlandı-teklifçi': {
        'tr': ['Oyuna başlayın.', 'Bağlandı.'],
        'en': ['You start.', 'Connected.']
      },
      'bağlandı-yanıtçı': {
        'tr': ['Bağlandı, bekleyin.', 'Karşısı başlar.'],
        'en': ['Connected, wait.', 'Opponent starts.']
      },
      'karşı-terk': {
        'tr': ['Karşısı terk etti.', ''],
        'en': ['Opponent left.', '']
      },
      'oda-boş': {
        'tr': ['Bağlanıyor...', 'Oda boş.'],
        'en': ['Connecting...', 'Room empty.']
      },
      'demoda-yok': {
        'tr': ['Demo’da yoktur.', ''],
        'en': ['Unavailable in demo.', '']
      }
    };
    return function (msg, p2, p1) {
      cari = msg;
      if (p1 != undefined)
        document.querySelector('#mesaj1').textContent = p1;
      else
        document.querySelector('#mesaj1').textContent = m[msg][dil1][0];
      if (p2 != undefined)
        document.querySelector('#mesaj2').textContent = p2;
      else
        document.querySelector('#mesaj2').textContent = m[msg][dil1][1];
    };
  })();
};
