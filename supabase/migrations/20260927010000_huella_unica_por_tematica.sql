-- La anti-repetición es por temática: la misma palabra puede existir en
-- "animales" y en "general".
alter table contenidos drop constraint contenidos_juego_idioma_huella_key;
alter table contenidos add constraint contenidos_huella_unica
  unique (juego, idioma, tematica, huella);
