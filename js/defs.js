/*---------------------------------------------------------------------------
 * Telif Hakkı/Copyright A. Alper Atıcı. Her Hakkı Saklıdır.
 * All Rights Reserved. This is not free software.
 *---------------------------------------------------------------------------*/
const Taş = { yok: 9, Syh: 13, Byz: 17, Yoz: 0, Dama: 1 };
const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Karşı = {[Yön.Beyaz]: Yön.Siyah, [Yön.Siyah]: Yön.Beyaz};

export { Taş, Yön, Karşı };
