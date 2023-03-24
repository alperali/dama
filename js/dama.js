/*---------------------------------------------------------------------------
 * Telif Hakkı/Copyright A. Alper Atıcı. Her Hakkı Saklıdır.
 * All Rights Reserved. This is not free software.
 *---------------------------------------------------------------------------*/
export { tahta_çevir, çerçeve_gör } from './gorsel.js';
import { oyun_yükle, tahta_çiz, oyun_kaydet, dama_çiz } from './gorsel.js';

const Taş = { yok: 9, Syh: 13, Byz: 17, Yoz: 0, Dama: 1 };
const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Karşı = {[Yön.Beyaz]: Yön.Siyah, [Yön.Siyah]: Yön.Beyaz};
const C = {
           [Yön.Beyaz]: {sıra_göster: '#beyaz', dama_satırı: '8', taş_grup: '#beyazlar', taş_renk: Taş.Byz, yağı: Taş.Syh},
           [Yön.Siyah]: {sıra_göster: '#siyah', dama_satırı: '1', taş_grup: '#siyahlar', taş_renk: Taş.Syh, yağı: Taş.Byz}
          };

const makiwrk = new Worker('./js/makina.js');
const izlemci = new Worker('./js/izlemci.js');
let th, marker, alt_marker, glgth, sayaçlar, evnt, bağ_durum, taydaş, kanal, ice=[];
let from, yön, seçim_sabit=false, taş_seçili=false, al=false, alan=[], seçili_alım=[],
      beyazlar, siyahlar, bağlanıyor=false, bağlı=false, teklif_yapıldı=false, ben_başlarım=false;

// yön değişkeni atılım yönüne ek olarak sırayı da belirtir:
// yön == Yön.Beyaz ise sıra beyazda, Yön.Siyah ise sıra siyahta.

export let makina;
export const kişi = {
  kimlik: kimlik_üret(),
  bağlan: function() {
    bağlanıyor = true;
    izlemci.postMessage({msg: 'bağlan', id: this.kimlik});
  },
  kop: function() {
    if (bağlı)  kanal.send(JSON.stringify({msg: 'terk'}));
    izlemci.postMessage({msg: 'kop'});
    bağlı = bağlanıyor = teklif_yapıldı = ben_başlarım = false;
    taydaş?.close();
    ice.length = 0;
    taydaş = null;
  }
};

export
function oyuncu_değiştir() {
  if (makina.aktif)
    makina.aktif = 0;
  else {
    makina.aktif = 1;
    if (makina.yön == yön)
      makiwrk.postMessage({msg: 'oyna'});
  }

  oyun_kaydet(makina.aktif);
}

export
function başlat(pth, byz_sayaç, syh_sayaç, bağdur, pevt) {
  th = pth;
  evnt = pevt;
  bağ_durum = bağdur;
  marker = th.querySelector('#marker');
  alt_marker = [th.querySelector('#alan1'), th.querySelector('#alan2'), th.querySelector('#alan3')];
  sayaçlar = {[Yön.Beyaz]: {sayaç: byz_sayaç, say: 0},
              [Yön.Siyah]: {sayaç: syh_sayaç, say: 0}};

  glgth = tahta_çiz(th);
  th.querySelector('#kareler').addEventListener('click', kare_seç);
  th.querySelector('#siyahlar').addEventListener('click', siyah_seç);
  th.querySelector('#beyazlar').addEventListener('click', beyaz_seç);
  makiwrk.addEventListener('message', makina_mesaj_işle);
  izlemci.addEventListener('message', izlemci_mesaj_işle);
  
  [yön, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say, beyazlar, siyahlar, makina] = oyun_yükle(th, glgth);
  makiwrk.postMessage({msg: "oyun-yükle", glgth, beyazlar, siyahlar, makina});

  if (sayaçlar[Yön.Beyaz].say)
    sayaçlar[Yön.Beyaz].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: sayaçlar[Yön.Beyaz].say}));
  if (sayaçlar[Yön.Siyah].say)
    sayaçlar[Yön.Siyah].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: sayaçlar[Yön.Siyah].say}));

  // sayaç 0 ise tabelası boş kalsın

  if (yön != 'N/A') {
    th.querySelector(`line${C[yön].sıra_göster}`).setAttribute('visibility', 'visible');
    if (makina.aktif && (makina.yön == yön))
      makiwrk.postMessage({msg: 'oyna'});
    else
      alım_denetimi();
  }

  // yön == 'N/A' ise ikisi de hidden kalsın

  return function yeni_oyun() {
    if (bağlı || bağlanıyor)  return;
    localStorage.removeItem('damalper');
    marker_unset();
    switch (alan.length) {
      case 3: alt_marker_unset(2);  // falls through
      case 2: alt_marker_unset(1);  // falls through
      case 1: alt_marker_unset(0);  // falls through
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
    const durum_mak = makina.aktif;
    [yön, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say, beyazlar, siyahlar, makina] = oyun_yükle(th, glgth);
    makina.aktif = durum_mak;
    makiwrk.postMessage({msg: "oyun-yükle", glgth, beyazlar, siyahlar, makina});
  };
}

function kimlik_üret() {
  return String.fromCharCode(...crypto.randomUUID().replace(/-/g,'').match(/.{2}/g).map(e => parseInt(e,16)))+'dama';
}

function izlemci_mesaj_işle(e) {
  let yn;
  switch (e.data.msg) {
    case 'izlemci-bağlanma-hatası':
      bağ_durum.dispatchEvent(new CustomEvent('izlemci-bağlanma-hatası', {detail: e.data.neden}));
      bağlanıyor = false;
      break;
    case 'soket-hatası':
      bağ_durum.dispatchEvent(new CustomEvent('soket-hatası'));
      teklif_yapıldı = bağlanıyor = false;
      break;
    case 'soket-açıldı':
      taydaş = new RTCPeerConnection({'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]});
      taydaş.addEventListener('signalingstatechange', () => console.log(`signal state: ${taydaş.signalingState}`));
      taydaş.addEventListener('icecandidate', c => {
        if (c.candidate !== null) ice.push(c.candidate);
      });
      taydaş.addEventListener('icegatheringstatechange', () => {
        console.log(`ice state: ${taydaş.iceGatheringState}`);
        if (taydaş.iceGatheringState == 'complete' && !teklif_yapıldı) {
          // worker'a RTCSessionDescription ve RTCIceCandidate gönderilemiyor, o nedenle JSON.stringify yapıldı.
          izlemci.postMessage({msg: 'teklif-yap', sd: JSON.stringify(taydaş.localDescription), ice: JSON.stringify(ice)});
          teklif_yapıldı = true;
        }
      });
      taydaş.addEventListener('connectionstatechange', () => {
        console.log(`conn state: ${taydaş.connectionState}`);
        if (taydaş.connectionState == 'connected') {
          console.log('taydaşlar bağlı.');
          bağlı = true; bağlanıyor = false;
          izlemci.postMessage({msg: 'bağlandı'});
          bağ_durum.dispatchEvent(new CustomEvent('bağlandı', {detail: ben_başlarım}));
        }
      });

      kanal = taydaş.createDataChannel('dama', {negotiated: true, id: 335});
      (async () => await taydaş.createOffer().then(o => taydaş.setLocalDescription(o)))();

      kanal.addEventListener('message', k => {
        const r = JSON.parse(k.data);
        switch(r.msg) {
          case 'seç-byz':
            yön = kişi.yön = makina.yön = Yön.Siyah;
            makiwrk.postMessage({msg: 'seç-syh'});
            bağ_durum.dispatchEvent(new CustomEvent('başladı'));
            break;
          case 'seç-syh':
            yön = kişi.yön = makina.yön = Yön.Beyaz;
            makiwrk.postMessage({msg: 'seç-byz'});
            bağ_durum.dispatchEvent(new CustomEvent('başladı'));
            break;
          case 'devindir':
            alan_seç(th.querySelector(`circle[data-x="${r.x}"][data-y="${r.y}"]`));
            setTimeout(devinim, al && from.dataset.taş == Taş.Dama ? 750 : 500, r.to, C[yön].dama_satırı);
            // devinim(r.to, C[yön].dama_satırı);
            break;
          case 'terk':
            bağlı = false;
            bağ_durum.dispatchEvent(new CustomEvent('karşı-terk'));
            break;
          default:
            console.log('kanal: bilinmeyen mesaj geldi.')
        }
      });
      break;
    case 'teklif-geldi':
      yn = e.data.yn;
      taydaş.setRemoteDescription(new RTCSessionDescription(yn.offer.sd)).then(async () => {
        for (const i of yn.offer.ice)
          await taydaş.addIceCandidate(i);
        taydaş.createAnswer().then(a => taydaş.setLocalDescription(a)).then(() => {
          izlemci.postMessage({msg: 'yanıt-ver', to_peer_id: yn.peer_id, offer_id: yn.offer_id,
                               answer: JSON.stringify({ sd: taydaş.localDescription, ice})});
        });
      });
      if (teklif_yapıldı)
        // teklif yapmışım, sonra bana teklif gelmiş, demek ki daha erken sisteme giren benim, o halde ben başlarım.
        ben_başlarım = true;
      break;
    case 'yanıt-geldi':
      yn = e.data.yn;
      taydaş.setRemoteDescription(new RTCSessionDescription(yn.answer.sd)).then(async () => {
        for (const i of yn.answer.ice)
          await taydaş.addIceCandidate(i);
      });
      break;
    case 'oda-boş':
      bağ_durum.dispatchEvent(new CustomEvent('oda-boş'));
      break;
    default:
      console.log('izlemci_mesaj_işle: bilinmeyen mesaj geldi.');
  }
}

function makina_mesaj_işle(e) {
  switch (e.data.msg) {
    case 'devindir':
      from = th.querySelector(`circle[data-x="${e.data.dn.k.x}"][data-y="${e.data.dn.k.y}"]`);
      marker_set(from);
      if (e.data.dn.alım) {
        seçili_alım = e.data.dn.alım;
        al = e.data.dn.alım[0].sonra.length ? true : false;
      }
      else {
        al = false;
        seçili_alım.length = 0;
      }
      setTimeout(devinim, al && from.dataset.taş == Taş.Dama ? 750 : 500, e.data.dn.to, C[yön].dama_satırı);
      break;
    default:
      console.log('makina_mesaj_işle: bilinmeyen mesaj geldi.');
  }
}

function alım_denetimi() {
  if ((al=alır_mı(C[yön].taş_grup))) {
    const seçili_alan = alan.pop();
    marker_set(from=th.querySelector(`circle[data-x="${seçili_alan.x}"][data-y="${seçili_alan.y}"]`));
    seçili_alım = seçili_alan.alım;
    switch (alan.length) {
      // aşağıda break unutulmuş değil, bilerek fall-through
      case 3: alt_marker_set(2);  // falls through
      case 2: alt_marker_set(1);  // falls through
      case 1: alt_marker_set(0);  // falls through
        break;
      default:
        seçim_sabit = true;
    }
  }
}

function siyah_seç(e) {
  if (yön == Yön.Beyaz || bağlanıyor) return;
  if (bağlı && kişi.yön == Yön.Siyah) return;
  if (makina.aktif && makina.yön == Yön.Siyah) return;
  if (seçim_sabit) {
    alım_göster();
    return;
  }
  if (yön == 'N/A') {
    if (bağlı && !ben_başlarım)  return;
    yön = Yön.Siyah;
    kişi.yön = makina.yön = Yön.Beyaz;
    makiwrk.postMessage({msg: 'seç-byz'});
    if (bağlı) {
      kanal.send(JSON.stringify({msg: 'seç-byz'}));
      bağ_durum.dispatchEvent(new CustomEvent('başladı'));
    }
  }
  alan_seç(e.target);
}

function beyaz_seç(e) {
  if (yön == Yön.Siyah || bağlanıyor) return;
  if (bağlı && kişi.yön == Yön.Beyaz) return;
  if (makina.aktif && makina.yön == Yön.Beyaz) return;
  if (seçim_sabit) {
    alım_göster();
    return;
  }
  if (yön == 'N/A') {
    if (bağlı && !ben_başlarım)  return;
    yön = Yön.Beyaz;
    kişi.yön = makina.yön = Yön.Siyah;
    makiwrk.postMessage({msg: 'seç-syh'});
    if (bağlı) {
      kanal.send(JSON.stringify({msg: 'seç-syh'}));
      bağ_durum.dispatchEvent(new CustomEvent('başladı'));
    }
  }
  alan_seç(e.target);
}

function alan_seç(t) {
  // birden fazla alan varsa oyuncuya diğer alanı seçme imkanı verir,
  // tek alan varsa seçim_sabit true olacağından bu fonksiyon hiç çağrılmaz,
  // alan yoksa alan.length sıfır olacağından sadece marker_set()'i çağırır.
  // (seçili_alan diye bir global yok, fakat seçilmiş alan from.dataset.x, 
  // from.dataset.y ve seçili_alım üçlüsüyle temsil edilir).
  if (alan.length) {
    if (t.dataset.x == from.dataset.x && t.dataset.y == from.dataset.y) {
      alım_göster();
      return;
    }
    for (let i=0; i < alan.length; ++i)
      if (t.dataset.x == alan[i].x && t.dataset.y == alan[i].y) {
        const tmp_alım = alan[i].alım;
        alt_marker_unset(i);
        alan[i].x = from.dataset.x; alan[i].y = from.dataset.y; alan[i].alım = seçili_alım;
        marker_set(from=t);
        alt_marker_set(i);
        seçili_alım = tmp_alım;
      }
  }
  else
    marker_set(from=t);
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
  if ((makina.aktif && (makina.yön == yön)) || (bağlı && (kişi.yön == yön)))
    return;
  if (!taş_seçili || bağlanıyor) return;
  if (glgth[+e.target.dataset.y][+e.target.dataset.x] != Taş.yok)  // boş karede zaten taş 'yok'tur fakat bir şekilde
    return;                                                        // taş olan kareye tıklamayı becermişse oyuncu... 

  const to = { x: +e.target.dataset.x, y: +e.target.dataset.y };

  devinim(to, C[yön].dama_satırı);
}

function devinim(to, dama_satırı) {
  const [devindi, taş_aldı, dama_yön] = taş_devindir(from, to);
  if (!devindi)  return;
  switch (alan.length) {
    case 3: alt_marker_unset(2);  // falls through
    case 2: alt_marker_unset(1);  // falls through
    case 1: alt_marker_unset(0);  // falls through
    default: alan.length = 0;
  }
  if (taş_aldı) {
    ++sayaçlar[yön].say;
    sayaçlar[yön].sayaç.dispatchEvent(new CustomEvent(evnt, {detail: sayaçlar[yön].say}));
    if (makina.aktif && makina.yön == yön && al) {
    // makina taş almış ve daha alırım demiş (al'ı true yapmış), buradan tekrar ona devredelim.
      makiwrk.postMessage({msg: 'oyna', al: true, dama_yön});
      return;
    }
    // else if (bağlı && kişi.yön == yön && al) {
      // kişi taş almış ve daha alırım demiş (al'ı true yapmış), buradan tekrar ona devredelim.
      // kişi.wrk.postMessage({msg: 'oyna', al: true, dama_yön});
      // return;
    // }
    else {
      // daha alır mı?
      [al, seçili_alım] = from.dataset.taş == Taş.Dama ? alım_olası_dama(+from.dataset.x, +from.dataset.y, dama_yön)
                                                       : alım_olası(+from.dataset.x, +from.dataset.y);
      if (al) {
        marker_set(from);
        seçim_sabit = true;
        return;
      }
    }
  }

  if (from.dataset.taş == Taş.Yoz && from.dataset.y == dama_satırı) {
    from.dataset.taş = Taş.Dama;
    dama_çiz(from, C[yön].taş_renk);
    makiwrk.postMessage({msg: 'dama-oldu', x: +from.dataset.x, y: +from.dataset.y, yön});
    // if (bağlı)  kişi.wrk.postMessage({msg: 'dama-oldu', x: +from.dataset.x, y: +from.dataset.y, yön});
  }

  seçim_sabit = false;
  marker_unset();
  th.querySelector(`line${C[yön].sıra_göster}`).setAttribute('visibility', 'hidden');
  th.querySelector(`line${C[Karşı[yön]].sıra_göster}`).setAttribute('visibility', 'visible');
  yön = Karşı[yön];
  oyun_kaydet(th, yön, sayaçlar[Yön.Beyaz].say, sayaçlar[Yön.Siyah].say, makina);
  if (makina.aktif && (makina.yön == yön))
    makiwrk.postMessage({msg: 'oyna'});
  // else if (bağlı && (kişi.yön == yön))
    // kişi.wrk.postMessage({msg: 'oyna'});
    // return;
  else
    alım_denetimi();
}

function alır_mı(g) {
  let say=0, alım, rv;
  alan.length = 0;
  for (const t of th.querySelector(g).children) {
    [rv, alım] = (t.dataset.taş == Taş.Dama ? alım_olası_dama(+t.dataset.x, +t.dataset.y, Yön.yok)
                                            : alım_olası(+t.dataset.x, +t.dataset.y));
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

function alım_olası(x, y) {
  let say=0, rv, alım=[];
  for (const [ax,ay,kx,ky] of [[x-1,y,x-2,y], [x+1,y,x+2,y], [x,y+yön,x,y+2*yön]])
    if (glgth[ky]?.[kx] == Taş.yok && glgth[ay]?.[ax] == C[yön].yağı) {
      glgth[ky][kx] = C[yön].taş_renk;
      glgth[y][x] = glgth[ay][ax] = Taş.yok;  // taşı almış gibi yap
      // özyinelemeli çağrılarda alım konum bilgileri gerekli değil, yalnızca alım sayısı
      [rv] = alım_olası(kx, ky);
      if (rv+1 > say) {
        say = rv+1;
        alım.length = 0;
        alım.push({alınan_x: ax, alınan_y: ay, alan_yeni_x: kx, alan_yeni_y: ky});
      }
      else if (rv+1 == say)
        alım.push({alınan_x: ax, alınan_y: ay, alan_yeni_x: kx, alan_yeni_y: ky});

      glgth[ay][ax] = C[yön].yağı;  // almış gibi yaptığın taşı geri yerine koy
      glgth[y][x] = C[yön].taş_renk;
      glgth[ky][kx] = Taş.yok;
    }
  return [say, alım];
}

function alım_olası_dama(x, y, dama_yön) {
  // dama_yön: damanın, son taşı alırken hangi yönde atılım yaptığı. Bu yönün
  //           tam tersinde taş almaya devam edemez. Yeni atılımda bu yön yoktur,
  //           Yön.yok değeri geçilir ve ters_yön[dama_yön] == d koşulu daima false olur.
  const rx=[-1,0,1,0], ry=[0,1,0,-1], ters_yön=[Yön.D, Yön.G, Yön.B, Yön.K];
  let kare, say=0, rv, alım=[];
  for (let d=Yön.B; d<=Yön.G; ++d) {
    if (ters_yön[dama_yön] == d) continue;
    for (let i=1, buldu=false; (kare=glgth[y+ry[d]*i]?.[x+rx[d]*i]); ++i)
      if (kare == C[yön].yağı)
        if (buldu) break; /* yanyana iki yağı taş */
        else buldu = true;
      else if (kare == Taş.yok)
        if (buldu) {
          glgth[y][x] = glgth[y+ry[d]*(i-1)][x+rx[d]*(i-1)] = Taş.yok;
          for (let j=i; glgth[y+ry[d]*j]?.[x+rx[d]*j] == Taş.yok; ++j) {
            glgth[y+ry[d]*j][x+rx[d]*j] = C[yön].taş_renk;
            [rv] = alım_olası_dama(x+rx[d]*j, y+ry[d]*j, d);
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
          glgth[y+ry[d]*(i-1)][x+rx[d]*(i-1)] = C[yön].yağı;
          glgth[y][x] = C[yön].taş_renk;
          break;
        }
        else continue;
      else break; /* kendiyle aynı renk taş */
  }
  return [say, alım];
}

function taş_devindir(from, to) {
  // devinirse [true, false,]
  // yağı taşı alarak devinirse [true, true,]
  // dama taş, yağı taşı alarak devinirse [true, true, Yön]
  // devinemezse [false,,]
  // döndürür.
  // yan etki: devinirse from.dataset'i değiştirir.
  let x=+from.dataset.x, y=+from.dataset.y;
  if (from.dataset.taş == Taş.Yoz)
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
        // if (bağlı && yön == Karşı[kişi.yön])  kişi.wrk.postMessage({msg: 'taş-al', x: seçili_alım[i].alınan_x, y: seçili_alım[i].alınan_y, yön});
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
      else if (glgth[y][i] == C[yön].yağı && ++say == 1) yağı_x = i;
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
      else if (glgth[i][x] == C[yön].yağı && ++say == 1) yağı_y = i;
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
    if (bağlı && yön == Karşı[kişi.yön])  kanal.send(JSON.stringify({msg: 'devindir', x, y, to, yön}));
  }

} /* taş_devindir */
