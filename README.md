1. Sebutkan library apa saja yang dipakai, website library itu dimana, dan dokumentasi library itu ada dimana.

Library | Website | Documentation
--- | --- | ---
jQuery | [jquery.com](https://jquery.com) | [api.jquery.com](http://api.jquery.com)
jQuery UI | [jqueryui.com](https://jqueryui.com) | [api.jqueryui.com](http://api.jqueryui.com)
Underscore JS | [underscorejs.org](http://underscorejs.org) | [underscorejs.org](http://underscorejs.org)
Backbone JS | [backbonejs.org](http://backbonejs.org) | [backbonejs.org](http://backbonejs.org)

2. Aplikasi itu 'laggy'. Kenapa? Bagaimana cara membuat animasi lebih 'smooth'?

> Karena animasi aplikasi tersebut berjalan dalam 10fps. dengan meningkatkan fps nya, 30-60 fps cukup bagus, saya ubah fpsnya menjadi 60fps dengan meningkatkan frekuensi iterasi animasinya

3. Aplikasi itu tidak akan jalan di salah satu 3 browser populer (Chrome, Firefox, Internet Explorer)? Kenapa? Solusinya hanya menghapus satu character di code, character yang mana?    

> Internet Explorer, karena ada extra koma di typer.js line 141 (sebelum file diubah), Internet Explorer terkenal cukup strict tanpa toleransi untuk hal semacam ini

4. Implementasikan tombol Start, Stop, Pause, dan Resume.   

> Start dan Resume disatukan karena memiliki fungsi yang mirip. Diasumsikan stop = menyelesaikan game dan mereset score ke awal. Text input disabled saat game tidak berjalan (pause dan stop)

5. Ketika ukuran window dirubah, susunan huruf yang 'terbentur' batas window menjadi tidak 1 baris. Benarkan.    

> pada wordview: float left menjadi display:inline-block. pada typerview whitespace:no-wrap

6. Implementasikan sistem score.

> asumsi: setiap kata di layar yg berhasil dihilangkan -> score +1

7. Implementasikan hukuman berupa pengurangan nilai bila salah ketik.

> asumsi: setiap salah ketik -> score -1 dan text input direset